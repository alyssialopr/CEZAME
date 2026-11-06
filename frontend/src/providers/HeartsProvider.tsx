import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider';
import { useRewards } from '@/hooks/useRewards';

const STORAGE_KEY_PREFIX = '@cezame_hearts_';
export const MAX_HEARTS = 5;
export const REFILL_COST_GEMS = 50;

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface HeartsState {
  hearts: number;
  lastRefillDate: string;
}

interface HeartsContextType {
  hearts: number;
  maxHearts: number;
  isLoaded: boolean;
  canStartLesson: boolean;
  loseHeart: () => Promise<number>;
  refillHearts: () => Promise<void>;
  refillWithGems: (cost?: number) => Promise<boolean>;
}

const HeartsContext = createContext<HeartsContextType>({
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  isLoaded: false,
  canStartLesson: true,
  loseHeart: async () => MAX_HEARTS,
  refillHearts: async () => {},
  refillWithGems: async () => false,
});

export function HeartsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id || 'guest';
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;

  const { gems, spendGems } = useRewards();

  const [hearts, setHearts] = useState<number>(MAX_HEARTS);
  const [lastRefillDate, setLastRefillDate] = useState<string>(getTodayDateString());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Vérifier et appliquer la recharge quotidienne (si la date a changé)
  const checkDailyRefill = useCallback(
    async (currentHearts: number, savedDate: string): Promise<number> => {
      const today = getTodayDateString();
      if (savedDate !== today) {
        // Nouveau jour : recharge complète à 5 cœurs !
        const newHearts = MAX_HEARTS;
        setHearts(newHearts);
        setLastRefillDate(today);
        try {
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify({ hearts: newHearts, lastRefillDate: today })
          );
        } catch (err) {
          console.warn('Erreur lors de la sauvegarde de la recharge quotidienne :', err);
        }
        return newHearts;
      }
      return currentHearts;
    },
    [storageKey]
  );

  // Chargement initial des cœurs persistés
  useEffect(() => {
    async function loadHearts() {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const today = getTodayDateString();
        if (stored) {
          const parsed: HeartsState = JSON.parse(stored);
          const savedDate = parsed.lastRefillDate || '';
          if (savedDate !== today) {
            // Nouveau jour calendaire : recharge automatique
            setHearts(MAX_HEARTS);
            setLastRefillDate(today);
            await AsyncStorage.setItem(
              storageKey,
              JSON.stringify({ hearts: MAX_HEARTS, lastRefillDate: today })
            );
          } else {
            const h =
              typeof parsed.hearts === 'number'
                ? Math.max(0, Math.min(MAX_HEARTS, parsed.hearts))
                : MAX_HEARTS;
            setHearts(h);
            setLastRefillDate(savedDate);
          }
        } else {
          // Premier lancement
          setHearts(MAX_HEARTS);
          setLastRefillDate(today);
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify({ hearts: MAX_HEARTS, lastRefillDate: today })
          );
        }
      } catch (err) {
        console.warn('Erreur lors du chargement des cœurs :', err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadHearts();
  }, [storageKey]);

  // Écoute des reprises de l'application au premier plan
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkDailyRefill(hearts, lastRefillDate);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [checkDailyRefill, hearts, lastRefillDate]);

  // Perdre un cœur lors d'une mauvaise réponse
  const loseHeart = useCallback(async (): Promise<number> => {
    let nextValue = 0;
    setHearts((prev) => {
      nextValue = Math.max(0, prev - 1);
      return nextValue;
    });

    try {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ hearts: nextValue, lastRefillDate })
      );
    } catch (err) {
      console.warn('Erreur lors de la persistance de la perte de cœur :', err);
    }

    return nextValue;
  }, [lastRefillDate, storageKey]);

  // Recharger manuellement tous les cœurs (à 5)
  const refillHearts = useCallback(async () => {
    const today = getTodayDateString();
    setHearts(MAX_HEARTS);
    setLastRefillDate(today);
    try {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ hearts: MAX_HEARTS, lastRefillDate: today })
      );
    } catch (err) {
      console.warn('Erreur lors de la recharge des cœurs :', err);
    }
  }, [storageKey]);

  // Recharger les cœurs en échange de diamants
  const refillWithGems = useCallback(
    async (cost = REFILL_COST_GEMS): Promise<boolean> => {
      if (gems < cost) return false;
      const success = await spendGems(cost);
      if (success) {
        await refillHearts();
        return true;
      }
      return false;
    },
    [gems, spendGems, refillHearts]
  );

  return (
    <HeartsContext.Provider
      value={{
        hearts,
        maxHearts: MAX_HEARTS,
        isLoaded,
        canStartLesson: hearts > 0,
        loseHeart,
        refillHearts,
        refillWithGems,
      }}>
      {children}
    </HeartsContext.Provider>
  );
}

export function useHearts() {
  const context = useContext(HeartsContext);
  if (!context) {
    throw new Error('useHearts must be used within a HeartsProvider');
  }
  return context;
}
