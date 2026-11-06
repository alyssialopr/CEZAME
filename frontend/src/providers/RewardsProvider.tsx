import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

interface RewardsContextType {
  gems: number;
  claimedChests: string[];
  unlockedBadges: string[];
  isLoaded: boolean;
  isChestClaimed: (unitId: string) => boolean;
  claimChest: (unitId: string, reward: UnitReward) => Promise<void>;
  spendGems: (amount: number) => Promise<boolean>;
  addGems: (amount: number) => Promise<void>;
  resetRewards: () => Promise<void>;
}

const RewardsContext = createContext<RewardsContextType>({
  gems: DEFAULT_STATE.gems,
  claimedChests: DEFAULT_STATE.claimedChests,
  unlockedBadges: DEFAULT_STATE.unlockedBadges,
  isLoaded: false,
  isChestClaimed: () => false,
  claimChest: async () => {},
  spendGems: async () => false,
  addGems: async () => {},
  resetRewards: async () => {},
});

export function RewardsProvider({ children }: { children: React.ReactNode }) {
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
        } else {
          setState(DEFAULT_STATE);
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
      setState((prev) => {
        const newClaimed = prev.claimedChests.includes(unitId)
          ? prev.claimedChests
          : [...prev.claimedChests, unitId];

        const newBadges = prev.unlockedBadges.includes(reward.badge.key)
          ? prev.unlockedBadges
          : [...prev.unlockedBadges, reward.badge.key];

        const newGems = reward.type === 'gems' ? prev.gems + reward.amount : prev.gems;

        const updatedState: RewardsState = {
          gems: newGems,
          claimedChests: newClaimed,
          unlockedBadges: newBadges,
        };

        // Sauvegarde asynchrone
        AsyncStorage.setItem(storageKey, JSON.stringify(updatedState)).catch((err) => {
          console.warn('Erreur de sauvegarde des récompenses :', err);
        });

        return updatedState;
      });

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

            queryClient.invalidateQueries({ queryKey: ['progress', session.user.id] });
          }
        } catch (err) {
          console.warn('Erreur mise à jour XP reward dans Supabase :', err);
        }
      }
    },
    [storageKey, session, queryClient]
  );

  // Dépenser des diamants
  const spendGems = useCallback(
    async (amount: number): Promise<boolean> => {
      if (state.gems < amount) {
        return false;
      }

      const newGems = state.gems - amount;
      const updatedState: RewardsState = {
        ...state,
        gems: newGems,
      };

      setState(updatedState);

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedState));
      } catch (err) {
        console.warn('Erreur lors de la dépense de diamants :', err);
      }

      return true;
    },
    [state, storageKey]
  );

  // Ajouter des diamants
  const addGems = useCallback(
    async (amount: number) => {
      setState((prev) => {
        const updatedState: RewardsState = {
          ...prev,
          gems: prev.gems + amount,
        };
        AsyncStorage.setItem(storageKey, JSON.stringify(updatedState)).catch((err) => {
          console.warn('Erreur lors de l’ajout de diamants :', err);
        });
        return updatedState;
      });
    },
    [storageKey]
  );

  // Réinitialiser les récompenses
  const resetRewards = useCallback(async () => {
    setState(DEFAULT_STATE);
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Erreur lors du reset des récompenses :', err);
    }
  }, [storageKey]);

  return (
    <RewardsContext.Provider
      value={{
        gems: state.gems,
        claimedChests: state.claimedChests,
        unlockedBadges: state.unlockedBadges,
        isLoaded,
        isChestClaimed,
        claimChest,
        spendGems,
        addGems,
        resetRewards,
      }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewardsContext() {
  return useContext(RewardsContext);
}
