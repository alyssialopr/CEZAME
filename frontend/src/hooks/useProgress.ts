import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    mutationFn: async (currentProgress: Progress) => {
      if (!userId) throw new Error('User not authenticated');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastUpdate = new Date(currentProgress.updated_at);
      lastUpdate.setHours(0, 0, 0, 0);

      let newStreak = currentProgress.streak;

      if (currentProgress.streak === 0) {
        newStreak = 1;
      } else if (lastUpdate.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (lastUpdate.getTime() < yesterday.getTime()) {
        // If they missed a day
        newStreak = 1;
      }
      // If lastUpdate is today and streak > 0, streak remains the same

      const newXp = currentProgress.xp + 50; // Add 50 XP per lesson

      const { data, error } = await supabase
        .from('progress')
        .update({
          streak: newStreak,
          xp: newXp,
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
