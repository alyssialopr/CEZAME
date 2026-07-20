import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  TargetRect,
  TutorialStep,
  TUTORIAL_STEPS,
} from '@/constants/tutorial';

// Le tuto est déclenché EXPLICITEMENT (fin d'onboarding ou « Revoir le tutoriel »),
// puis démarre au 1er passage sur le home. Un flag "pending" (persisté) porte cette
// intention et survit à la navigation onboarding → catégories → home.
const PENDING_KEY = '@tutorial_pending';

type TutorialContextType = {
  pending: boolean;
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  targetRect: TargetRect | null;
  /** Demande l'affichage du tuto (il démarrera sur le home). */
  requestTutorial: () => void;
  start: () => void;
  next: () => void;
  /** Avance si le tuto est actif et cible cette étape. Renvoie true si consommé. */
  pressTarget: (id: string) => boolean;
  skip: () => void;
  complete: () => void;
  setTargetRect: (rect: TargetRect | null) => void;
};

const noop = () => {};

const TutorialContext = createContext<TutorialContextType>({
  pending: false,
  isActive: false,
  currentStepIndex: 0,
  currentStep: null,
  targetRect: null,
  requestTutorial: noop,
  start: noop,
  next: noop,
  pressTarget: () => false,
  skip: noop,
  complete: noop,
  setTargetRect: noop,
});

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRectState] = useState<TargetRect | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PENDING_KEY).then((value) => {
      if (value === 'true') setPending(true);
    });
  }, []);

  const requestTutorial = useCallback(() => {
    setPending(true);
    AsyncStorage.setItem(PENDING_KEY, 'true').catch(() => {});
  }, []);

  const start = useCallback(() => {
    setPending(false);
    AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
    setCurrentStepIndex(0);
    setTargetRectState(null);
    setIsActive(true);
  }, []);

  const complete = useCallback(() => {
    setIsActive(false);
    setTargetRectState(null);
    setPending(false);
    AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
  }, []);

  const next = useCallback(() => {
    if (currentStepIndex + 1 >= TUTORIAL_STEPS.length) {
      complete();
      return;
    }
    setTargetRectState(null);
    setCurrentStepIndex(currentStepIndex + 1);
  }, [currentStepIndex, complete]);

  const currentStep = isActive ? TUTORIAL_STEPS[currentStepIndex] ?? null : null;

  const pressTarget = useCallback(
    (id: string) => {
      if (isActive && currentStep?.id === id) {
        next();
        return true;
      }
      return false;
    },
    [isActive, currentStep, next],
  );

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  const setTargetRect = useCallback((rect: TargetRect | null) => {
    setTargetRectState(rect);
  }, []);

  const value = useMemo(
    () => ({
      pending,
      isActive,
      currentStepIndex,
      currentStep,
      targetRect,
      requestTutorial,
      start,
      next,
      pressTarget,
      skip,
      complete,
      setTargetRect,
    }),
    [
      pending,
      isActive,
      currentStepIndex,
      currentStep,
      targetRect,
      requestTutorial,
      start,
      next,
      pressTarget,
      skip,
      complete,
      setTargetRect,
    ],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export const useTutorial = () => useContext(TutorialContext);
