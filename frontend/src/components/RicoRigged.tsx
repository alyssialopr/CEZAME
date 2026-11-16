import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import type { RicoEmotion } from '@/utils/mascots';

export type RicoRigAnimation = 'idle' | 'wave' | 'celebrate' | 'shiver' | 'angry' | 'none';

export interface RicoRiggedProps {
  size?: number;
  emotion?: RicoEmotion;
  animation?: RicoRigAnimation;
}

const RIG_ASSETS = {
  torso: require('@/images/rig/torso.png'),
  head: require('@/images/rig/head.png'),
  beak: require('@/images/rig/beak.png'),
  wingLeft: require('@/images/rig/wing_left.png'),
  wingRight: require('@/images/rig/wing_right.png'),
  footLeft: require('@/images/rig/foot_left.png'),
  footRight: require('@/images/rig/foot_right.png'),
  tail: require('@/images/rig/tail.png'),
};

function normalizeEmotion(emotion?: RicoEmotion): string {
  switch (emotion) {
    case 'triste':
    case 'sad':
      return 'sad';
    case 'surpris':
    case 'surprised':
      return 'surprised';
    case 'reflechi':
    case 'thoughtful':
      return 'thoughtful';
    case 'fiere':
    case 'proud':
      return 'proud';
    case 'inquiet':
    case 'worried':
      return 'worried';
    case 'froid':
    case 'cold':
      return 'cold';
    case 'rechauffe':
    case 'warm':
      return 'warm';
    case 'enerve':
    case 'angry':
      return 'angry';
    default:
      return 'default';
  }
}

function resolveAnimation(emotionKey: string, animation?: RicoRigAnimation): RicoRigAnimation {
  if (animation) return animation;
  if (emotionKey === 'cold') return 'shiver';
  if (emotionKey === 'angry') return 'angry';
  if (emotionKey === 'proud') return 'celebrate';
  return 'idle';
}

/**
 * Mascotte Rico riggée en 2D cut-out (Reanimated + SVG) avec os hiérarchiques :
 * hip -> torso -> head -> beak, wing_left, wing_right, tail, foot_left, foot_right.
 */
export function RicoRigged({ size = 220, emotion = 'default', animation }: RicoRiggedProps) {
  const emotionKey = normalizeEmotion(emotion);
  const activeAnim = resolveAnimation(emotionKey, animation);
  const scale = size / 512;

  const [isBlinking, setIsBlinking] = useState(false);

  const breath = useSharedValue(0);
  const headRot = useSharedValue(0);
  const beakRot = useSharedValue(0);
  const wingLRot = useSharedValue(0);
  const wingRRot = useSharedValue(0);
  const tailRot = useSharedValue(0);
  const shiverX = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      const t = setTimeout(() => setIsBlinking(false), 140);
      return () => clearTimeout(t);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    breath.value = 0;
    headRot.value = 0;
    beakRot.value = 0;
    wingLRot.value = 0;
    wingRRot.value = 0;
    tailRot.value = 0;
    shiverX.value = 0;

    if (activeAnim === 'none') return;

    if (activeAnim === 'shiver') {
      shiverX.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 55 }),
          withTiming(4, { duration: 55 })
        ),
        -1,
        true
      );
      beakRot.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 65 }),
          withTiming(2, { duration: 65 })
        ),
        -1,
        true
      );
      wingLRot.value = withTiming(-25, { duration: 250 });
      wingRRot.value = withTiming(25, { duration: 250 });
      return;
    }

    if (activeAnim === 'celebrate') {
      breath.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 320, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
      wingLRot.value = withRepeat(
        withSequence(withTiming(-28, { duration: 280 }), withTiming(8, { duration: 280 })),
        -1,
        true
      );
      wingRRot.value = withRepeat(
        withSequence(withTiming(28, { duration: 280 }), withTiming(-8, { duration: 280 })),
        -1,
        true
      );
      headRot.value = withRepeat(
        withSequence(withTiming(-5, { duration: 320 }), withTiming(5, { duration: 320 })),
        -1,
        true
      );
      return;
    }

    if (activeAnim === 'wave') {
      wingLRot.value = withRepeat(
        withSequence(withTiming(-38, { duration: 340 }), withTiming(-10, { duration: 340 })),
        -1,
        true
      );
      headRot.value = withRepeat(
        withSequence(withTiming(-4, { duration: 900 }), withTiming(4, { duration: 900 })),
        -1,
        true
      );
      return;
    }

    if (activeAnim === 'angry') {
      headRot.value = withRepeat(
        withSequence(withTiming(-3, { duration: 180 }), withTiming(3, { duration: 180 })),
        -1,
        true
      );
      breath.value = withRepeat(
        withSequence(withTiming(-4, { duration: 400 }), withTiming(0, { duration: 400 })),
        -1,
        true
      );
      return;
    }

    // Idle animation
    breath.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    headRot.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(3, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    wingLRot.value = withRepeat(
      withSequence(withTiming(-6, { duration: 1400 }), withTiming(3, { duration: 1400 })),
      -1,
      true
    );
    wingRRot.value = withRepeat(
      withSequence(withTiming(6, { duration: 1400 }), withTiming(-3, { duration: 1400 })),
      -1,
      true
    );
    tailRot.value = withRepeat(
      withSequence(withTiming(-6, { duration: 1100 }), withTiming(6, { duration: 1100 })),
      -1,
      true
    );
  }, [activeAnim, breath, headRot, beakRot, wingLRot, wingRRot, tailRot, shiverX]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shiverX.value }, { translateY: breath.value }],
  }));

  const headStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${headRot.value}deg` }],
  }));

  const beakStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${beakRot.value}deg` }],
  }));

  const wingLStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wingLRot.value}deg` }],
  }));

  const wingRStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wingRRot.value}deg` }],
  }));

  const tailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tailRot.value}deg` }],
  }));

  const pupilRadius = emotionKey === 'surprised' ? 9 : 13;
  const eyeClosed = isBlinking || emotionKey === 'warm';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.canvas,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {/* Pieds (ancrés au sol) */}
        <Image
          source={RIG_ASSETS.footLeft}
          style={[styles.part, { left: 175, top: 392, width: 74, height: 59, zIndex: 2 }]}
          resizeMode="contain"
        />
        <Image
          source={RIG_ASSETS.footRight}
          style={[styles.part, { left: 258, top: 392, width: 74, height: 59, zIndex: 2 }]}
          resizeMode="contain"
        />

        {/* Corps riggé */}
        <Animated.View style={[styles.canvas, bodyStyle]}>
          {/* Queue */}
          <Animated.View
            style={[
              styles.part,
              { left: 278, top: 312, width: 112, height: 90, zIndex: 1 },
              tailStyle,
            ]}
          >
            <Image source={RIG_ASSETS.tail} style={styles.full} resizeMode="contain" />
          </Animated.View>

          {/* Aile gauche */}
          <Animated.View
            style={[
              styles.part,
              { left: 112, top: 230, width: 110, height: 112, zIndex: 3 },
              wingLStyle,
            ]}
          >
            <Image source={RIG_ASSETS.wingLeft} style={styles.full} resizeMode="contain" />
          </Animated.View>

          {/* Torse */}
          <Image
            source={RIG_ASSETS.torso}
            style={[styles.part, { left: 168, top: 215, width: 176, height: 200, zIndex: 4 }]}
            resizeMode="contain"
          />

          {/* Aile droite */}
          <Animated.View
            style={[
              styles.part,
              { left: 292, top: 230, width: 110, height: 112, zIndex: 5 },
              wingRStyle,
            ]}
          >
            <Image source={RIG_ASSETS.wingRight} style={styles.full} resizeMode="contain" />
          </Animated.View>

          {/* Tête + Yeux SVG + Bec */}
          <Animated.View
            style={[
              styles.part,
              { left: 158, top: 82, width: 196, height: 175, zIndex: 6 },
              headStyle,
            ]}
          >
            <Image
              source={RIG_ASSETS.head}
              style={{ width: 186, height: 157, position: 'absolute', left: 10, top: 8 }}
              resizeMode="contain"
            />

            {/* Overlay expressif SVG (pupilles, sourcils, larmes, joues) */}
            <Svg width={196} height={175} viewBox="0 0 196 175" style={styles.full}>
              {/* Pupille œil droit (visuel principal) */}
              {eyeClosed ? (
                <Path
                  d="M 118 76 Q 134 62 150 76"
                  stroke="#18122B"
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <>
                  <Circle cx={133} cy={78} r={pupilRadius} fill="#14141F" />
                  <Circle cx={128} cy={73} r={4} fill="#FFFFFF" />
                </>
              )}

              {/* Joues roses (warm) ou bleutées (cold) */}
              {emotionKey === 'warm' && (
                <Ellipse cx={142} cy={106} rx={16} ry={10} fill="rgba(255, 107, 129, 0.55)" />
              )}
              {emotionKey === 'cold' && (
                <Ellipse cx={142} cy={106} rx={16} ry={10} fill="rgba(116, 185, 255, 0.5)" />
              )}

              {/* Larme (sad) */}
              {emotionKey === 'sad' && (
                <Path
                  d="M 142 98 C 142 98 150 112 142 117 C 134 112 142 98 142 98 Z"
                  fill="#48DBFB"
                />
              )}

              {/* Goutte de sueur (worried) */}
              {emotionKey === 'worried' && (
                <Path
                  d="M 168 54 C 168 54 176 68 168 74 C 160 68 168 54 168 54 Z"
                  fill="#74B9FF"
                />
              )}

              {/* Sourcils selon émotion */}
              {emotionKey === 'angry' && (
                <Path
                  d="M 114 48 L 152 60"
                  stroke="#1E1038"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              )}
              {(emotionKey === 'sad' || emotionKey === 'worried' || emotionKey === 'cold') && (
                <Path
                  d="M 116 56 Q 134 46 152 50"
                  stroke="#1E1038"
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {(emotionKey === 'surprised' || emotionKey === 'thoughtful') && (
                <Path
                  d="M 118 42 Q 134 32 150 42"
                  stroke="#1E1038"
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </Svg>

            {/* Bec */}
            <Animated.View
              style={[
                styles.part,
                { left: -62, top: 44, width: 128, height: 95, zIndex: 7 },
                beakStyle,
              ]}
            >
              <Image source={RIG_ASSETS.beak} style={styles.full} resizeMode="contain" />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  canvas: {
    width: 512,
    height: 512,
    position: 'relative',
  },
  part: {
    position: 'absolute',
  },
  full: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
