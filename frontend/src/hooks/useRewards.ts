import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { UnitReward } from '@/constants/categoryRewards';

const STORAGE_KEY_PREFIX = '@cezame_rewards_';

interface RewardsState {
  gems: number;
  claimedChests: string[]; // List of claimed unit IDs
  unlockedBadges: string[]; // List of unlocked badge keys
}

const DEFAULT_STATE: RewardsState = {
  gems: 500,
  claimedChests: [],
  unlockedBadges: ['premier-pas'], // Badge de bienvenue débloqué par défaut
};

export function useRewards() {
  const { session } = useAuth();
  const userId = session?.user?.id || 'guest';
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
  const queryClient = useQueryClient();

  const [state, setState] = useState<RewardsState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Chargement des données persistées
  useEffect(() => {
    async function loadRewards() {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setState({
            gems: typeof parsed.gems === 'number' ? parsed.gems : DEFAULT_STATE.gems,
            claimedChests: Array.isArray(parsed.claimedChests) ? parsed.claimedChests : [],
            unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : DEFAULT_STATE.unlockedBadges,
          });
        }
      } catch (err) {
        console.warn('Erreur lors du chargement des récompenses :', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadRewards();
  }, [storageKey]);

  // Vérifier si le coffre d'une unité a déjà été réclamé
  const isChestClaimed = useCallback(
    (unitId: string) => {
      return state.claimedChests.includes(unitId);
    },
    [state.claimedChests]
  );

  // Réclamer la récompense d'une unité
  const claimChest = useCallback(
    async (unitId: string, reward: UnitReward) => {
      const newClaimed = state.claimedChests.includes(unitId)
        ? state.claimedChests
        : [...state.claimedChests, unitId];

      const newBadges = state.unlockedBadges.includes(reward.badge.key)
        ? state.unlockedBadges
        : [...state.unlockedBadges, reward.badge.key];

      const newGems = reward.type === 'gems' ? state.gems + reward.amount : state.gems;

      const updatedState: RewardsState = {
        gems: newGems,
        claimedChests: newClaimed,
        unlockedBadges: newBadges,
      };

      setState(updatedState);

      // Persistance dans AsyncStorage
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedState));
      } catch (err) {
        console.warn('Erreur de sauvegarde des récompenses :', err);
      }

      // Si la récompense est de l'XP, mise à jour dans Supabase progress
      if (reward.type === 'xp' && session?.user?.id) {
        try {
          const { data: currentProgress } = await supabase
            .from('progress')
            .select('id, xp')
            .eq('user_id', session.user.id)
            .single();

          if (currentProgress) {
            const newXp = (currentProgress.xp || 0) + reward.amount;
            await supabase
              .from('progress')
              .update({ xp: newXp, updated_at: new Date().toISOString() })
              .eq('id', currentProgress.id);

            // Invalider le cache progress pour rafraîchir l'XP partout
            queryClient.invalidateQueries({ queryKey: ['progress', session.user.id] });
          }
        } catch (err) {
          console.warn('Erreur mise à jour XP reward dans Supabase :', err);
        }
      }
    },
    [state, storageKey, session, queryClient]
  );

  return {
    gems: state.gems,
    claimedChests: state.claimedChests,
    unlockedBadges: state.unlockedBadges,
    isLoaded,
    isChestClaimed,
    claimChest,
  };
}
