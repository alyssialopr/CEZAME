import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Lock, PiggyBank, Wallet } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function LessonPath() {
  const router = useRouter();

  return (
    <>
      <View style={styles.unitCard}>
        <Text style={styles.unitTitle}>Unité 1</Text>
        <Text style={styles.unitSubtitle}>Maîtriser ses finances</Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.line} />

        {/* Step completed */}
        <View style={styles.stepContainer}>
          <View style={styles.completedStep}>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.completedStep}>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        {/* START */}
        <View style={styles.startContainer}>
          <View style={styles.startBadge}>
            <Text style={styles.startText}>START</Text>
          </View>

          <TouchableOpacity
            style={styles.mainStep}
            onPress={() => router.push("/lesson-content")}>
            <PiggyBank color="#4B1D9A" size={42} />
          </TouchableOpacity>
        </View>

        {/* Mascotte */}
        <View style={styles.speechWrapper}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Gère ton budget{"\n"}comme un pro !
            </Text>
          </View>

          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />
        </View>

        {/* Locked */}
        <View style={styles.stepContainer}>
          <View style={styles.lockedStep}>
            <Lock size={28} color="#AFAFB8" />
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.lockedStep}>
            <Wallet size={28} color="#AFAFB8" />
          </View>
        </View>
      </View>

      {/* UNITÉ 2 */}
      <View style={styles.unitCard}>
        <Text style={styles.unitTitle}>Unité 2</Text>
        <Text style={styles.unitSubtitle}>Les impôts démystifiés</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  unitCard: {
    margin: 24,
    backgroundColor: "#A178FF",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
  },

  unitTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },

  unitSubtitle: {
    color: "white",
    marginTop: 5,
    fontSize: 18,
  },

  timeline: {
    alignItems: "center",
    position: "relative",
    paddingBottom: 50,
  },

  line: {
    position: "absolute",
    width: 8,
    backgroundColor: "#DDD",
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },

  stepContainer: {
    marginVertical: 28,
  },

  completedStep: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#A8EA73",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#86D95B",
  },

  check: {
    fontSize: 34,
    color: "#366D19",
    fontWeight: "bold",
  },

  startContainer: {
    alignItems: "center",
    marginVertical: 25,
  },

  startBadge: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 5,
    zIndex: 2,
  },

  startText: {
    color: "#6D4AFF",
    fontWeight: "700",
  },

  mainStep: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#9B6CFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#8B5CF6",
  },

  speechWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 40,
  },

  bubble: {
    backgroundColor: "#8BD0C6",
    padding: 18,
    borderRadius: 18,
    marginRight: 15,
    width: 200,
  },

  bubbleText: {
    fontWeight: "700",
    fontSize: 20,
    color: "#0D2A2A",
  },

  mascot: {
    width: 72,
    height: 72,
  },

  lockedStep: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ECEAF1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#D4D0DB",
  },
});
