export interface ActivityEvent {
  event_type?: string | null;
  event_name?: string | null;
  screen_name?: string | null;
  properties?: Record<string, any> | null;
  user_id?: string | null;
  created_at: string;
}

// Les clés viennent des événements envoyés par l'app (noms, prompts, types) :
// des objets sans prototype évitent qu'une clé comme "__proto__" pollue Object.prototype.
function dict<T>(): Record<string, T> {
  return Object.create(null);
}

export function aggregateActivity(events: ActivityEvent[], todayIso: string) {
  const screenCounts: Record<string, number> = dict();
  const eventCounts: Record<string, number> = dict();
  const typeCounts: Record<string, number> = dict();
  const activeUserSetToday = new Set<string>();
  const allUsersSet = new Set<string>();

  // Catégories
  const categoryClicks: Record<string, number> = Object.assign(dict<number>(), {
    sante: 0,
    finance: 0,
    voiture: 0,
    logement: 0,
    administration: 0,
  });
  const userFirstCategory: Map<string, string> = new Map();

  // Entonnoir (Funnel)
  let lessonOpenedCount = 0;
  let quizStartedCount = 0;
  let lessonCompletedCount = 0;
  let lessonAbandonedTheory = 0;
  let lessonAbandonedQuiz = 0;

  // Exercices & Pédagogie
  const exerciseTypeStats: Record<string, { total: number; correct: number }> = dict();
  const questionFailureStats: Record<string, { prompt: string; categoryId: string; total: number; failed: number }> = dict();

  // Onboarding
  let onboardingStartedCount = 0;
  let onboardingCompletedCount = 0;

  // Temps de complétion
  let totalLessonDurationSeconds = 0;
  let durationCount = 0;

  // Leçons par utilisateur
  const userCompletedCount: Record<string, number> = dict();

  // Parcourir les événements (ordre chronologique inverse pour les stats globales)
  const reversedEvents = [...events].reverse();

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
  const firstPickCounts: Record<string, number> = dict();
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

  return {
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
  };
}
