import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants/categories';
import { LESSONS } from '@/constants/lessons';
import {
  DBLesson,
  DBLessonDetails,
  DBLessonOption,
  DBUnit,
  LessonProgressStatus,
  QuestionType,
} from '@/types/lesson';

const CACHE_KEY_UNITS = (cat: string) => `@cezame_units_${cat}`;
const CACHE_KEY_LESSON = (id: string) => `@cezame_lesson_details_${id}`;
const CACHE_KEY_PROGRESS = (userId: string, cat: string) => `@cezame_progress_${userId}_${cat}`;

/**
 * Construit un ensemble d'unités et de leçons par défaut à partir des constantes locales.
 * Sert de filet de sécurité si la BDD est hors-ligne ou pas encore peuplée.
 */
function getLocalFallbackUnits(
  categoryId: string,
  progressMap: Record<string, LessonProgressStatus> = {}
): DBUnit[] {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const localLesson = LESSONS[categoryId];
  const mainTitle = localLesson?.title || (category ? `Apprendre ${category.label}` : 'Leçon');
  const catSubtitle = category?.subtitle || 'Premiers pas';

  const l1Id = `${categoryId}_1`;
  const l2Id = `${categoryId}_2`;
  const l3Id = `${categoryId}_3`;
  const l4Id = `${categoryId}_4`;

  // Déterminer le statut : la leçon 1 est au minimum débloquée
  const s1: LessonProgressStatus = progressMap[l1Id] || 'unlocked';
  const s2: LessonProgressStatus =
    progressMap[l2Id] || (s1 === 'completed' ? 'unlocked' : 'locked');
  const s3: LessonProgressStatus =
    progressMap[l3Id] || (s2 === 'completed' ? 'unlocked' : 'locked');
  const s4: LessonProgressStatus =
    progressMap[l4Id] || (s3 === 'completed' ? 'unlocked' : 'locked');

  return [
    {
      id: `unit_${categoryId}_1`,
      category_id: categoryId,
      unit_number: 1,
      title: 'Unité 1',
      subtitle: catSubtitle,
      order_index: 1,
      lessons: [
        {
          id: l1Id,
          unit_id: `unit_${categoryId}_1`,
          category_id: categoryId,
          order_index: 1,
          title: mainTitle,
          xp_reward: 50,
          status: s1,
        },
        {
          id: l2Id,
          unit_id: `unit_${categoryId}_1`,
          category_id: categoryId,
          order_index: 2,
          title: 'Étape 2 : Mettre en pratique',
          xp_reward: 50,
          status: s2,
        },
        {
          id: l3Id,
          unit_id: `unit_${categoryId}_1`,
          category_id: categoryId,
          order_index: 3,
          title: 'Étape 3 : Niveau supérieur',
          xp_reward: 50,
          status: s3,
        },
      ],
    },
    {
      id: `unit_${categoryId}_2`,
      category_id: categoryId,
      unit_number: 2,
      title: 'Unité 2',
      subtitle: 'Approfondissement',
      order_index: 2,
      lessons: [
        {
          id: l4Id,
          unit_id: `unit_${categoryId}_2`,
          category_id: categoryId,
          order_index: 4,
          title: 'Étape 4 : Maîtrise complète',
          xp_reward: 100,
          status: s4,
        },
      ],
    },
  ];
}

/**
 * Récupère les unités et leçons pour une catégorie donnée, avec statut de progression.
 * Stratégie : Supabase -> AsyncStorage (cache) -> Fallback local.
 */
export async function fetchCategoryUnits(
  categoryId: string,
  userId?: string
): Promise<DBUnit[]> {
  // 1. Lire la progression locale en cache si existante
  let progressMap: Record<string, LessonProgressStatus> = {};
  if (userId) {
    try {
      const cachedProgress = await AsyncStorage.getItem(CACHE_KEY_PROGRESS(userId, categoryId));
      if (cachedProgress) {
        progressMap = JSON.parse(cachedProgress);
      }
    } catch {
      // ignorer
    }
  }

  // 2. Tenter de charger depuis Supabase
  try {
    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true });

    if (!unitsError && unitsData && unitsData.length > 0) {
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (!lessonsError && lessonsData && lessonsData.length > 0) {
        const scoreMap: Record<string, number> = {};

        // Récupérer la progression Supabase si l'utilisateur est connecté
        if (userId) {
          const { data: userProgData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, status, score')
            .eq('user_id', userId);

          if (userProgData) {
            userProgData.forEach((p) => {
              progressMap[p.lesson_id] = p.status as LessonProgressStatus;
              if (typeof p.score === 'number') {
                scoreMap[p.lesson_id] = p.score;
              }
            });
            // Mettre à jour le cache local de progression
            await AsyncStorage.setItem(
              CACHE_KEY_PROGRESS(userId, categoryId),
              JSON.stringify(progressMap)
            );
          }
        }

        // Assembler les unités avec le statut séquentiel calculé
        let previousCompleted = true; // La 1ère leçon est débloquée
        const formattedUnits: DBUnit[] = unitsData.map((unit) => {
          const unitLessons = lessonsData
            .filter((l) => l.unit_id === unit.id)
            .map((lesson) => {
              const explicitStatus = progressMap[lesson.id];
              let status: LessonProgressStatus = 'locked';

              if (explicitStatus === 'completed') {
                status = 'completed';
                previousCompleted = true;
              } else if (explicitStatus === 'unlocked' || previousCompleted) {
                status = 'unlocked';
                previousCompleted = false;
              } else {
                status = 'locked';
                previousCompleted = false;
              }

              return {
                id: lesson.id,
                unit_id: lesson.unit_id,
                category_id: lesson.category_id,
                order_index: lesson.order_index,
                title: lesson.title,
                xp_reward: lesson.xp_reward,
                status,
                score: scoreMap[lesson.id] ?? (status === 'completed' ? 100 : undefined),
              };
            });

          return {
            id: unit.id,
            category_id: unit.category_id,
            unit_number: unit.unit_number,
            title: unit.title,
            subtitle: unit.subtitle,
            mascot_name: (unit as any).mascot_name || null,
            order_index: unit.order_index,
            lessons: unitLessons,
          };
        });

        // Mettre en cache les unités
        await AsyncStorage.setItem(CACHE_KEY_UNITS(categoryId), JSON.stringify(formattedUnits));
        return formattedUnits;
      }
    }
  } catch (err) {
    console.warn('[lessonsService] Supabase fetch failed, checking cache / fallback', err);
  }

  // 3. Si Supabase est indisponible ou non peuplé, tenter le cache AsyncStorage
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_UNITS(categoryId));
    if (cached) {
      const units: DBUnit[] = JSON.parse(cached);
      return units;
    }
  } catch {
    // ignorer
  }

  // 4. Filet de secours local
  return getLocalFallbackUnits(categoryId, progressMap);
}

/**
 * Détermine le type précis d'un exercice de façon ultra-robuste.
 */
function resolveQuestionType(rawExplicitType: any, rawOptions: any): QuestionType {
  const explicit = rawExplicitType as QuestionType | undefined;
  if (explicit === 'document') return 'document';
  if (explicit === 'matching') return 'matching';
  if (explicit === 'order') return 'order';
  if (explicit === 'scam') return 'scam';
  if (explicit === 'bucket') return 'bucket';
  if (explicit === 'scenario') return 'scenario';

  const firstElem = Array.isArray(rawOptions) ? rawOptions[0] : null;

  const isScenario = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.context !== undefined || (rawOptions.options && rawOptions.persona))) ||
    (firstElem && typeof firstElem === 'object' && firstElem.context !== undefined)
  );
  if (isScenario) return 'scenario';

  const isScam = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.isScam !== undefined || rawOptions.sender !== undefined || rawOptions.channel !== undefined)) ||
    (firstElem && typeof firstElem === 'object' && (firstElem.isScam !== undefined || firstElem.sender !== undefined))
  );
  if (isScam) return 'scam';

  const isBucket = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.buckets !== undefined || rawOptions.items !== undefined)) ||
    (firstElem && typeof firstElem === 'object' && (firstElem.buckets !== undefined || firstElem.bucketId !== undefined)) ||
    (Array.isArray(rawOptions) && rawOptions.some((it: any) => it?.bucketId !== undefined))
  );
  if (isBucket) return 'bucket';

  const optionsArr = Array.isArray(rawOptions) ? rawOptions : [];
  if (optionsArr[0]?.label !== undefined && optionsArr[0]?.value !== undefined) {
    return 'document';
  }
  if (optionsArr[0]?.left !== undefined) {
    return 'matching';
  }
  if (
    optionsArr[0]?.id !== undefined &&
    optionsArr[0]?.text !== undefined &&
    optionsArr[0]?.label === undefined &&
    optionsArr[0]?.letter === undefined
  ) {
    return 'order';
  }

  return explicit || 'qcm';
}

/**
 * Récupère le contenu complet d'une leçon (écrans théoriques + questions du quiz).
 */
export async function fetchLessonDetails(
  lessonId: string,
  categoryId?: string
): Promise<DBLessonDetails | null> {
  // 1. Tenter Supabase si lessonId ressemble à un UUID
  try {
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (!lessonError && lessonData) {
      const catId = lessonData.category_id;

      const [screensRes, questionsRes] = await Promise.all([
        supabase
          .from('lesson_screens')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: true }),
        supabase
          .from('lesson_questions')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: true }),
      ]);

      const screens = screensRes.data || [];
      const questions = (questionsRes.data || []).map((q) => {
        let rawOptions: any = q.options;
        if (typeof rawOptions === 'string') {
          try {
            rawOptions = JSON.parse(rawOptions);
          } catch {}
        }
        const detectedType = resolveQuestionType((q as any).type, rawOptions);

        return {
          id: q.id,
          lesson_id: q.lesson_id,
          order_index: q.order_index,
          type: detectedType,
          category: q.category,
          prompt: q.prompt,
          options: rawOptions,
          explanation: q.explanation,
        };
      });

      // Si la BDD a du contenu pour cette leçon, on le retourne
      if (screens.length > 0 || questions.length > 0) {
        const details: DBLessonDetails = {
          id: lessonData.id,
          unit_id: lessonData.unit_id,
          category_id: catId,
          order_index: lessonData.order_index,
          title: lessonData.title,
          xp_reward: lessonData.xp_reward,
          screens: screens.map((s) => ({
            id: s.id,
            lesson_id: s.lesson_id,
            order_index: s.order_index,
            title: s.title,
            body: s.body,
            tip: s.tip,
          })),
          questions,
        };

        await AsyncStorage.setItem(CACHE_KEY_LESSON(lessonId), JSON.stringify(details));
        return details;
      }
    }
  } catch (err) {
    console.warn('[lessonsService] Supabase lesson fetch failed, using cache / fallback', err);
  }

  // 2. Cache local AsyncStorage
  const targetCategory = categoryId || (lessonId.includes('_') ? lessonId.split('_')[0] : 'finance');
  const localLesson = LESSONS[targetCategory];

  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_LESSON(lessonId));
    if (cached) {
      const parsed: DBLessonDetails = JSON.parse(cached);
      // Si le cache contient moins de questions que la version locale (nouveaux types d'exercices ajoutés),
      // on ignore le cache périmé pour charger la leçon mise à jour.
      const isCacheStale = localLesson && parsed.questions && parsed.questions.length < localLesson.questions.length;

      if (!isCacheStale && parsed.questions) {
        parsed.questions = parsed.questions.map((q) => {
          let rawOptions: any = q.options;
          if (typeof rawOptions === 'string') {
            try {
              rawOptions = JSON.parse(rawOptions);
            } catch {}
          }
          const detectedType = resolveQuestionType(q.type, rawOptions);

          return {
            ...q,
            type: detectedType,
            options: rawOptions,
          };
        });
      }
      return parsed;
    }
  } catch {
    // ignorer
  }

  // 3. Fallback sur les constantes locales LESSONS
  if (localLesson) {
    return {
      id: lessonId,
      unit_id: null,
      category_id: targetCategory,
      order_index: 1,
      title: localLesson.title,
      xp_reward: 50,
      screens: localLesson.screens.map((s, idx) => ({
        order_index: idx + 1,
        title: s.title,
        body: s.body,
        tip: s.tip,
      })),
      questions: localLesson.questions.map((q, idx) => {
        let rawOptions: any = q.options;
        if (typeof rawOptions === 'string') {
          try {
            rawOptions = JSON.parse(rawOptions);
          } catch {}
        }
        const detectedType = resolveQuestionType(q.type, rawOptions);

        return {
          order_index: idx + 1,
          type: detectedType,
          category: q.category,
          prompt: q.prompt,
          options: rawOptions,
          explanation: q.explanation,
        };
      }),
    };
  }

  return null;
}

/**
 * Enregistre la réussite d'une leçon et débloque la progression.
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  categoryId: string,
  score: number,
  xpReward: number = 50
) {
  // 1. Sauvegarde locale immédiate
  try {
    const cachedProgressStr = await AsyncStorage.getItem(CACHE_KEY_PROGRESS(userId, categoryId));
    const progressMap: Record<string, LessonProgressStatus> = cachedProgressStr
      ? JSON.parse(cachedProgressStr)
      : {};
    progressMap[lessonId] = 'completed';
    await AsyncStorage.setItem(
      CACHE_KEY_PROGRESS(userId, categoryId),
      JSON.stringify(progressMap)
    );
  } catch (e) {
    console.warn('[lessonsService] Erreur mise à jour cache local progression', e);
  }

  // 2. Sauvegarde Supabase
  try {
    // Upsert dans user_lesson_progress
    await supabase.from('user_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: 'completed',
        score,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );
  } catch (err) {
    console.warn('[lessonsService] Impossible de mettre à jour user_lesson_progress sur Supabase', err);
  }
}
