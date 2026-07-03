import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScoreScreen() {
  const router = useRouter();
  const { correct, total, hearts } = useLocalSearchParams<{
    correct?: string;
    total?: string;
    hearts?: string;
  }>();

  const correctCount = Number(correct ?? 0);
  const totalCount = Number(total ?? 0);
  const heartsLeft = Number(hearts ?? 5);

  function handleFinish() {
    router.dismissTo("/");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/images/RicoHappy.svg")}
          style={styles.mascot}
          contentFit="contain"
        />

        <Text style={styles.title}>Bravo !</Text>
        <Text style={styles.subtitle}>Leçon terminée</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {correctCount}/{totalCount}
            </Text>
            <Text style={styles.statLabel}>Bonnes réponses</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.heartsRow}>
              <Heart color="#FF4B6E" size={22} />
              <Text style={styles.statValue}>{heartsLeft}</Text>
            </View>
            <Text style={styles.statLabel}>Cœurs restants</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishText}>TERMINER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFAF8",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#60646C",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#F0F0F3",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 6,
    minWidth: 130,
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  statLabel: {
    fontSize: 13,
    color: "#60646C",
    fontWeight: "600",
  },
  finishButton: {
    marginBottom: 24,
    backgroundColor: "#A8EA73",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  finishText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#3A6F1E",
  },
});
