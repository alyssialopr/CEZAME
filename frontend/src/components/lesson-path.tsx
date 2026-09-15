import { Category } from "@/constants/categories";
import { useCategoryUnits } from "@/hooks/useLessons";
import { useTutorial } from "@/providers/TutorialProvider";
import { DBLesson } from "@/types/lesson";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
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
  const { data: units } = useCategoryUnits(category.id);

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

  if (!units || units.length === 0) {
    return null;
  }

  return (
    <>
      {units.map((unit, unitIndex) => {
        return (
          <View key={unit.id || `unit_${unitIndex}`}>
            {/* CARTE D'UNITÉ */}
            <View style={[styles.unitCard, { backgroundColor: mainColor }]}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={[styles.unitSubtitle, { color: accentColor }]}>
                {unit.subtitle || category.subtitle}
              </Text>
            </View>

            {/* PARCOURS DE LEÇONS DANS CETTE UNITÉ */}
            <View style={styles.timeline}>
              <View style={styles.line} />

              {unit.lessons.map((lesson, lessonIndex) => {
                const isFirstActive =
                  lesson.status === "unlocked" &&
                  unit.lessons.slice(0, lessonIndex).every((l) => l.status === "completed");

                // Mascotte insérée après la 1ère ou 2ème leçon de l'Unité 1
                const showMascot = unitIndex === 0 && lessonIndex === 1;

                return (
                  <View key={lesson.id} style={styles.nodeWrapper}>
                    {lesson.status === "completed" ? (
                      /* Étape complétée */
                      <View style={styles.stepContainer}>
                        <TouchableOpacity
                          style={[
                            styles.completedStep,
                            { backgroundColor: accentColor, borderColor: mainColor },
                          ]}
                          onPress={() => handleStartLesson(lesson)}
                          activeOpacity={0.8}>
                          <Text style={[styles.check, { color: mainColor }]}>✓</Text>
                        </TouchableOpacity>
                      </View>
                    ) : lesson.status === "unlocked" ? (
                      /* Étape en cours (START) */
                      <View style={styles.startContainer}>
                        <View style={styles.startBadge}>
                          <Text style={[styles.startText, { color: accentColor }]}>START</Text>
                        </View>

                        <TouchableOpacity
                          ref={isFirstActive ? nodeRef : undefined}
                          style={[
                            styles.mainStep,
                            { backgroundColor: category.color, borderColor: accentColor },
                          ]}
                          onPress={() => handleStartLesson(lesson)}
                          activeOpacity={0.85}>
                          <category.icon color="#FFFFFF" size={42} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Étape verrouillée */
                      <View style={styles.stepContainer}>
                        <View style={styles.lockedStep}>
                          <Lock size={28} color="#AFAFB8" />
                        </View>
                      </View>
                    )}

                    {/* Bulle mascotte */}
                    {showMascot && (
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
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  unitCard: {
    margin: 24,
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

  nodeWrapper: {
    alignItems: "center",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginVertical: 30,
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
