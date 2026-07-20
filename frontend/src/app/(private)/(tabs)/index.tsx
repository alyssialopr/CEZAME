import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { LessonPath } from "@/components/lesson-path";
import { useProgress } from "@/hooks/useProgress";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { LESSONS } from "@/constants/lessons";
import { useActiveCategory } from "@/providers/CategoryProvider";
import { useTutorial } from "@/providers/TutorialProvider";
import { Image } from "expo-image";
import { Flame, Gem, Landmark, Lock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();
  const { activeCategory, isInitialized } = useActiveCategory();

  const {
    pending: tutorialPending,
    isActive: tutorialActive,
    start: startTutorial,
    pressTarget,
  } = useTutorial();
  const logoRef = useRef<View>(null);
  const lessonNodeRef = useRef<View>(null);
  useTutorialTarget("home-logo", logoRef);
  useTutorialTarget("lesson-node", lessonNodeRef);

  // Démarre le tuto au 1er passage sur le home après une demande explicite
  // (fin d'onboarding ou « Revoir le tutoriel »).
  useEffect(() => {
    if (tutorialPending && !tutorialActive) {
      startTutorial();
    }
  }, [tutorialPending, tutorialActive, startTutorial]);

  if (!isInitialized) return null; // or a loader

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          ref={logoRef}
          style={styles.logoContainer}
          onPress={() => {
            // Pendant le tuto, taper le logo fait avancer sans quitter le home.
            if (pressTarget("home-logo")) return;
            router.push("/categories");
          }}>
          <Landmark color="#8B5CF6" size={20} />
          <Text style={styles.logo}>CEZAME</Text>
        </TouchableOpacity>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Flame size={18} color={progress?.streak && progress.streak > 0 ? "#FF9800" : "#E5E5E5"} />
            <Text style={styles.orange}>{progress?.streak || 0}</Text>
          </View>

          <View style={styles.stat}>
            <Gem size={18} color="#29B6F6" />
            <Text style={styles.blue}>500</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {LESSONS[activeCategory.id] ? (
          <LessonPath category={activeCategory} nodeRef={lessonNodeRef} />
        ) : (
          <View style={styles.comingSoon}>
            <Image source={activeCategory.mascot} style={styles.mascot} contentFit="contain" />
            <View style={styles.lockedBadge}>
              <Lock size={28} color="#AFAFB8" />
            </View>
            <Text style={styles.comingSoonText}>Cette catégorie arrive bientôt !</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F5F8",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
