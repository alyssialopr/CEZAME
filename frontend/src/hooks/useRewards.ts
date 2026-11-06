import { useRewardsContext } from '@/providers/RewardsProvider';

/**
 * Hook d'accès aux récompenses, coffres et diamants.
 * Utilise RewardsContext pour garantir la synchronisation instantanée
 * entre le compteur du haut, le profil et les coffres réclamés.
 */
export function useRewards() {
  return useRewardsContext();
}
