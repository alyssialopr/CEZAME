import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditPagination } from '../lib/pagination.js';

const router = Router();
router.use(requireAuth);

// Lister les logs d'audit avec pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, from, to } = auditPagination(req.query.page, req.query.limit);

    const { data, count, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      logs: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
