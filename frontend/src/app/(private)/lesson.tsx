import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { LESSON_CONTENT_SCREENS, LESSON_STEPS } from "@/constants/lesson";
import { LESSONS, LessonOption } from "@/constants/lessons";
import { useProgress, useUpdateStreak } from "@/hooks/useProgress";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { useTutorial } from "@/providers/TutorialProvider";

export default function LessonScreen() {
  const router = useRouter();
  const { category: categoryId } = useLocalSearchParams<{ category: string }>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);

  const { data: progressData } = useProgress();
  const updateStreak = useUpdateStreak();
  const insets = useSafeAreaInsets();

  const { pressTarget } = useTutorial();
  const optionsRef = useRef<View>(null);
  useTutorialTarget("lesson-question", optionsRef);

  const lesson = LESSONS[categoryId];
  const category = CATEGORIES.find((item) => item.id === categoryId);

  if (!lesson || !category) {
    return <Redirect href="/categories" />;
  }

  const questions = lesson.questions;
  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const progress =
    (LESSON_CONTENT_SCREENS + questionIndex + (selectedLetter ? 1 : 0)) / LESSON_STEPS;

  function handleSelect(option: LessonOption) {
    if (selectedLetter) return;
    // Répondre à une question termine le tuto (dernière étape).
    pressTarget("lesson-question");
    setSelectedLetter(option.letter);
    if (option.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  async function handleContinue() {
    if (!selectedLetter) return;
    if (isLastQuestion) {
      if (progressData) {
        try {
          await updateStreak.mutateAsync(progressData);
        } catch (e) {
          console.error("Error updating streak", e);
        }
      }

      router.push({
        pathname: '/score',
        params: {
          correct: String(correctCount),
          total: String(questions.length),
          hearts: String(hearts),
        },
      });
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelectedLetter(null);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color="#AFAFB8" size={26} />
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.hearts}>
          <Heart color="#FF4B6E" size={20} />
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.category}>{question.category}</Text>

        <View style={styles.speechWrapper}>
          <Image source={category.mascot} style={styles.mascot} contentFit="contain" />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{question.prompt}</Text>
          </View>
        </View>

        <View ref={optionsRef} style={styles.options}>
          {question.options.map((option) => {
            const isSelected = selectedLetter === option.letter;
            const isRevealed = selectedLetter !== null;
            const isCorrectOption = isRevealed && option.correct;
            const isWrongSelected = isSelected && !option.correct;

            return (
              <TouchableOpacity
                key={option.letter}
                style={[
                  styles.optionRow,
                  isCorrectOption && styles.optionCorrect,
                  isWrongSelected && styles.optionWrong,
                ]}
                disabled={isRevealed}
                onPress={() => handleSelect(option)}>
                <View
                  style={[
                    styles.optionLetter,
                    isCorrectOption && styles.optionLetterCorrect,
                    isWrongSelected && styles.optionLetterWrong,
                  ]}>
                  <Text
                    style={[
                      styles.optionLetterText,
                      (isCorrectOption || isWrongSelected) && styles.optionLetterTextActive,
                    ]}>
                    {option.letter}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedLetter && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>Explication</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { marginBottom: insets.bottom + 12 },
          !selectedLetter && styles.continueButtonDisabled,
        ]}
        disabled={!selectedLetter}
        onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUER</Text>
      </TouchableOpacity>

      {/* L'écran leçon est un fullScreenModal : l'overlay racine peut passer
          derrière le modal sur iOS, on le rend donc aussi ici. */}
      <TutorialOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFAF8",
    paddingHorizontal: 20,
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
  category: {
    color: "#60646C",
    fontWeight: "600",
    fontSize: 15,
    marginTop: 8,
  },
  speechWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
    gap: 15,
  },
  mascot: {
    width: 72,
    height: 72,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#8BD0C6",
    padding: 18,
    borderRadius: 18,
  },
  bubbleText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0D2A2A",
  },
  options: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F0F0F3",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCorrect: {
    backgroundColor: "#EAF9E0",
    borderColor: "#86D95B",
  },
  optionWrong: {
    backgroundColor: "#FDEAEC",
    borderColor: "#FF4B6E",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E1E6",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLetterCorrect: {
    backgroundColor: "#86D95B",
  },
  optionLetterWrong: {
    backgroundColor: "#FF4B6E",
  },
  optionLetterText: {
    fontWeight: "700",
    color: "#60646C",
  },
  optionLetterTextActive: {
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  explanationCard: {
    marginTop: 16,
    backgroundColor: "#EFF3FF",
    borderRadius: 16,
    padding: 16,
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3A5AE8",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3C3C43",
  },
  continueButton: {
    marginBottom: 24,
    backgroundColor: "#A8EA73",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#E7E7E7",
  },
  continueText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#3A6F1E",
  },
});
