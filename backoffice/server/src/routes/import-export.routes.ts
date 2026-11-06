import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();
router.use(requireAuth);

// Exporter une leçon complète en JSON
router.get('/lessons/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    const { data: lesson, error: lError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (lError || !lesson) {
      res.status(404).json({ error: 'Leçon introuvable' });
      return;
    }

    const [{ data: screens }, { data: questions }] = await Promise.all([
      supabaseAdmin
        .from('lesson_screens')
        .select('title, body, tip, order_index')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true }),
      supabaseAdmin
        .from('lesson_questions')
        .select('type, category, prompt, options, explanation, order_index')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true }),
    ]);

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      lesson: {
        title: lesson.title,
        category_id: lesson.category_id,
        xp_reward: lesson.xp_reward,
        screens: screens || [],
        questions: questions || [],
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="lesson-${lesson.title.replace(/\s+/g, '_')}.json"`
    );
    res.json(exportData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Importer une leçon depuis un objet JSON
router.post('/lessons', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetUnitId, targetCategoryId, payload } = req.body;

    const lessonData = payload?.lesson || payload;

    if (!targetUnitId || !targetCategoryId || !lessonData) {
      res.status(400).json({
        error: 'targetUnitId, targetCategoryId et structure JSON de la leçon requises',
      });
      return;
    }

    const { title, xp_reward = 50, screens = [], questions = [] } = lessonData;

    // Déterminer l'order_index suivant pour cette unité
    const { count } = await supabaseAdmin
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', targetUnitId);

    const nextOrder = (count || 0) + 1;

    // 1. Créer la leçon
    const { data: newLesson, error: lError } = await supabaseAdmin
      .from('lessons')
      .insert({
        unit_id: targetUnitId,
        category_id: targetCategoryId,
        title: title || 'Nouvelle Leçon Importée',
        xp_reward: Number(xp_reward) || 50,
        order_index: nextOrder,
        status: 'draft',
      })
      .select()
      .single();

    if (lError) {
      res.status(500).json({ error: lError.message });
      return;
    }

    // 2. Insérer les fiches
    if (Array.isArray(screens) && screens.length > 0) {
      const screensToInsert = screens.map((s: any, idx: number) => ({
        lesson_id: newLesson.id,
        order_index: s.order_index || idx + 1,
        title: s.title || `Fiche ${idx + 1}`,
        body: s.body || '',
        tip: s.tip || null,
      }));
      await supabaseAdmin.from('lesson_screens').insert(screensToInsert);
    }

    // 3. Insérer les questions
    if (Array.isArray(questions) && questions.length > 0) {
      const questionsToInsert = questions.map((q: any, idx: number) => ({
        lesson_id: newLesson.id,
        order_index: q.order_index || idx + 1,
        type: q.type || 'qcm',
        category: q.category || 'Quiz',
        prompt: q.prompt || 'Question',
        options: q.options || [],
        explanation: q.explanation || '',
      }));
      await supabaseAdmin.from('lesson_questions').insert(questionsToInsert);
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'IMPORT_LESSON',
      targetType: 'lesson',
      targetId: newLesson.id,
      details: { title: newLesson.title, screensCount: screens.length, questionsCount: questions.length },
    });

    res.json({
      success: true,
      message: 'Leçon importée avec succès en statut brouillon !',
      lessonId: newLesson.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
