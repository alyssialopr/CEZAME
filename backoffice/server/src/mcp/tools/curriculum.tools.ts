import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase.js';
import { getEnvironment, sanitizeErrorMessage } from '../../config/env.js';
import { logAudit } from '../../middleware/audit.js';
import { mapImportedQuestions, mapImportedScreens } from '../../lib/lessonTransfer.js';
import { LessonDraftPayloadSchema, validateLessonPayload } from '../schemas.js';

function jsonResult(data: unknown, isError = false) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export function registerCurriculumTools(server: McpServer): void {
  server.registerTool(
    'list_curriculum',
    {
      description:
        'Liste les catégories, unités et leçons existantes de CEZAME (filtrable par catégorie ou statut).',
      inputSchema: {
        category_id: z.string().trim().optional().describe('Filtrer par ID de catégorie (ex: sante, finance)'),
        status: z.enum(['draft', 'published']).optional().describe('Filtrer les leçons par statut'),
      },
    },
    async ({ category_id, status }) => {
      try {
        const [{ data: categories, error: catErr }, { data: units, error: unitErr }] = await Promise.all([
          supabaseAdmin.from('categories').select('id, label, subtitle, order_index').order('order_index'),
          supabaseAdmin
            .from('units')
            .select('id, category_id, unit_number, title, subtitle, order_index')
            .order('order_index'),
        ]);

        if (catErr || unitErr) {
          return jsonResult(
            { error: sanitizeErrorMessage(catErr || unitErr, 'Impossible de lire le curriculum') },
            true
          );
        }

        let lessonsQuery = supabaseAdmin
          .from('lessons')
          .select('id, unit_id, category_id, title, xp_reward, order_index, status')
          .order('order_index');

        if (category_id) {
          lessonsQuery = lessonsQuery.eq('category_id', category_id);
        }
        if (status) {
          lessonsQuery = lessonsQuery.eq('status', status);
        }

        const { data: lessons, error: lessonErr } = await lessonsQuery;
        if (lessonErr) {
          return jsonResult({ error: sanitizeErrorMessage(lessonErr, 'Impossible de lire les leçons') }, true);
        }

        const filteredCategories = category_id
          ? (categories || []).filter((c) => c.id === category_id)
          : categories || [];
        const filteredUnits = category_id
          ? (units || []).filter((u) => u.category_id === category_id)
          : units || [];

        return jsonResult({
          categories: filteredCategories,
          units: filteredUnits,
          lessons: lessons || [],
        });
      } catch (err) {
        return jsonResult({ error: sanitizeErrorMessage(err) }, true);
      }
    }
  );

  server.registerTool(
    'get_lesson',
    {
      description:
        "Récupère le détail complet d'une leçon (métadonnées, fiches de cours et questions) pour l'analyser ou la décliner.",
      inputSchema: {
        lesson_id: z.string().uuid('lesson_id doit être un UUID valide'),
      },
    },
    async ({ lesson_id }) => {
      try {
        const { data: lesson, error: lErr } = await supabaseAdmin
          .from('lessons')
          .select('*')
          .eq('id', lesson_id)
          .single();

        if (lErr || !lesson) {
          return jsonResult({ error: 'Leçon introuvable' }, true);
        }

        const [{ data: screens }, { data: questions }] = await Promise.all([
          supabaseAdmin
            .from('lesson_screens')
            .select('id, title, body, tip, order_index')
            .eq('lesson_id', lesson_id)
            .order('order_index', { ascending: true }),
          supabaseAdmin
            .from('lesson_questions')
            .select('id, type, category, prompt, options, explanation, order_index')
            .eq('lesson_id', lesson_id)
            .order('order_index', { ascending: true }),
        ]);

        return jsonResult({
          lesson,
          screens: screens || [],
          questions: questions || [],
        });
      } catch (err) {
        return jsonResult({ error: sanitizeErrorMessage(err) }, true);
      }
    }
  );

  server.registerTool(
    'validate_lesson_payload',
    {
      description:
        "Valide une leçon complète (fiches + 7 types d'exercices CEZAME) sans rien écrire en base.",
      inputSchema: {
        payload: z.unknown().describe('Objet leçon à valider ({ title, xp_reward, screens, questions })'),
      },
    },
    async ({ payload }) => {
      const result = validateLessonPayload(payload);
      return jsonResult(result, !result.valid);
    }
  );

  server.registerTool(
    'create_lesson_draft',
    {
      description:
        "Crée une nouvelle leçon complète (fiches + exercices) en statut 'draft' uniquement, avec validation stricte et journalisation d'audit.",
      inputSchema: {
        target_category_id: z.string().trim().min(1, 'target_category_id requis'),
        target_unit_id: z.string().uuid('target_unit_id doit être un UUID valide'),
        lesson: LessonDraftPayloadSchema,
      },
    },
    async ({ target_category_id, target_unit_id, lesson }) => {
      try {
        // Vérifier que la catégorie et l'unité cibles existent et correspondent
        const { data: unit, error: unitErr } = await supabaseAdmin
          .from('units')
          .select('id, category_id, title')
          .eq('id', target_unit_id)
          .maybeSingle();

        if (unitErr) {
          return jsonResult({ error: sanitizeErrorMessage(unitErr, "Erreur lors de la vérification de l'unité") }, true);
        }
        if (!unit) {
          return jsonResult({ error: `Unité introuvable: ${target_unit_id}` }, true);
        }
        if (unit.category_id !== target_category_id) {
          return jsonResult(
            {
              error: `L'unité "${unit.title}" appartient à la catégorie "${unit.category_id}", pas "${target_category_id}".`,
            },
            true
          );
        }

        // Déterminer le prochain order_index pour cette catégorie (contrainte UNIQUE(category_id, order_index))
        const { data: maxLesson } = await supabaseAdmin
          .from('lessons')
          .select('order_index')
          .eq('category_id', target_category_id)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrder = (maxLesson?.[0]?.order_index || 0) + 1;

        const { data: createdLesson, error: createErr } = await supabaseAdmin
          .from('lessons')
          .insert({
            unit_id: target_unit_id,
            category_id: target_category_id,
            title: lesson.title,
            xp_reward: lesson.xp_reward,
            order_index: nextOrder,
            status: 'draft', // Toujours en brouillon : publication manuelle depuis le backoffice
          })
          .select()
          .single();

        if (createErr || !createdLesson) {
          return jsonResult(
            { error: sanitizeErrorMessage(createErr, 'Impossible de créer la leçon brouillon') },
            true
          );
        }

        const screensToInsert = mapImportedScreens(lesson.screens, createdLesson.id);
        const questionsToInsert = mapImportedQuestions(lesson.questions, createdLesson.id);

        const [{ error: screensErr }, { error: questionsErr }] = await Promise.all([
          supabaseAdmin.from('lesson_screens').insert(screensToInsert),
          supabaseAdmin.from('lesson_questions').insert(questionsToInsert),
        ]);

        if (screensErr || questionsErr) {
          // Nettoyage en cas d'échec partiel pour éviter une leçon vide
          await supabaseAdmin.from('lessons').delete().eq('id', createdLesson.id);
          return jsonResult(
            {
              error: sanitizeErrorMessage(
                screensErr || questionsErr,
                'Erreur lors de l’insertion des fiches ou des questions'
              ),
            },
            true
          );
        }

        await logAudit({
          adminEmail: 'mcp-agent',
          action: 'MCP_CREATE_LESSON_DRAFT',
          targetType: 'lesson',
          targetId: createdLesson.id,
          details: {
            environment: getEnvironment(),
            categoryId: target_category_id,
            unitId: target_unit_id,
            title: createdLesson.title,
            screensCount: screensToInsert.length,
            questionsCount: questionsToInsert.length,
          },
        });

        return jsonResult({
          created: true,
          status: 'draft',
          lesson: createdLesson,
          screensCount: screensToInsert.length,
          questionsCount: questionsToInsert.length,
        });
      } catch (err) {
        return jsonResult({ error: sanitizeErrorMessage(err) }, true);
      }
    }
  );
}
