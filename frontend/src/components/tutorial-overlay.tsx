import { usePathname } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

import { TutorialScreen } from '@/constants/tutorial';
import { useTutorial } from '@/providers/TutorialProvider';

const DIM_COLOR = 'rgba(17,17,17,0.72)';
const GAP = 16;
const TOOLTIP_ESTIMATED_HEIGHT = 150;

// L'étape courante doit correspondre à l'écran affiché, sinon on n'affiche rien
// (évite qu'un spotlight se dessine sur le mauvais écran pendant/après une leçon).
function screenMatchesPath(screen: TutorialScreen, pathname: string): boolean {
  switch (screen) {
    case 'categories':
      return pathname === '/categories';
    case 'home':
      return pathname === '/';
    case 'lesson-content':
      return pathname === '/lesson-content';
    case 'lesson':
      return pathname === '/lesson';
    default:
      return false;
  }
}

export function TutorialOverlay() {
  const { isActive, currentStep, targetRect, next, skip } = useTutorial();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!isActive || !currentStep) return null;
  if (!screenMatchesPath(currentStep.screen, pathname)) return null;

  const pad = currentStep.cutoutPadding;
  const padBottom = currentStep.cutoutPaddingBottom ?? pad;
  const offsetY = currentStep.cutoutOffsetY ?? 0;
  const hole = targetRect
    ? {
        x: targetRect.x - pad,
        y: targetRect.y - pad + offsetY,
        w: targetRect.width + pad * 2,
        h: targetRect.height + pad + padBottom,
      }
    : null;

  // Position de la bulle (bornée à l'écran, ne chevauche jamais la cible).
  const minTop = insets.top + 12;
  const maxTop = height - insets.bottom - TOOLTIP_ESTIMATED_HEIGHT;
  let tooltipTop: number;
  if (hole && currentStep.placement === 'above') {
    tooltipTop = hole.y - GAP - TOOLTIP_ESTIMATED_HEIGHT;
  } else if (hole) {
    tooltipTop = hole.y + hole.h + GAP;
  } else {
    tooltipTop = maxTop;
  }
  tooltipTop = Math.max(minTop, Math.min(tooltipTop, maxTop));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Fond assombri + trou spotlight — purement visuel, ne capte aucun tap */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <Mask id="tutorial-hole">
              <Rect x={0} y={0} width={width} height={height} fill="white" />
              {hole && (
                <Rect
                  x={hole.x}
                  y={hole.y}
                  width={hole.w}
                  height={hole.h}
                  rx={currentStep.cutoutRadius}
                  ry={currentStep.cutoutRadius}
                  fill="black"
                />
              )}
            </Mask>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={DIM_COLOR}
            mask="url(#tutorial-hole)"
          />
        </Svg>
      </View>

      {/* Bulle d'aide — au-dessus, boutons toujours actifs. Le reste de l'UI
          reste tactile (aucun blocage) pour ne jamais piéger l'utilisateur. */}
      <View style={[styles.tooltip, { top: tooltipTop }]}>
        <Text style={styles.tooltipText}>{currentStep.text}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={skip} hitSlop={8}>
            <Text style={styles.skip}>Passer le tuto</Text>
          </TouchableOpacity>

          {currentStep.requireTap ? (
            <Text style={styles.hint}>👆 Appuie sur l&apos;élément indiqué</Text>
          ) : (
            <TouchableOpacity style={styles.cta} onPress={next} activeOpacity={0.85}>
              <Text style={styles.ctaText}>{currentStep.ctaLabel ?? 'Suivant'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  skip: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A99',
  },
  cta: {
    backgroundColor: '#1A1A1A',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C4DFF',
  },
});
