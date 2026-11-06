import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import type { ViewInstance } from 'react-native';

import { TutorialStepId } from '@/constants/tutorial';
import { useTutorial } from '@/providers/TutorialProvider';

/**
 * Enregistre un élément comme cible du coach-mark `id`.
 * Mesure la position de l'élément (`measureInWindow`) quand le tuto est actif,
 * cible cette étape ET que l'écran est au premier plan (useFocusEffect) — ce qui
 * garantit une re-mesure correcte au retour sur un écran (ex. le home après la leçon).
 *
 * Une position n'est publiée qu'une fois stable (plusieurs mesures identiques),
 * pour ne pas cadrer une transition d'écran. La mesure continue ensuite tant que
 * l'étape est affichée : si la cible bouge (en-tête chargé après coup, défilement,
 * rotation), le spotlight la suit au lieu de rester sur l'ancienne position.
 */
export function useTutorialTarget(id: TutorialStepId, ref: React.RefObject<ViewInstance | null>) {
  const { isActive, currentStep, setTargetRect } = useTutorial();
  const isCurrent = isActive && currentStep?.id === id;

  useFocusEffect(
    useCallback(() => {
      if (!isCurrent) return;

      let cancelled = false;
      let lastKey = '';
      let publishedKey = '';
      let sameCount = 0;
      const STABLE_THRESHOLD = 3; // 3 mesures identiques d'affilée = position figée
      const INTERVAL_MS = 80; // tant que la position n'est pas publiée
      const WATCH_INTERVAL_MS = 250; // ensuite, surveillance plus espacée
      let timer: ReturnType<typeof setTimeout> | undefined;

      const schedule = () => {
        if (cancelled) return;
        timer = setTimeout(measure, publishedKey && publishedKey === lastKey ? WATCH_INTERVAL_MS : INTERVAL_MS);
      };

      const measure = () => {
        if (cancelled) return;
        const node = ref.current;
        if (!node || typeof node.measureInWindow !== 'function') {
          schedule();
          return;
        }

        node.measureInWindow((x: number, y: number, width: number, height: number) => {
          if (cancelled) return;
          if (width === 0 || height === 0) {
            schedule();
            return;
          }

          const key = `${Math.round(x)},${Math.round(y)},${Math.round(width)},${Math.round(height)}`;
          if (key === lastKey) {
            sameCount += 1;
          } else {
            sameCount = 1;
            lastKey = key;
          }

          if (sameCount >= STABLE_THRESHOLD && key !== publishedKey) {
            publishedKey = key;
            setTargetRect({ x, y, width, height });
          }
          schedule();
        });
      };

      const animFrame = requestAnimationFrame(measure);

      return () => {
        cancelled = true;
        cancelAnimationFrame(animFrame);
        if (timer) clearTimeout(timer);
      };
    }, [isCurrent, ref, setTargetRect]),
  );
}
