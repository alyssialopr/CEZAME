import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewInstance,
} from "react-native";

import { LessonPath } from "@/components/lesson-path";
import { AnimatedCounter } from "@/components/animated-counter";
import { GameOverModal } from "@/components/GameOverModal";
import { useProgress } from "@/hooks/useProgress";
import { useRewards } from "@/hooks/useRewards";
import { useHearts } from "@/providers/HeartsProvider";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { LESSONS } from "@/constants/lessons";
import { TUTORIAL_STEPS } from "@/constants/tutorial";
import { useActiveCategory } from "@/providers/CategoryProvider";
import { useTutorial } from "@/providers/TutorialProvider";
import { Image } from "expo-image";
import { Flame, Gem, Heart, LayoutGrid, Lock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();
  const { gems } = useRewards();
  const { hearts, refillWithGems } = useHearts();
  const { activeCategory, isInitialized } = useActiveCategory();
  const [isHeaderRefillModalOpen, setIsHeaderRefillModalOpen] = useState(false);

  const {
    pending: tutorialPending,
    isActive: tutorialActive,
    start: startTutorial,
    pressTarget,
  } = useTutorial();
  const logoRef = useRef<ViewInstance>(null);
  const lessonNodeRef = useRef<ViewInstance>(null);
  useTutorialTarget("home-logo", logoRef);
  useTutorialTarget("lesson-node", lessonNodeRef);

  // Démarre le tuto au 1er passage sur le home après une demande explicite
  // (fin d'onboarding ou « Revoir le tutoriel »).
  useEffect(() => {
    if (tutorialPending && !tutorialActive) {
      const homeStepIndex = TUTORIAL_STEPS.findIndex((s) => s.screen === 'home');
      startTutorial(homeStepIndex >= 0 ? homeStepIndex : 0);
    }
  }, [tutorialPending, tutorialActive, startTutorial]);

  if (!isInitialized) return null; // or a loader

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <TouchableOpacity
            ref={logoRef}
            style={styles.logoContainer}
            onPress={() => {
              // Pendant le tuto, taper le logo fait avancer sans quitter le home.
              if (pressTarget("home-logo")) return;
              router.push("/categories");
            }}>
            <Image
              source={require("@/images/logo.png")}
              style={styles.logoImage}
              contentFit="contain"
            />
            <Text style={styles.logo}>CEZAME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.themesButton}
            onPress={() => router.push("/categories")}>
            <LayoutGrid size={14} color="#7C4DFF" />
            <Text style={styles.themesButtonText}>Thèmes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Flame size={18} color={progress?.streak && progress.streak > 0 ? "#FF9800" : "#E5E5E5"} />
            <AnimatedCounter value={progress?.streak || 0} color="#FF9800" fontSize={14} />
          </View>

          <View style={styles.stat}>
            <Gem size={18} color="#29B6F6" />
            <AnimatedCounter value={gems} color="#29B6F6" fontSize={14} />
          </View>

          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              if (hearts === 0) {
                setIsHeaderRefillModalOpen(true);
              }
            }}
            activeOpacity={hearts === 0 ? 0.7 : 1}>
            <Heart
              size={18}
              color={hearts === 0 ? "#AFAFB8" : "#FF4B6E"}
              fill={hearts === 0 ? "#E5E5E5" : "#FF4B6E"}
            />
            <AnimatedCounter
              value={hearts}
              color={hearts === 0 ? "#AFAFB8" : "#FF4B6E"}
              fontSize={14}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {LESSONS[activeCategory.id] ? (
          <LessonPath category={activeCategory} nodeRef={lessonNodeRef} />
        ) : (
          <View style={styles.comingSoon}>
            <Image
              source={activeCategory.mascot}
              style={styles.mascot}
              contentFit="contain"
              priority="high"
              cachePolicy="memory-disk"
            />
            <View style={styles.lockedBadge}>
              <Lock size={28} color="#AFAFB8" />
            </View>
            <Text style={styles.comingSoonText}>Cette catégorie arrive bientôt !</Text>
          </View>
        )}
      </ScrollView>

      {/* MODALE DE RECHARGE RAPIDE AU CLIC SUR LES CŒURS */}
      <GameOverModal
        visible={isHeaderRefillModalOpen}
        gems={gems}
        onRefillWithGems={async () => {
          const success = await refillWithGems();
          if (success) {
            setIsHeaderRefillModalOpen(false);
          }
        }}
        onExit={() => setIsHeaderRefillModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F5F8",
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  themesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  themesButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C4DFF",
  },

  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#7C4DFF",
  },

  stats: {
    flexDirection: "row",
    gap: 20,
  },

  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  orange: {
    color: "#FF9800",
    fontWeight: "700",
  },

  blue: {
    color: "#29B6F6",
    fontWeight: "700",
  },

  comingSoon: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  mascot: {
    width: 96,
    height: 96,
  },
  lockedBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ECEAF1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#D4D0DB",
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#60646C",
    textAlign: "center",
  },
});
