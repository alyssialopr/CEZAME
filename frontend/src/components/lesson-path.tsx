import { Category } from "@/constants/categories";
import { getCategoryTip } from "@/constants/categoryTips";
import { useCategoryUnits } from "@/hooks/useLessons";
import { useTutorial } from "@/providers/TutorialProvider";
import { DBLesson } from "@/types/lesson";
import { getMascotSource } from "@/utils/mascots";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Lock, Star } from "lucide-react-native";
import { drawUnitReward, UnitReward } from "@/constants/categoryRewards";
import { useRewards } from "@/hooks/useRewards";
import { RewardModal } from "@/components/reward-modal";
import { UnitRewardChest } from "@/components/unit-reward-chest";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, type ViewInstance } from "react-native";

const OFFSETS = [-38, 0, 38, 0];
const getNodeOffset = (idx: number) => OFFSETS[idx % OFFSETS.length];

interface AnimatedLessonButtonProps {
  lesson: DBLesson;
  category: Category;
  mainColor: string;
  accentColor: string;
  isFirstActive: boolean;
  nodeRef?: RefObject<ViewInstance | null>;
  onPress: () => void;
}

/**
 * Couronne de 1 à 3 étoiles dorées de maîtrise au-dessus du bouton
 */
function MasteryStars({ count }: { count: number }) {
  return (
    <View style={styles.masteryStarsRow}>
      <View style={styles.starItem}>
        <Star
          size={12}
          color={count >= 1 ? "#F59E0B" : "#CBD5E1"}
          fill={count >= 1 ? "#F59E0B" : "transparent"}
        />
      </View>
      <View style={[styles.starItem, styles.starItemCenter]}>
        <Star
          size={15}
          color={count >= 2 ? "#F59E0B" : "#CBD5E1"}
          fill={count >= 2 ? "#F59E0B" : "transparent"}
        />
      </View>
      <View style={styles.starItem}>
        <Star
          size={12}
          color={count >= 3 ? "#F59E0B" : "#CBD5E1"}
          fill={count >= 3 ? "#F59E0B" : "transparent"}
        />
      </View>
    </View>
  );
}

/**
 * Bouton de leçon interactif avec animations riches (Pack 1 & Étoiles de Maîtrise) :
 * - Étoiles de maîtrise dorées (1 à 3) au-dessus des leçons complétées
 * - Enfoncement 3D tactile réaliste au clic (spring squish)
 * - Respiration douce continue sur le bouton actif
 * - Flottement du badge COMMENCER avec pointeur
 * - Secousse ludique (shake) au clic sur les leçons verrouillées
 */
function AnimatedLessonButton({
  lesson,
  category,
  mainColor,
  accentColor,
  isFirstActive,
  nodeRef,
  onPress,
}: AnimatedLessonButtonProps) {
  const isCompleted = lesson.status === "completed";
  const isUnlocked = lesson.status === "unlocked";

  // Animation d'enfoncement 3D tactile
  const pressAnim = useRef(new Animated.Value(0)).current;

  // Animation de respiration douce du bouton actif
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation de flottement du badge COMMENCER
  const badgeBounce = useRef(new Animated.Value(0)).current;

  // Animation de secousse pour le bouton verrouillé
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Boucle de pulsation du bouton actif
  useEffect(() => {
    if (isUnlocked) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.045,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isUnlocked, pulseAnim]);

  // Boucle de flottement du badge COMMENCER
  useEffect(() => {
    if (isUnlocked) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeBounce, {
            toValue: -5,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(badgeBounce, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isUnlocked, badgeBounce]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 5,
      speed: 60,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      speed: 25,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  };

  const handleLockedPress = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  if (isCompleted) {
    const score = lesson.score ?? 100;
    const starCount = score >= 90 ? 3 : score >= 60 ? 2 : 1;

    return (
      <Animated.View style={{ transform: [{ translateY: pressAnim }], alignItems: "center" }}>
        {/* Étoiles de maîtrise dorées */}
        <MasteryStars count={starCount} />

        <TouchableOpacity
          style={styles.completedStep}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.9}>
          <Text style={styles.check}>✓</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (isUnlocked) {
    return (
      <View style={styles.startBadgeContainer}>
        {/* Badge COMMENCER flottant avec pointeur triangulaire */}
        <Animated.View
          style={[
            styles.startBadgeWrapper,
            { transform: [{ translateY: badgeBounce }] },
          ]}>
          <View style={styles.startBadge}>
            <Text style={[styles.startText, { color: accentColor }]}>COMMENCER</Text>
          </View>
          <View style={styles.startBadgeTriangle} />
        </Animated.View>

        {/* Bouton actif pulsant avec enfoncement tactile */}
        <Animated.View
          ref={isFirstActive ? (nodeRef as any) : undefined}
          style={{
            transform: [
              { translateY: pressAnim },
              { scale: pulseAnim },
            ],
          }}>
          <TouchableOpacity
            style={[
              styles.mainStep,
              {
                backgroundColor: mainColor,
                borderBottomColor: accentColor,
              },
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            activeOpacity={0.92}>
            <category.icon color="#FFFFFF" size={38} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <TouchableOpacity
        style={styles.lockedStep}
        onPress={handleLockedPress}
        activeOpacity={0.85}>
        <Lock size={26} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AnimatedMascotCalloutProps {
  mascotName?: string | null;
  categoryId: string;
  accentColor: string;
  unitTip: {
    type: string;
    title: string;
    text: string;
  };
  mascotOnRight: boolean;
}

/**
 * Mascotte Rico vivante & bulle de conseils avec animation Pop-In et respiration joyeuse
 */
function AnimatedMascotCallout({
  mascotName,
  categoryId,
  accentColor,
  unitTip,
  mascotOnRight,
}: AnimatedMascotCalloutProps) {
  const popAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Apparition élastique de Rico
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 5,
      tension: 70,
      useNativeDriver: true,
    }).start();

    // Apparition légèrement décalée de la bulle
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(bubbleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Petite oscillation vivante de Rico (respiration/flottement)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -4,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [popAnim, bubbleAnim, bounceAnim]);

  return (
    <View
      style={[
        styles.interstitialCalloutRow,
        mascotOnRight
          ? styles.interstitialCalloutRowRight
          : styles.interstitialCalloutRowLeft,
      ]}>
      {/* Si mascotte à gauche */}
      {!mascotOnRight && (
        <Animated.View
          style={{
            transform: [
              { scale: popAnim },
              { translateY: bounceAnim },
            ],
            opacity: popAnim,
          }}>
          <Image
            source={getMascotSource(mascotName, categoryId)}
            style={styles.interstitialMascotImg}
            contentFit="contain"
          />
        </Animated.View>
      )}

      {/* Bulle de conseil avec ouverture pop */}
      <Animated.View
        style={[
          styles.interstitialBubble,
          { borderColor: accentColor },
          {
            transform: [{ scale: bubbleAnim }],
            opacity: bubbleAnim,
          },
        ]}>
        <Text style={[styles.bubbleTagText, { color: accentColor }]}>
          {unitTip.type === "boost" ? "⭐ ENCOURAGEMENT" : "💡 CONSEIL DE RICO"}
        </Text>
        <Text style={styles.bubbleTitleText}>{unitTip.title}</Text>
        <Text style={styles.bubbleBodyText}>{unitTip.text}</Text>
      </Animated.View>

      {/* Si mascotte à droite */}
      {mascotOnRight && (
        <Animated.View
          style={{
            transform: [
              { scale: popAnim },
              { translateY: bounceAnim },
            ],
            opacity: popAnim,
          }}>
          <Image
            source={getMascotSource(mascotName, categoryId)}
            style={styles.interstitialMascotImg}
            contentFit="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

export function LessonPath({
  category,
  nodeRef,
}: {
  category: Category;
  nodeRef?: RefObject<ViewInstance | null>;
}) {
  const router = useRouter();
  const { pressTarget } = useTutorial();
  const { data: units } = useCategoryUnits(category.id);
  const { isChestClaimed, claimChest } = useRewards();

  // État de la modale de récompense ouverte
  const [activeRewardModal, setActiveRewardModal] = useState<{
    unitId: string;
    unitTitle: string;
    reward: UnitReward;
  } | null>(null);

  // Détermination des couleurs de la catégorie
  const accentColor = category.borderColor || "#8B5CF6";
  const mainColor = category.color || "#8B5CF6";

  const handleStartLesson = (lesson: DBLesson) => {
    // Avance le tutoriel si actif et lance la leçon
    pressTarget("lesson-node");
    router.push({
      pathname: "/lesson-content",
      params: {
        category: category.id,
        lessonId: lesson.id,
      },
    });
  };

  const handleOpenChest = (unitId: string, unitTitle: string, unitIndex: number) => {
    // Tirage au sort de la récompense (XP ou Diamants + Badge)
    const reward = drawUnitReward(category.id, unitIndex);
    setActiveRewardModal({
      unitId,
      unitTitle,
      reward,
    });
  };

  if (!units || units.length === 0) {
    return null;
  }

  return (
    <>
      {units.map((unit, unitIndex) => {
        // Conseil ou encouragement pour cette unité
        const unitTip = getCategoryTip(category.id, unitIndex);
        // Position stratégique de la mascotte dans l'unité (après le 1er ou 2e nœud)
        const mascotLessonIndex =
          unit.lessons.length > 2 ? 1 : unit.lessons.length === 2 ? 0 : 0;

        // Statut d'accomplissement de l'unité
        const isUnitCompleted =
          unit.lessons.length > 0 && unit.lessons.every((l) => l.status === "completed");
        const remainingLessons = unit.lessons.filter((l) => l.status !== "completed").length;
        const unitChestClaimed = isChestClaimed(unit.id);

        return (
          <View key={unit.id || `unit_${unitIndex}`}>
            {/* CARTE D'UNITÉ THÉMATIQUE AVEC MASCOTTE CONTEXTUELLE */}
            <View
              style={[
                styles.unitCard,
                {
                  backgroundColor: mainColor,
                  borderColor: accentColor,
                },
              ]}>
              <View style={styles.unitCardContent}>
                <View style={styles.unitTextCol}>
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>{unit.title}</Text>
                  </View>

                  <Text style={styles.unitTitleText}>
                    {unit.subtitle || category.subtitle || category.label}
                  </Text>

                  <View style={styles.unitPill}>
                    <Text style={styles.unitPillText}>✨ 50 XP par leçon</Text>
                  </View>
                </View>

                {/* Mascotte contextuelle */}
                <View style={styles.unitMascotWrapper}>
                  <View style={styles.mascotHalo} />
                  <Image
                    source={getMascotSource(unit.mascot_name, category.id)}
                    style={styles.unitMascotImage}
                    contentFit="contain"
                  />
                </View>
              </View>
            </View>

            {/* PARCOURS DE LEÇONS : STEPPING STONES (OPTION A) */}
            <View style={styles.timeline}>
              {unit.lessons.map((lesson, lessonIndex) => {
                const offset = getNodeOffset(lessonIndex);
                const isFirstActive =
                  lesson.status === "unlocked" &&
                  unit.lessons.slice(0, lessonIndex).every((l) => l.status === "completed");

                // Affichage ponctuel de la mascotte dans l'espace vide après le nœud cible
                const isMascotSpot = lessonIndex === mascotLessonIndex;
                const mascotOnRight = offset <= 0;

                return (
                  <View key={lesson.id} style={styles.stepContainer}>
                    {/* Nœud de leçon interactif animé (effet 3D tactile) */}
                    <View
                      style={[
                        styles.nodeRow,
                        { transform: [{ translateX: offset }] },
                      ]}>
                      <AnimatedLessonButton
                        lesson={lesson}
                        category={category}
                        mainColor={mainColor}
                        accentColor={accentColor}
                        isFirstActive={isFirstActive}
                        nodeRef={nodeRef}
                        onPress={() => handleStartLesson(lesson)}
                      />
                    </View>

                    {/* ÉTAGE INTERSTITIEL : Mascotte & bulle de conseil/encouragement vivante */}
                    {isMascotSpot && (
                      <AnimatedMascotCallout
                        mascotName={unit.mascot_name}
                        categoryId={category.id}
                        accentColor={accentColor}
                        unitTip={unitTip}
                        mascotOnRight={mascotOnRight}
                      />
                    )}
                  </View>
                );
              })}

              {/* PALIER DE RÉCOMPENSE : COFFRE D'UNITÉ (PACK 2) */}
              <UnitRewardChest
                unitId={unit.id}
                unitTitle={unit.title}
                categoryColor={mainColor}
                accentColor={accentColor}
                isCompleted={isUnitCompleted}
                isClaimed={unitChestClaimed}
                remainingCount={remainingLessons}
                onOpenChest={() => handleOpenChest(unit.id, unit.title, unitIndex)}
              />
            </View>
          </View>
        );
      })}

      {/* MODALE FESTIVE DE CÉLÉBRATION DU COFFRE */}
      <RewardModal
        visible={!!activeRewardModal}
        unitTitle={activeRewardModal?.unitTitle || ""}
        categoryColor={mainColor}
        reward={activeRewardModal?.reward || null}
        onClaim={async () => {
          if (activeRewardModal) {
            await claimChest(activeRewardModal.unitId, activeRewardModal.reward);
            setActiveRewardModal(null);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  unitCard: {
    marginHorizontal: 20,
    marginVertical: 18,
    borderRadius: 22,
    borderWidth: 3,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  unitCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  unitTextCol: {
    flex: 1,
    paddingRight: 10,
  },

  unitBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  unitBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E1E24",
  },

  unitTitleText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1A191E",
    lineHeight: 24,
    marginBottom: 8,
  },

  unitPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  unitPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2D2B33",
  },

  unitMascotWrapper: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  mascotHalo: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },

  unitMascotImage: {
    width: 88,
    height: 88,
  },

  timeline: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 30,
  },

  stepContainer: {
    width: "100%",
    alignItems: "center",
  },

  nodeRow: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    zIndex: 2,
  },

  interstitialCalloutRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "88%",
    marginVertical: 12,
  },

  interstitialCalloutRowRight: {
    alignSelf: "flex-end",
    marginRight: 16,
  },

  interstitialCalloutRowLeft: {
    alignSelf: "flex-start",
    marginLeft: 16,
  },

  interstitialMascotImg: {
    width: 62,
    height: 62,
  },

  interstitialBubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  bubbleTagText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  bubbleTitleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 3,
  },

  bubbleBodyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    lineHeight: 16,
  },

  masteryStarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 4,
    gap: 3,
  },

  starItem: {
    padding: 1,
  },

  starItemCenter: {
    marginBottom: 3,
  },

  completedStep: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4ADE80",
    borderBottomWidth: 6,
    borderBottomColor: "#15803D",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  check: {
    fontSize: 34,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  startBadgeContainer: {
    alignItems: "center",
  },

  startBadgeWrapper: {
    alignItems: "center",
    marginBottom: 6,
  },

  startBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  startBadgeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
    marginTop: -1,
  },

  startText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.6,
  },

  mainStep: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.45)",
    borderBottomWidth: 7,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  lockedStep: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderBottomWidth: 5,
    borderBottomColor: "#CBD5E1",
  },
});
