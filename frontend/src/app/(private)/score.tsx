import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Flame, Zap } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { useProgress } from "@/hooks/useProgress";

export default function ScoreScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();

  function handleFinish() {
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
            <Text style={styles.streakText}>{streak} jours de suite</Text>
          </View>

          <View style={styles.xpPill}>
            <Zap size={20} color="#1D8271" fill="#1D8271" />
            <Text style={styles.xpText}>+50 XP</Text>
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
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#1D8271",
    gap: 8,
  },
  xpText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D8271",
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
