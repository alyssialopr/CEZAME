import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, hasServiceRoleKey } from '../config/supabase.js';

const router = Router();

// Cache simple en mémoire pour éviter d'appeler listUsers à chaque requête d'événement
let userMapCache: Map<string, { email: string; username: string }> = new Map();
let cacheLastUpdated = 0;
const CACHE_TTL = 30000; // 30 secondes

async function getUserInfoMap(): Promise<Map<string, { email: string; username: string }>> {
  const now = Date.now();
  if (userMapCache.size > 0 && now - cacheLastUpdated < CACHE_TTL) {
    return userMapCache;
  }

  const map = new Map<string, { email: string; username: string }>();

  if (hasServiceRoleKey) {
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
      if (data?.users) {
        data.users.forEach((u) => {
          map.set(u.id, {
            email: u.email || 'Sans email',
            username: u.user_metadata?.username || u.email?.split('@')[0] || 'Apprenant',
          });
        });
      }
    } catch (err) {
      console.warn('Erreur lors du chargement des profils auth pour activity logs:', err);
    }
  }

  userMapCache = map;
  cacheLastUpdated = now;
  return map;
}

// 1. Liste paginée et filtrée des événements (Customer.io style stream)
router.get('/events', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(10, parseInt(String(req.query.limit || '30'), 10)));
    const offset = (page - 1) * limit;

    const userId = req.query.user_id ? String(req.query.user_id) : null;
    const eventType = req.query.event_type ? String(req.query.event_type) : null;
    const eventName = req.query.event_name ? String(req.query.event_name) : null;
    const search = req.query.search ? String(req.query.search).trim() : null;
    const startDate = req.query.start_date ? String(req.query.start_date) : null;
    const endDate = req.query.end_date ? String(req.query.end_date) : null;

    let query = supabaseAdmin
      .from('user_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }
    if (eventName) {
      query = query.eq('event_name', eventName);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (search) {
      query = query.or(`event_name.ilike.%${search}%,screen_name.ilike.%${search}%`);
    }

    const { data: rawEvents, count, error } = await query;

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const userMap = await getUserInfoMap();

    const enrichedEvents = (rawEvents || []).map((ev) => {
      const uInfo = ev.user_id ? userMap.get(ev.user_id) : null;
      return {
        ...ev,
        user_email: uInfo?.email || (ev.user_id ? `user-${ev.user_id.substring(0, 6)}` : 'Anonyme'),
        user_username: uInfo?.username || (ev.user_id ? `Apprenant_${ev.user_id.substring(0, 4)}` : 'Visiteur'),
      };
    });

    res.json({
      events: enrichedEvents,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    });
  } catch (err: any) {
    console.error('Erreur get events:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Métriques analytiques globales (Stats & Insights pour la phase de test)
router.get('/stats', requireAuth, async (_req: AuthenticatedRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    // 1. Total événements
    const { count: totalEvents } = await supabaseAdmin
      .from('user_events')
      .select('*', { count: 'exact', head: true });

    // 2. Événements aujourd'hui
    const { count: eventsToday } = await supabaseAdmin
      .from('user_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayIso);

    // 3. Récupérer un échantillon récent pour calculer l'ensemble des analytics
    const { data: recentEvents, error } = await supabaseAdmin
      .from('user_events')
      .select('event_type, event_name, screen_name, properties, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3000);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const screenCounts: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const activeUserSetToday = new Set<string>();
    const allUsersSet = new Set<string>();

    // Catégories
    const categoryClicks: Record<string, number> = {
      sante: 0,
      finance: 0,
      voiture: 0,
      logement: 0,
      administration: 0,
    };
    const userFirstCategory: Map<string, string> = new Map();

    // Entonnoir (Funnel)
    let lessonOpenedCount = 0;
    let quizStartedCount = 0;
    let lessonCompletedCount = 0;
    let lessonAbandonedTheory = 0;
    let lessonAbandonedQuiz = 0;

    // Exercices & Pédagogie
    const exerciseTypeStats: Record<string, { total: number; correct: number }> = {};
    const questionFailureStats: Record<string, { prompt: string; categoryId: string; total: number; failed: number }> = {};

    // Onboarding
    let onboardingStartedCount = 0;
    let onboardingCompletedCount = 0;

    // Temps de complétion
    let totalLessonDurationSeconds = 0;
    let durationCount = 0;

    // Leçons par utilisateur
    const userCompletedCount: Record<string, number> = {};

    // Parcourir les événements (ordre chronologique inverse pour les stats globales)
    const reversedEvents = [...(recentEvents || [])].reverse();

    reversedEvents.forEach((ev) => {
      const p = ev.properties || {};

      if (ev.user_id) {
        allUsersSet.add(ev.user_id);
        if (ev.created_at >= todayIso) {
          activeUserSetToday.add(ev.user_id);
        }
      }

      if (ev.screen_name) {
        screenCounts[ev.screen_name] = (screenCounts[ev.screen_name] || 0) + 1;
      }
      if (ev.event_name) {
        eventCounts[ev.event_name] = (eventCounts[ev.event_name] || 0) + 1;
      }
      if (ev.event_type) {
        typeCounts[ev.event_type] = (typeCounts[ev.event_type] || 0) + 1;
      }

      // 1. Catégories
      const cat = p.categoryId;
      if (cat && (ev.event_name === 'category_selected' || ev.event_name === 'lesson_opened' || ev.event_name === 'lesson_started')) {
        categoryClicks[cat] = (categoryClicks[cat] || 0) + 1;
        if (ev.user_id && !userFirstCategory.has(ev.user_id)) {
          userFirstCategory.set(ev.user_id, cat);
        }
      }

      // 2. Entonnoir Leçon -> Quiz -> Complétion
      if (ev.event_name === 'lesson_opened' || ev.event_name === 'lesson_started') {
        lessonOpenedCount++;
      } else if (ev.event_name === 'quiz_started') {
        quizStartedCount++;
      } else if (ev.event_name === 'lesson_completed') {
        lessonCompletedCount++;
        if (ev.user_id) {
          userCompletedCount[ev.user_id] = (userCompletedCount[ev.user_id] || 0) + 1;
        }
        if (typeof p.durationSeconds === 'number' && p.durationSeconds > 0) {
          totalLessonDurationSeconds += p.durationSeconds;
          durationCount++;
        }
      } else if (ev.event_name === 'lesson_abandoned') {
        if (p.stage === 'quiz') {
          lessonAbandonedQuiz++;
        } else {
          lessonAbandonedTheory++;
        }
      }

      // 3. Exercices & Difficulté
      if (ev.event_name === 'question_answered') {
        const type = p.exerciseType || 'qcm';
        if (!exerciseTypeStats[type]) {
          exerciseTypeStats[type] = { total: 0, correct: 0 };
        }
        exerciseTypeStats[type].total++;
        if (p.isCorrect) {
          exerciseTypeStats[type].correct++;
        } else {
          const qKey = p.prompt ? String(p.prompt).trim() : `Question_${p.questionIndex ?? 0}`;
          if (!questionFailureStats[qKey]) {
            questionFailureStats[qKey] = {
              prompt: qKey,
              categoryId: p.categoryId || 'général',
              total: 0,
              failed: 0,
            };
          }
          questionFailureStats[qKey].total++;
          questionFailureStats[qKey].failed++;
        }
      }

      // 4. Onboarding
      if (ev.event_name === 'onboarding_started') {
        onboardingStartedCount++;
      } else if (ev.event_name === 'onboarding_completed') {
        onboardingCompletedCount++;
      }
    });

    // Formattage des catégories avec libellés et couleurs officielles
    const categoryLabels: Record<string, { label: string; color: string }> = {
      sante: { label: 'Santé', color: '#91C85A' },
      finance: { label: 'Finance', color: '#DBBA3E' },
      voiture: { label: 'Voiture', color: '#8854E8' },
      logement: { label: 'Logement', color: '#E88D23' },
      administration: { label: 'Administration', color: '#607FE8' },
    };

    const totalCategoryClicks = Object.values(categoryClicks).reduce((a, b) => a + b, 0) || 1;
    const categoryStats = Object.entries(categoryClicks).map(([id, count]) => ({
      id,
      label: categoryLabels[id]?.label || id,
      color: categoryLabels[id]?.color || '#8FA6FF',
      count,
      percentage: Math.round((count / totalCategoryClicks) * 100),
    })).sort((a, b) => b.count - a.count);

    // First-pick categories
    const firstPickCounts: Record<string, number> = {};
    userFirstCategory.forEach((catId) => {
      firstPickCounts[catId] = (firstPickCounts[catId] || 0) + 1;
    });
    const firstPickStats = Object.entries(firstPickCounts).map(([id, count]) => ({
      id,
      label: categoryLabels[id]?.label || id,
      color: categoryLabels[id]?.color || '#8FA6FF',
      count,
    })).sort((a, b) => b.count - a.count);

    // Entonnoir
    const maxFunnel = Math.max(lessonOpenedCount, quizStartedCount, lessonCompletedCount, 1);
    const funnel = {
      opened: lessonOpenedCount,
      quizStarted: quizStartedCount,
      completed: lessonCompletedCount,
      abandonedTheory: lessonAbandonedTheory,
      abandonedQuiz: lessonAbandonedQuiz,
      // Taux clés
      transitionToQuizRate: lessonOpenedCount > 0 ? Math.round((quizStartedCount / lessonOpenedCount) * 100) : 0,
      completionRate: lessonOpenedCount > 0 ? Math.round((lessonCompletedCount / lessonOpenedCount) * 100) : 0,
      openedPercent: 100,
      quizStartedPercent: Math.round((quizStartedCount / maxFunnel) * 100),
      completedPercent: Math.round((lessonCompletedCount / maxFunnel) * 100),
    };

    // Performance par type d'exercice
    const exerciseTypeSuccess = Object.entries(exerciseTypeStats).map(([type, s]) => ({
      type,
      total: s.total,
      correct: s.correct,
      rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    // Questions les plus échouées
    const mostFailedQuestions = Object.values(questionFailureStats)
      .map((q) => ({
        prompt: q.prompt,
        categoryId: q.categoryId,
        failedCount: q.failed,
        failureRate: q.total > 0 ? Math.round((q.failed / q.total) * 100) : 100,
      }))
      .sort((a, b) => b.failedCount - a.failedCount)
      .slice(0, 5);

    // Engagement & moyennes
    const totalUsers = allUsersSet.size || 1;
    const avgLessonsPerUser = Math.round((lessonCompletedCount / totalUsers) * 10) / 10;
    const avgLessonMinutes = durationCount > 0 ? Math.round(totalLessonDurationSeconds / durationCount / 60 * 10) / 10 : 2.5;
    const onboardingRate = onboardingStartedCount > 0 ? Math.round((onboardingCompletedCount / onboardingStartedCount) * 100) : 100;

    const topScreens = Object.entries(screenCounts)
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const eventsByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalEvents: totalEvents || 0,
      eventsToday: eventsToday || 0,
      activeUsersToday: activeUserSetToday.size,
      totalUsers: allUsersSet.size,
      topScreens,
      topEvents,
      eventsByType,
      // Nouvelles métriques avancées
      categoryStats,
      firstPickStats,
      funnel,
      exerciseTypeSuccess,
      mostFailedQuestions,
      engagement: {
        avgLessonsPerUser,
        avgLessonMinutes,
        onboardingStarted: onboardingStartedCount,
        onboardingCompleted: onboardingCompletedCount,
        onboardingRate,
      },
    });
  } catch (err: any) {
    console.error('Erreur stats activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Chronologie détaillée d'un utilisateur spécifique (Customer.io user timeline)
router.get('/users/:userId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = String(req.params.userId);

    const { data: events, error } = await supabaseAdmin
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ events: events || [] });
  } catch (err: any) {
    console.error('Erreur timeline user:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
