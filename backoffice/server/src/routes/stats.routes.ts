import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/', requireAuth, async (_req: AuthenticatedRequest, res) => {
  try {
    // 1. Nombre d'utilisateurs inscrits
    let totalUsers = 0;
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      totalUsers = usersData?.users?.length || 0;
    } catch {
      // Fallback si la service role key n'a pas tous les accès
      const { count } = await supabaseAdmin
        .from('user_lesson_progress')
        .select('user_id', { count: 'exact', head: true });
      totalUsers = count || 0;
    }

    // 2. Compteurs contenus
    const [
      { count: totalCategories },
      { count: totalUnits },
      { count: totalLessons },
      { count: totalQuestions },
      { count: totalScreens },
      { count: totalCompletedLessons },
    ] = await Promise.all([
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('units').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('lesson_questions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('lesson_screens').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
    ]);

    // 3. Répartition des leçons par catégorie
    const { data: categoriesWithLessons } = await supabaseAdmin
      .from('categories')
      .select('id, label, color');

    const categoryStats = await Promise.all(
      (categoriesWithLessons || []).map(async (cat) => {
        const { count } = await supabaseAdmin
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id);
        return {
          id: cat.id,
          label: cat.label,
          color: cat.color,
          lessonCount: count || 0,
        };
      })
    );

    // 4. Activité récente (derniers logs d'audit)
    const { data: recentLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      totalUsers,
      totalCategories: totalCategories || 0,
      totalUnits: totalUnits || 0,
      totalLessons: totalLessons || 0,
      totalQuestions: totalQuestions || 0,
      totalScreens: totalScreens || 0,
      totalCompletedLessons: totalCompletedLessons || 0,
      categoryStats,
      recentLogs: recentLogs || [],
    });
  } catch (error: any) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
