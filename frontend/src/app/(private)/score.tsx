import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Award, Flame, Gem, Heart, Zap } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { useProgress } from "@/hooks/useProgress";
import { useRewards } from "@/hooks/useRewards";
import { tracker } from "@/services/trackerService";
import { useEffect, useRef } from "react";

// La mascotte occupe ~24 % de la hauteur d'écran + 5 px (entre 101 et 225 px) :
// sur un petit téléphone, le bouton CONTINUER reste visible sans défilement.
const MASCOT_MIN = 101;
const MASCOT_MAX = 225;
const MASCOT_EXTRA = 5;
const MASCOT_SCREEN_RATIO = 0.24;
// En dessous de cette hauteur, les espacements et les textes sont resserrés.
const COMPACT_HEIGHT = 720;

function mascotHeightFor(screenHeight: number): number {
  return Math.round(Math.min(MASCOT_MAX, Math.max(MASCOT_MIN, screenHeight * MASCOT_SCREEN_RATIO + MASCOT_EXTRA)));
}

export default function ScoreScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();
  const { addGems } = useRewards();
  const rewardedRef = useRef(false);

  const { correct, total, hearts } = useLocalSearchParams<{
    correct?: string;
    total?: string;
    hearts?: string;
  }>();

  useEffect(() => {
    tracker.track('score_viewed', { streak: progress?.streak || 0 });
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      addGems(10);
    }
  }, [addGems]);

  function handleFinish() {
    tracker.trackClick('score_finish_button');
    router.dismissTo("/");
  }

  const { width, height } = useWindowDimensions();
  const isCompact = height < COMPACT_HEIGHT;
  const mascotHeight = mascotHeightFor(height);

  const streak = progress?.streak || 0;
  // Compute how many flames to color out of 7
  const activeFlames = streak === 0 ? 0 : streak % 7 === 0 ? 7 : streak % 7;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfettiCannon
        count={200}
        origin={{ x: width / 2, y: height / 4 }}
        autoStart={true}
        fadeOut={true}
        fallSpeed={3000}
        explosionSpeed={350}
      />
      <View style={styles.container}>
        {/* Le contenu défile si besoin ; le pied de page (CONTINUER) reste fixé en bas. */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Image
            source={require("@/images/RicoJoy.svg")}
            style={[styles.mascot, { height: mascotHeight }, isCompact && styles.mascotCompact]}
            contentFit="contain"
          />

          <Text testID="score-title" style={[styles.title, isCompact && styles.titleCompact]}>
            FÉLICITATIONS !
          </Text>

          <View style={[styles.streakCard, isCompact && styles.streakCardCompact]}>
            <View style={styles.flamesRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Flame
                  key={day}
                  size={isCompact ? 26 : 32}
                  color={day <= activeFlames ? "#FF9600" : "#E5E5E5"}
                  fill={day <= activeFlames ? "#FF9600" : "#E5E5E5"}
                />
              ))}
            </View>
            <Text style={styles.streakText}>
              {streak} {Number(streak) > 1 ? "jours" : "jour"} de suite
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Heart size={20} color="#FF4B6E" fill="#FF4B6E" />
              <Text style={styles.statLabel}>Vies restantes</Text>
              <Text style={styles.statValue}>{hearts || '5'}/5</Text>
            </View>
            <View style={styles.statBox}>
              <Award size={20} color="#3B82F6" />
              <Text style={styles.statLabel}>Précision</Text>
              <Text style={styles.statValue}>
                {total && Number(total) > 0
                  ? `${Math.round((Number(correct || 0) / Number(total)) * 100)}%`
                  : '100%'}
              </Text>
            </View>
          </View>

          <View style={styles.rewardsRow}>
            <View style={styles.xpPill}>
              <Zap size={20} color="#1D8271" fill="#1D8271" />
              <Text style={styles.xpText}>+50 XP</Text>
            </View>
            <View style={styles.gemPill}>
              <Gem size={20} color="#0284C7" fill="#0284C7" />
              <Text style={styles.gemText}>+10 💎</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, isCompact && styles.footerCompact]}>
          <TouchableOpacity testID="score-continue" style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishText}>CONTINUER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBFAF8",
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentCompact: {
    paddingVertical: 8,
  },
  mascot: {
    width: "100%",
    marginBottom: 16,
  },
  mascotCompact: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 20,
  },
  titleCompact: {
    fontSize: 26,
    marginBottom: 12,
  },
  streakCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  streakCardCompact: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  flamesRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  streakText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A5EFE3",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#1D8271",
    gap: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D8271",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  rewardsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gemPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#0284C7",
    gap: 8,
  },
  gemText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0284C7",
  },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FBFAF8",
  },
  footerCompact: {
    paddingVertical: 12,
  },
  finishButton: {
    backgroundColor: "#A8EA73",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  finishText: {
    fontWeight: "800",
    fontSize: 16,
    color: "#3A6F1E",
  },
});
