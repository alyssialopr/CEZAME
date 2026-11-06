import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Award, Flame, Gem, Heart, Zap } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { useProgress } from "@/hooks/useProgress";
import { useRewards } from "@/hooks/useRewards";
import { tracker } from "@/services/trackerService";
import { useEffect, useRef } from "react";

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

  const { width, height } = Dimensions.get("window");
  
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
        <View style={styles.content}>
          <Image
            source={require("@/images/RicoJoy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />

          <Text style={styles.title}>FÉLICITATIONS !</Text>

          <View style={styles.streakCard}>
            <View style={styles.flamesRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Flame
                  key={day}
                  size={32}
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
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  mascot: {
    width: "100%",
    height: 350,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
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
