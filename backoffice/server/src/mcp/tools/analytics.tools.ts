import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase.js';
import { sanitizeErrorMessage } from '../../config/env.js';
import { aggregateActivity } from '../../lib/activityStats.js';

function jsonResult(data: unknown, isError = false) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export function registerAnalyticsTools(server: McpServer): void {
  server.registerTool(
    'get_analytics_summary',
    {
      description:
        "Récupère les KPIs globaux et les métriques d'activité/pédagogie (entonnoir leçon->quiz->complétion, taux de réussite par type d'exercice, questions les plus ratées). Données strictement anonymisées.",
      inputSchema: {
        event_sample_limit: z
          .number()
          .int()
          .min(100)
          .max(5000)
          .default(2000)
          .describe("Nombre d'événements récents à agréger (100 à 5000)"),
      },
    },
    async ({ event_sample_limit }) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        const [
          { count: totalCategories },
          { count: totalUnits },
          { count: totalLessons },
          { count: totalQuestions },
          { count: totalScreens },
          { count: totalCompletedLessons },
          { count: totalEvents },
          { count: eventsToday },
          { data: recentEvents, error: eventsErr },
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
          supabaseAdmin.from('user_events').select('*', { count: 'exact', head: true }),
          supabaseAdmin.from('user_events').select('*', { count: 'exact', head: true }).gte('created_at', todayIso),
          supabaseAdmin
            .from('user_events')
            .select('event_type, event_name, screen_name, properties, user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(event_sample_limit),
        ]);

        if (eventsErr) {
          return jsonResult(
            { error: sanitizeErrorMessage(eventsErr, "Erreur lors de la lecture des événements d'activité") },
            true
          );
        }

        const activity = aggregateActivity(recentEvents || [], todayIso);

        return jsonResult({
          curriculumCounts: {
            categories: totalCategories || 0,
            units: totalUnits || 0,
            lessons: totalLessons || 0,
            screens: totalScreens || 0,
            questions: totalQuestions || 0,
          },
          summary: {
            totalCompletedLessons: totalCompletedLessons || 0,
            totalEvents: totalEvents || 0,
            eventsToday: eventsToday || 0,
            sampledEvents: (recentEvents || []).length,
          },
          ...activity,
        });
      } catch (err) {
        return jsonResult({ error: sanitizeErrorMessage(err) }, true);
      }
    }
  );

  server.registerTool(
    'get_lesson_friction',
    {
      description:
        "Analyse la progression et les scores anonymisés d'une leçon spécifique (taux de complétion, score moyen, nombre de blocages).",
      inputSchema: {
        lesson_id: z.string().uuid('lesson_id doit être un UUID valide'),
      },
    },
    async ({ lesson_id }) => {
      try {
        const [{ data: lesson, error: lErr }, { data: progressRows, error: pErr }] = await Promise.all([
          supabaseAdmin.from('lessons').select('id, title, category_id, status, xp_reward').eq('id', lesson_id).single(),
          supabaseAdmin
            .from('user_lesson_progress')
            .select('status, score, completed_at')
            .eq('lesson_id', lesson_id),
        ]);

        if (lErr || !lesson) {
          return jsonResult({ error: 'Leçon introuvable' }, true);
        }
        if (pErr) {
          return jsonResult({ error: sanitizeErrorMessage(pErr, 'Erreur lecture progression') }, true);
        }

        const rows = progressRows || [];
        const completed = rows.filter((r) => r.status === 'completed');
        const unlocked = rows.filter((r) => r.status === 'unlocked');
        const locked = rows.filter((r) => r.status === 'locked');

        const scores = completed
          .map((r) => Number(r.score))
          .filter((s) => Number.isFinite(s));

        const averageScore =
          scores.length > 0
            ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
            : null;

        const startedCount = completed.length + unlocked.length;
        const completionRate =
          startedCount > 0 ? Math.round((completed.length / startedCount) * 100) : null;

        return jsonResult({
          lesson,
          progressSummary: {
            totalTrackedUsers: rows.length,
            completedCount: completed.length,
            inProgressOrUnlockedCount: unlocked.length,
            lockedCount: locked.length,
            completionRatePercent: completionRate,
            averageScore,
          },
        });
      } catch (err) {
        return jsonResult({ error: sanitizeErrorMessage(err) }, true);
      }
    }
  );
}
