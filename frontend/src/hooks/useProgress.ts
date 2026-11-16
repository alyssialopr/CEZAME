import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { computeRankFromXp, nextStreak } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/lib/database.types';

type Progress = Database['public']['Tables']['progress']['Row'];

export function useProgress() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['progress', userId],
    queryFn: async (): Promise<Progress | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create initial progress if it doesn't exist
        const { data: newProgress, error: insertError } = await supabase
          .from('progress')
          .insert({
            user_id: userId,
            streak: 0,
            xp: 0,
            rank: 'bronze',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newProgress;
      }

      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (
      input: Progress | { currentProgress: Progress; xpReward?: number }
    ) => {
      if (!userId) throw new Error('User not authenticated');

      const currentProgress = 'currentProgress' in input ? input.currentProgress : input;
      const xpReward =
        'currentProgress' in input && typeof input.xpReward === 'number'
          ? input.xpReward
          : 50;

      const newStreak = nextStreak(currentProgress.streak, currentProgress.updated_at);
      const newXp = (currentProgress.xp || 0) + xpReward;
      const newRank = computeRankFromXp(newXp);

      const { data, error } = await supabase
        .from('progress')
        .update({
          streak: newStreak,
          xp: newXp,
          rank: newRank,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProgress.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['progress', userId], data);
    },
  });
}
