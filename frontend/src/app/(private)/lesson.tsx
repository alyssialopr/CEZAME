import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { LESSON_CONTENT_SCREENS, LESSON_STEPS } from "@/constants/lesson";
import { LESSONS, LessonOption, QuestionType } from "@/constants/lessons";
import { useProgress } from "@/hooks/useProgress";
import { useCompleteLesson, useLessonDetails } from "@/hooks/useLessons";
import { OrderExercise } from "@/components/exercises/OrderExercise";
import { MatchingExercise } from "@/components/exercises/MatchingExercise";
import { DocumentExercise } from "@/components/exercises/DocumentExercise";
import { BucketExercise } from "@/components/exercises/BucketExercise";
import { ScamExercise } from "@/components/exercises/ScamExercise";
import { ScenarioExercise } from "@/components/exercises/ScenarioExercise";
import { DocumentField, BucketData, ScamData, ScenarioData, ScenarioOption } from "@/types/lesson";
import {
  FALLBACK_BUCKET_DATA,
  isBucketAnswerCorrect,
  isScamAnswerCorrect,
  normalizeBucketData,
} from "@/lib/exerciseAnswers";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { useTutorial } from "@/providers/TutorialProvider";
import { tracker } from "@/services/trackerService";

export default function LessonScreen() {
  const router = useRouter();
  const { category: categoryId, lessonId } = useLocalSearchParams<{
    category: string;
    lessonId?: string;
  }>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedDocumentFieldId, setSelectedDocumentFieldId] = useState<string | null>(null);
  const [bucketAssignments, setBucketAssignments] = useState<Record<string, string>>({});
  const [isBucketSubmitted, setIsBucketSubmitted] = useState(false);
  const [isBucketCorrect, setIsBucketCorrect] = useState(false);
  const [scamUserChoice, setScamUserChoice] = useState<boolean | null>(null);
  const [selectedScenarioOptionId, setSelectedScenarioOptionId] = useState<string | null>(null);
  const [isOrderCorrect, setIsOrderCorrect] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);

  const completeLessonMutation = useCompleteLesson();
  const insets = useSafeAreaInsets();

  const { pressTarget } = useTutorial();
  const optionsRef = useRef<ViewInstance>(null);
  useTutorialTarget("lesson-question", optionsRef);

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

  useEffect(() => {
    if (effectiveLessonId) {
      tracker.trackLessonEvent('lesson_started', effectiveLessonId, {
        categoryId,
      });
    }
  }, [effectiveLessonId, categoryId]);

  // Réinitialiser les états dès qu'on change de question
  useEffect(() => {
    setSelectedLetter(null);
    setSelectedDocumentFieldId(null);
    setBucketAssignments({});
    setIsBucketSubmitted(false);
    setIsBucketCorrect(false);
    setScamUserChoice(null);
    setSelectedScenarioOptionId(null);
    setIsOrderSubmitted(false);
    setIsOrderCorrect(false);
    setIsMatchingComplete(false);
  }, [questionIndex]);

  if (!lesson || !category) {
    return <Redirect href="/categories" />;
  }

  const questions = lesson.questions || [];
  const question = questions[questionIndex];
  const isLastQuestion = questions.length === 0 || questionIndex === questions.length - 1;
  const contentScreensCount = lesson.screens?.length || LESSON_CONTENT_SCREENS;
  const totalSteps = contentScreensCount + (questions.length || 8);

  // 1. Parsing défensif des options (supporte objet, chaîne JSON Supabase/AsyncStorage, ou tableau)
  let rawOptions = question?.options;
  if (typeof rawOptions === 'string') {
    try {
      rawOptions = JSON.parse(rawOptions);
    } catch {}
  }

  const firstElem = Array.isArray(rawOptions) ? rawOptions[0] : null;
  const isScenarioPayload = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.context !== undefined || (rawOptions.options && rawOptions.persona))) ||
    (firstElem && typeof firstElem === 'object' && firstElem.context !== undefined)
  );
  const isScamPayload = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.isScam !== undefined || rawOptions.sender !== undefined || rawOptions.channel !== undefined)) ||
    (firstElem && typeof firstElem === 'object' && (firstElem.isScam !== undefined || firstElem.sender !== undefined))
  );
  const isBucketPayload = Boolean(
    (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions) && (rawOptions.buckets !== undefined || rawOptions.items !== undefined)) ||
    (firstElem && typeof firstElem === 'object' && (firstElem.buckets !== undefined || firstElem.bucketId !== undefined)) ||
    (Array.isArray(rawOptions) && rawOptions.some((it: any) => it?.bucketId !== undefined))
  );

  const optionsArr = Array.isArray(rawOptions) ? rawOptions : [];

  // Détection robuste du type d'exercice
  const explicitType = question?.type as QuestionType | undefined;
  let exerciseType: QuestionType;

  if (explicitType === 'document') {
    exerciseType = 'document';
  } else if (explicitType === 'matching') {
    exerciseType = 'matching';
  } else if (explicitType === 'order') {
    exerciseType = 'order';
  } else if (explicitType === 'scam' || isScamPayload) {
    exerciseType = 'scam';
  } else if (explicitType === 'bucket' || isBucketPayload) {
    exerciseType = 'bucket';
  } else if (explicitType === 'scenario' || isScenarioPayload) {
    exerciseType = 'scenario';
  } else if (optionsArr[0]?.label !== undefined && optionsArr[0]?.value !== undefined) {
    exerciseType = 'document';
  } else if (optionsArr[0]?.left !== undefined) {
    exerciseType = 'matching';
  } else if (
    optionsArr[0]?.id !== undefined &&
    optionsArr[0]?.text !== undefined &&
    optionsArr[0]?.label === undefined &&
    optionsArr[0]?.letter === undefined
  ) {
    exerciseType = 'order';
  } else {
    exerciseType = explicitType || 'qcm';
  }

  const scenarioData: ScenarioData = (Array.isArray(rawOptions) && isScenarioPayload ? rawOptions[0] : rawOptions) as ScenarioData;
  const scamData: ScamData = (Array.isArray(rawOptions) && isScamPayload ? rawOptions[0] : rawOptions) as ScamData;

  let bucketData: BucketData = normalizeBucketData(rawOptions);

  // Filet de sécurité si bucketData est vide mais qu'on est sur un exercice bucket
  if (exerciseType === 'bucket' && (!bucketData.items || bucketData.items.length === 0)) {
    bucketData = FALLBACK_BUCKET_DATA;
  }

  const bucketItems = Array.isArray(bucketData?.items) ? bucketData.items : [];
  const areAllBucketItemsAssigned =
    bucketItems.length > 0 && bucketItems.every((it) => Boolean(bucketAssignments[it.id]));

  const isQuestionAnswered =
    exerciseType === 'order'
      ? isOrderSubmitted
      : exerciseType === 'matching'
      ? isMatchingComplete
      : exerciseType === 'document'
      ? selectedDocumentFieldId !== null
      : exerciseType === 'bucket'
      ? isBucketSubmitted
      : exerciseType === 'scam'
      ? scamUserChoice !== null
      : exerciseType === 'scenario'
      ? selectedScenarioOptionId !== null
      : selectedLetter !== null;

  const progress =
    (contentScreensCount + questionIndex + (isQuestionAnswered ? 1 : 0)) / totalSteps;

  function handleSelect(option: LessonOption) {
    if (selectedLetter) return;
    // Répondre à une question termine le tuto (dernière étape).
    pressTarget("lesson-question");
    setSelectedLetter(option.letter || 'A');
    if (option.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleSelectDocumentField(field: DocumentField) {
    if (selectedDocumentFieldId) return;
    pressTarget("lesson-question");
    setSelectedDocumentFieldId(field.id);
    if (field.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleVerifyOrder() {
    pressTarget("lesson-question");
    setIsOrderSubmitted(true);
    if (isOrderCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleBucketAssign(itemId: string, bucketId: string) {
    if (isBucketSubmitted) return;
    setBucketAssignments((prev) => ({ ...prev, [itemId]: bucketId }));
  }

  function handleVerifyBucket() {
    pressTarget("lesson-question");
    const allCorrect = isBucketAnswerCorrect(bucketItems, bucketAssignments);
    setIsBucketCorrect(allCorrect);
    setIsBucketSubmitted(true);
    if (allCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleScamChoice(choseScam: boolean) {
    if (scamUserChoice !== null) return;
    pressTarget("lesson-question");
    setScamUserChoice(choseScam);
    if (isScamAnswerCorrect(scamData, choseScam)) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleScenarioSelect(option: ScenarioOption) {
    if (selectedScenarioOptionId !== null) return;
    pressTarget("lesson-question");
    setSelectedScenarioOptionId(option.id);
    if (option.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  async function handleContinue() {
    if (!isQuestionAnswered) return;
    if (isLastQuestion) {
      tracker.trackLessonEvent('lesson_completed', effectiveLessonId, {
        categoryId,
        score: correctCount,
        totalQuestions: questions.length,
        remainingHearts: hearts,
      });

      try {
        await completeLessonMutation.mutateAsync({
          lessonId: effectiveLessonId,
          categoryId,
          score: correctCount,
        });
      } catch (e) {
        console.error("Error updating lesson completion", e);
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
  }

  function handleExit() {
    tracker.trackLessonEvent('lesson_abandoned', effectiveLessonId, {
      categoryId,
      questionIndex,
      remainingHearts: hearts,
    });
    router.replace("/(private)/(tabs)");
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
          <Heart color="#FF4B6E" size={20} />
          <Text testID="lesson-hearts" style={styles.heartsText}>{hearts}</Text>
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

        {/* RENDU DYNAMIQUE DE L'EXERCICE */}
        {exerciseType === 'order' ? (
          <View ref={optionsRef}>
            <OrderExercise
              items={rawOptions as any}
              isRevealed={isOrderSubmitted}
              onOrderChange={setIsOrderCorrect}
            />
          </View>
        ) : exerciseType === 'matching' ? (
          <View ref={optionsRef}>
            <MatchingExercise
              pairs={rawOptions as any}
              isRevealed={isMatchingComplete}
              onComplete={() => {
                pressTarget("lesson-question");
                setIsMatchingComplete(true);
                setCorrectCount((c) => c + 1);
              }}
              onMistake={() => {
                setHearts((h) => Math.max(0, h - 1));
              }}
            />
          </View>
        ) : exerciseType === 'document' ? (
          <View ref={optionsRef}>
            <DocumentExercise
              fields={rawOptions as any}
              documentTitle={question.category}
              selectedFieldId={selectedDocumentFieldId}
              isRevealed={selectedDocumentFieldId !== null}
              onSelectField={handleSelectDocumentField}
            />
          </View>
        ) : exerciseType === 'bucket' ? (
          <View ref={optionsRef}>
            <BucketExercise
              data={bucketData}
              userAssignments={bucketAssignments}
              isRevealed={isBucketSubmitted}
              onAssign={handleBucketAssign}
            />
          </View>
        ) : exerciseType === 'scam' ? (
          <View ref={optionsRef}>
            <ScamExercise
              data={scamData}
              userChoice={scamUserChoice}
              isRevealed={scamUserChoice !== null}
              onChoose={handleScamChoice}
            />
          </View>
        ) : exerciseType === 'scenario' ? (
          <View ref={optionsRef}>
            <ScenarioExercise
              data={scenarioData}
              selectedOptionId={selectedScenarioOptionId}
              isRevealed={selectedScenarioOptionId !== null}
              onSelectOption={handleScenarioSelect}
            />
          </View>
        ) : (
          <View ref={optionsRef} style={styles.options}>
            {optionsArr.map((option: any, index: number) => {
              const optionLetter = option.letter || String.fromCharCode(65 + index);
              const isSelected = selectedLetter === optionLetter;
              const isRevealed = selectedLetter !== null;
              const isCorrectOption = isRevealed && option.correct;
              const isWrongSelected = isSelected && !option.correct;

              return (
                <TouchableOpacity
                  key={option.id || option.letter || option.text || `opt-${index}`}
                  style={[
                    styles.optionRow,
                    isCorrectOption && styles.optionCorrect,
                    isWrongSelected && styles.optionWrong,
                  ]}
                  testID={`qcm-option-${optionLetter}`}
                  disabled={isRevealed}
                  onPress={() => handleSelect({ ...option, letter: optionLetter })}>
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
                      {optionLetter}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option.text || option.left || ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isQuestionAnswered && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>Explication</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {exerciseType === 'order' && !isOrderSubmitted ? (
        <TouchableOpacity
          style={[
            styles.continueButton,
            { marginBottom: insets.bottom + 12 },
          ]}
          testID="lesson-verify"
          onPress={handleVerifyOrder}>
          <Text style={styles.continueText}>VÉRIFIER</Text>
        </TouchableOpacity>
      ) : exerciseType === 'bucket' && !isBucketSubmitted ? (
        <TouchableOpacity
          style={[
            styles.continueButton,
            { marginBottom: insets.bottom + 12 },
            !areAllBucketItemsAssigned && styles.continueButtonDisabled,
          ]}
          disabled={!areAllBucketItemsAssigned}
          testID="lesson-verify"
          onPress={handleVerifyBucket}>
          <Text style={styles.continueText}>VÉRIFIER</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.continueButton,
            { marginBottom: insets.bottom + 12 },
            !isQuestionAnswered && styles.continueButtonDisabled,
          ]}
          testID="lesson-continue"
          disabled={!isQuestionAnswered}
          onPress={handleContinue}>
          <Text style={styles.continueText}>CONTINUER</Text>
        </TouchableOpacity>
      )}

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
