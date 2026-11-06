import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { LESSON_STEPS } from "@/constants/lesson";
import { LESSONS } from "@/constants/lessons";
import { useLessonDetails } from "@/hooks/useLessons";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { useTutorial } from "@/providers/TutorialProvider";
import { useHearts } from "@/providers/HeartsProvider";
import { tracker } from "@/services/trackerService";
import { useEffect } from "react";

export default function LessonContentScreen() {
  const router = useRouter();
  const { category: categoryId, lessonId } = useLocalSearchParams<{
    category: string;
    lessonId?: string;
  }>();
  const [screenIndex, setScreenIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { hearts } = useHearts();

  const { pressTarget } = useTutorial();
  const continueRef = useRef<ViewInstance>(null);
  useTutorialTarget("lesson-intro", continueRef);

  const effectiveLessonId = lessonId || `${categoryId}_1`;
  const { data: dbLesson } = useLessonDetails(effectiveLessonId, categoryId);
  const localLesson = LESSONS[categoryId];
  const lesson = dbLesson || (localLesson ? {
    id: effectiveLessonId,
    title: localLesson.title,
    screens: localLesson.screens,
    questions: localLesson.questions,
  } : null);

  const category = CATEGORIES.find((item) => item.id === categoryId);

  if (!lesson || !category) {
    return <Redirect href="/categories" />;
  }

  const screens = lesson.screens || [];
  const screen = screens[screenIndex];
  const isLastScreen = screens.length === 0 || screenIndex === screens.length - 1;
  const questionsCount = (lesson as any).questions?.length || 4;
  const totalSteps = (screens.length || 1) + questionsCount;
  const progress = Math.max(0.06, (screenIndex + 0.3) / totalSteps);

  useEffect(() => {
    tracker.trackLessonEvent('lesson_started', effectiveLessonId, {
      categoryId,
      title: lesson?.title,
      totalScreens: screens.length,
    });
  }, [effectiveLessonId]);

  function handleExit() {
    tracker.trackLessonEvent('lesson_abandoned', effectiveLessonId, {
      categoryId,
      stage: 'theory',
      screenIndex,
    });
    router.replace("/(private)/(tabs)");
  }

  function handleContinue() {
    if (isLastScreen || screens.length === 0) {
      pressTarget("lesson-intro");
      // Événement critique : passage de la théorie vers le Quiz
      tracker.trackLessonEvent('quiz_started', effectiveLessonId, {
        categoryId,
        screensCompleted: screens.length,
      });
      router.replace({
        pathname: "/lesson",
        params: { category: categoryId, lessonId: effectiveLessonId },
      });
      return;
    }
    tracker.trackLessonEvent('screen_read', effectiveLessonId, {
      categoryId,
      screenIndex,
      screenTitle: screen?.title,
    });
    setScreenIndex((i) => i + 1);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <X color="#AFAFB8" size={26} />
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.hearts}>
          <Heart
            color={hearts === 0 ? "#AFAFB8" : "#FF4B6E"}
            fill={hearts === 0 ? "#E5E5E5" : "#FF4B6E"}
            size={20}
          />
          <Text style={[styles.heartsText, hearts === 0 && { color: "#AFAFB8" }]}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{lesson.title}</Text>

        <View style={styles.speechWrapper}>
          <Image source={category.mascot} style={styles.mascot} contentFit="contain" />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{screen.title}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>{screen.body}</Text>
        </View>

        {screen.tip && (
          <View style={[styles.card, styles.tipCard]}>
            <Text style={styles.tipText}>💡 {screen.tip}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        ref={continueRef}
        testID="lesson-content-continue"
        style={[styles.continueButton, { marginBottom: insets.bottom + 12 }]}
        onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFAF8",
    paddingHorizontal: 20,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E7E7E7",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#A8EA73",
    ...(Platform.OS === 'web' ? ({ transition: "width 0.35s ease-out" } as any) : {}),
  },
  hearts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartsText: {
    color: "#FF4B6E",
    fontWeight: "700",
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    color: "#60646C",
    fontWeight: "600",
    fontSize: 15,
    marginTop: 8,
  },
  speechWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 15,
  },
  mascot: {
    width: 64,
    height: 64,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#8BD0C6",
    padding: 16,
    borderRadius: 18,
  },
  bubbleText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0D2A2A",
  },
  card: {
    backgroundColor: "#F0F0F3",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#3C3C43",
  },
  tipCard: {
    marginTop: 16,
    backgroundColor: "#FFF4D9",
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#8A6A0F",
  },
  continueButton: {
    marginBottom: 24,
    backgroundColor: "#A8EA73",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#3A6F1E",
  },
});
