import { Category } from "@/constants/categories";
import { useTutorial } from "@/providers/TutorialProvider";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Lock, Wallet } from "lucide-react-native";
import type { RefObject } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function LessonPath({
  category,
  nodeRef,
}: {
  category: Category;
  nodeRef?: RefObject<View | null>;
}) {
  const router = useRouter();
  const { pressTarget } = useTutorial();

  // Determine accent color from border color or default
  const accentColor = category.borderColor || "#8B5CF6";
  const mainColor = category.color || "#8B5CF6";

  return (
    <>
      <View style={[styles.unitCard, { backgroundColor: mainColor }]}>
        <Text style={styles.unitTitle}>Unité 1</Text>
        <Text style={[styles.unitSubtitle, { color: accentColor }]}>{category.subtitle}</Text>
      </View>

      <View style={styles.timeline}>
        <View style={styles.line} />

        {/* Step completed */}
        <View style={styles.stepContainer}>
          <View style={[styles.completedStep, { backgroundColor: accentColor, borderColor: mainColor }]}>
            <Text style={[styles.check, { color: mainColor }]}>✓</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={[styles.completedStep, { backgroundColor: accentColor, borderColor: mainColor }]}>
            <Text style={[styles.check, { color: mainColor }]}>✓</Text>
          </View>
        </View>

        {/* START */}
        <View style={styles.startContainer}>
          <View style={styles.startBadge}>
            <Text style={[styles.startText, { color: accentColor }]}>START</Text>
          </View>

          <TouchableOpacity
            ref={nodeRef}
            style={[styles.mainStep, { backgroundColor: category.color, borderColor: accentColor }]}
            onPress={() => {
              // Tap START : avance le tuto ET lance la leçon (flux réel).
              pressTarget("lesson-node");
              router.push({ pathname: "/lesson-content", params: { category: category.id } });
            }}>
            <category.icon color="#FFFFFF" size={42} />
          </TouchableOpacity>
        </View>

        {/* Mascotte */}
        <View style={styles.speechWrapper}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Lance-toi dans les {"\n"}défis {category.label} !
            </Text>
          </View>

          <Image
            source={category.mascot}
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
