import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { InteractionManager, View } from 'react-native';

import { TutorialStepId } from '@/constants/tutorial';
import { useTutorial } from '@/providers/TutorialProvider';

/**
 * Enregistre un élément comme cible du coach-mark `id`.
 * Mesure la position de l'élément (`measureInWindow`) quand le tuto est actif,
 * cible cette étape ET que l'écran est au premier plan (useFocusEffect) — ce qui
 * garantit une re-mesure correcte au retour sur un écran (ex. le home après la leçon).
 *
 * La mesure est répétée jusqu'à stabilisation pour éviter un cadrage capturé
 * pendant une transition d'écran.
 */
export function useTutorialTarget(id: TutorialStepId, ref: React.RefObject<View | null>) {
  const { isActive, currentStep, setTargetRect } = useTutorial();
  const isCurrent = isActive && currentStep?.id === id;

  useFocusEffect(
    useCallback(() => {
      if (!isCurrent) return;

      let cancelled = false;
      let lastKey = '';
      let sameCount = 0;
      const STABLE_THRESHOLD = 3; // 3 mesures identiques d'affilée (~240ms) = position figée
      const timers: ReturnType<typeof setTimeout>[] = [];

      const scheduleRetry = (attempt: number) => {
        timers.push(setTimeout(() => measure(attempt + 1), 80));
      };

      const measure = (attempt = 0) => {
        if (cancelled || attempt > 30) return;
        const node = ref.current;
        if (!node || typeof node.measureInWindow !== 'function') {
          scheduleRetry(attempt);
          return;
        }

        node.measureInWindow((x, y, width, height) => {
          if (cancelled) return;
          if (width === 0 || height === 0) {
            scheduleRetry(attempt);
            return;
          }

          // On n'AFFICHE le spotlight qu'une fois la position VRAIMENT figée
          // (plusieurs mesures identiques d'affilée). Pendant une transition
          // d'écran la position change à chaque frame → le compteur se remet à
          // zéro, donc aucune position transitoire (mal cadrée) n'est affichée.
          const key = `${Math.round(x)},${Math.round(y)},${Math.round(width)},${Math.round(height)}`;
          if (key === lastKey) {
            sameCount += 1;
          } else {
            sameCount = 1;
            lastKey = key;
          }

          if (sameCount >= STABLE_THRESHOLD) {
            setTargetRect({ x, y, width, height });
          } else {
            scheduleRetry(attempt);
          }
        });
      };

      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => measure(0));
      });

      return () => {
        cancelled = true;
        task.cancel?.();
        timers.forEach(clearTimeout);
      };
    }, [isCurrent, ref, setTargetRect]),
  );
}
