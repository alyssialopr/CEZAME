import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, hasServiceRoleKey } from '../config/supabase.js';
import { activityPagination } from '../lib/pagination.js';
import { aggregateActivity } from '../lib/activityStats.js';

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
    const { page, limit, offset } = activityPagination(req.query.page, req.query.limit);

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

    const stats = aggregateActivity(recentEvents || [], todayIso);

    res.json({
      totalEvents: totalEvents || 0,
      eventsToday: eventsToday || 0,
      ...stats,
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
