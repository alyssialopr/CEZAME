import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export function useUser() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Fallback to inserting if it doesn't exist, though it's typically created via auth triggers
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            is_onboarding_completed: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newUser;
      }

      return data;
    },
    enabled: !!userId,
  });
}
