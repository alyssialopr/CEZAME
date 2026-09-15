import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();
router.use(requireAuth);

// ----------------------------------------------------
// 1. CATÉGORIES
// ----------------------------------------------------
router.get('/categories', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', async (req: AuthenticatedRequest, res) => {
  try {
    const { id, label, subtitle, color, border_color, icon_name, order_index } = req.body;
    if (!id || !label) {
      res.status(400).json({ error: 'ID et libellé de catégorie requis' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        id: id.toLowerCase().trim(),
        label,
        subtitle,
        color: color || '#8FA6FF',
        border_color: border_color || '#607FE8',
        icon_name: icon_name || 'FileText',
        order_index: Number(order_index) || 1,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'CREATE_CATEGORY',
      targetType: 'category',
      targetId: id,
      details: { label },
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { label, subtitle, color, border_color, icon_name, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        label,
        subtitle,
        color,
        border_color,
        icon_name,
        order_index: Number(order_index) || 1,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'UPDATE_CATEGORY',
      targetType: 'category',
      targetId: id,
      details: req.body,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);

    // Vérifier s'il y a des unités rattachées
    const { count } = await supabaseAdmin
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      res.status(400).json({
        error: `Impossible de supprimer la catégorie : ${count} unité(s) y sont rattachée(s). Supprimez d'abord ses unités.`,
      });
      return;
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'DELETE_CATEGORY',
      targetType: 'category',
      targetId: id,
    });

    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. UNITÉS
// ----------------------------------------------------
router.get('/units', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = supabaseAdmin.from('units').select('*, lessons(id, title, order_index, status)');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/units', async (req: AuthenticatedRequest, res) => {
  try {
    const { category_id, unit_number, title, subtitle, order_index } = req.body;
    if (!category_id || !title) {
      res.status(400).json({ error: 'Catégorie et titre requis' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('units')
      .insert({
        category_id,
        unit_number: Number(unit_number) || 1,
        title,
        subtitle,
        order_index: Number(order_index) || 1,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'CREATE_UNIT',
      targetType: 'unit',
      targetId: data.id,
      details: { title, category_id },
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/units/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { unit_number, title, subtitle, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('units')
      .update({
        unit_number: Number(unit_number),
        title,
        subtitle,
        order_index: Number(order_index),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'UPDATE_UNIT',
      targetType: 'unit',
      targetId: id,
      details: req.body,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/units/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { error } = await supabaseAdmin.from('units').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'DELETE_UNIT',
      targetType: 'unit',
      targetId: id,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. LEÇONS
// ----------------------------------------------------
router.get('/lessons', async (req, res) => {
  try {
    const { unit_id, category_id } = req.query;
    let query = supabaseAdmin
      .from('lessons')
      .select(
        '*, units(id, title, unit_number), lesson_screens(count), lesson_questions(count)'
      );

    if (unit_id) query = query.eq('unit_id', unit_id);
    if (category_id) query = query.eq('category_id', category_id);

    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    const { data: lesson, error: lError } = await supabaseAdmin
      .from('lessons')
      .select('*, units(id, title, unit_number, category_id)')
      .eq('id', id)
      .single();

    if (lError) {
      res.status(404).json({ error: 'Leçon non trouvée' });
      return;
    }

    const [{ data: screens }, { data: questions }] = await Promise.all([
      supabaseAdmin
        .from('lesson_screens')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true }),
      supabaseAdmin
        .from('lesson_questions')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index', { ascending: true }),
    ]);

    res.json({
      ...lesson,
      screens: screens || [],
      questions: questions || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/lessons', async (req: AuthenticatedRequest, res) => {
  try {
    const { unit_id, category_id, title, order_index, xp_reward = 50, status = 'published' } = req.body;
    if (!unit_id || !category_id || !title) {
      res.status(400).json({ error: 'Unité, catégorie et titre requis' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        unit_id,
        category_id,
        title,
        order_index: Number(order_index) || 1,
        xp_reward: Number(xp_reward) || 50,
        status,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'CREATE_LESSON',
      targetType: 'lesson',
      targetId: data.id,
      details: { title, category_id, unit_id },
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/lessons/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { title, order_index, xp_reward, status, unit_id, category_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update({
        title,
        order_index: Number(order_index),
        xp_reward: Number(xp_reward),
        status,
        unit_id,
        category_id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'UPDATE_LESSON',
      targetType: 'lesson',
      targetId: id,
      details: req.body,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/lessons/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (status !== 'draft' && status !== 'published') {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: status === 'published' ? 'PUBLISH_LESSON' : 'UNPUBLISH_LESSON',
      targetType: 'lesson',
      targetId: id,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/lessons/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { error } = await supabaseAdmin.from('lessons').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAudit({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: 'DELETE_LESSON',
      targetType: 'lesson',
      targetId: id,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. FICHES DE COURS (SCREENS)
// ----------------------------------------------------
router.post('/lessons/:id/screens', async (req: AuthenticatedRequest, res) => {
  try {
    const lesson_id = String(req.params.id);
    const { title, body, tip, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('lesson_screens')
      .insert({
        lesson_id,
        title,
        body,
        tip: tip || null,
        order_index: Number(order_index) || 1,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/screens/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { title, body, tip, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('lesson_screens')
      .update({
        title,
        body,
        tip: tip || null,
        order_index: Number(order_index),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/screens/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { error } = await supabaseAdmin.from('lesson_screens').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. QUESTIONS DE QUIZ
// ----------------------------------------------------
router.post('/lessons/:id/questions', async (req: AuthenticatedRequest, res) => {
  try {
    const lesson_id = String(req.params.id);
    const { category, prompt, options, explanation, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('lesson_questions')
      .insert({
        lesson_id,
        category: category || 'Quiz',
        prompt,
        options,
        explanation: explanation || '',
        order_index: Number(order_index) || 1,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/questions/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { category, prompt, options, explanation, order_index } = req.body;

    const { data, error } = await supabaseAdmin
      .from('lesson_questions')
      .update({
        category,
        prompt,
        options,
        explanation,
        order_index: Number(order_index),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/questions/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const id = String(req.params.id);
    const { error } = await supabaseAdmin.from('lesson_questions').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. RÉORDONNANCEMENT PAR LOT (DRAG & DROP)
// ----------------------------------------------------
router.post('/reorder', async (req: AuthenticatedRequest, res) => {
  try {
    const { type, items } = req.body as {
      type: 'screens' | 'questions' | 'lessons' | 'units';
      items: { id: string; order_index: number }[];
    };

    if (!type || !Array.isArray(items)) {
      res.status(400).json({ error: 'Type et items requis' });
      return;
    }

    const tableMap: Record<string, string> = {
      screens: 'lesson_screens',
      questions: 'lesson_questions',
      lessons: 'lessons',
      units: 'units',
    };

    const tableName = tableMap[type];
    if (!tableName) {
      res.status(400).json({ error: 'Type non supporté' });
      return;
    }

    // Mise à jour de chaque item
    await Promise.all(
      items.map((item) =>
        supabaseAdmin.from(tableName).update({ order_index: item.order_index }).eq('id', item.id)
      )
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
