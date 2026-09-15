import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { useProgress, useUpdateStreak } from '@/hooks/useProgress';
import {
  completeLesson,
  fetchCategoryUnits,
  fetchLessonDetails,
} from '@/services/lessonsService';
import { DBUnit, DBLessonDetails } from '@/types/lesson';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Hook de récupération des unités et leçons pour une catégorie avec cache 24h.
 */
export function useCategoryUnits(categoryId: string) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery<DBUnit[]>({
    queryKey: ['category_units', categoryId, userId],
    queryFn: () => fetchCategoryUnits(categoryId, userId),
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    enabled: !!categoryId,
  });
}

/**
 * Hook de récupération du contenu complet d'une leçon (fiches + questions) avec cache 24h.
 */
export function useLessonDetails(lessonId?: string, categoryId?: string) {
  return useQuery<DBLessonDetails | null>({
    queryKey: ['lesson_details', lessonId, categoryId],
    queryFn: () => (lessonId ? fetchLessonDetails(lessonId, categoryId) : null),
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    enabled: !!lessonId,
  });
}

/**
 * Hook pour enregistrer la complétion d'une leçon et mettre à jour le cache instantanément.
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: currentProgress } = useProgress();
  const updateStreak = useUpdateStreak();

  return useMutation({
    mutationFn: async ({
      lessonId,
      categoryId,
      score,
      xpReward = 50,
    }: {
      lessonId: string;
      categoryId: string;
      score: number;
      xpReward?: number;
    }) => {
      if (!userId) {
        // Mode invité : au moins persister localement
        await completeLesson('guest', lessonId, categoryId, score, xpReward);
        return;
      }

      // 1. Marquer la leçon comme complétée
      await completeLesson(userId, lessonId, categoryId, score, xpReward);

      // 2. Mettre à jour l'XP global et la streak de l'utilisateur
      if (currentProgress) {
        try {
          await updateStreak.mutateAsync(currentProgress);
        } catch (e) {
          console.error('[useCompleteLesson] Erreur mise à jour streak/xp', e);
        }
      }
    },
    onSuccess: (_, variables) => {
      // Invalidation & rafraîchissement immédiat de la vue de progression
      queryClient.invalidateQueries({
        queryKey: ['category_units', variables.categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['progress', userId],
      });
    },
  });
}
