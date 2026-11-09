import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Heart, HeartCrack, X, BookOpen } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { TutorialOverlay } from "@/components/tutorial-overlay";
import { LESSON_CONTENT_SCREENS, LESSON_STEPS } from "@/constants/lesson";
import { LESSONS, LessonOption, QuestionType } from "@/constants/lessons";
import { useProgress } from "@/hooks/useProgress";
import { useRewards } from "@/hooks/useRewards";
import { useCompleteLesson, useLessonDetails } from "@/hooks/useLessons";
import { OrderExercise } from "@/components/exercises/OrderExercise";
import { MatchingExercise } from "@/components/exercises/MatchingExercise";
import { DocumentExercise } from "@/components/exercises/DocumentExercise";
import { BucketExercise } from "@/components/exercises/BucketExercise";
import { ScamExercise } from "@/components/exercises/ScamExercise";
import { ScenarioExercise } from "@/components/exercises/ScenarioExercise";
import { GameOverModal } from "@/components/GameOverModal";
import { DocumentField, BucketData, BucketItem, ScamData, ScenarioData, ScenarioOption } from "@/types/lesson";
import {
  FALLBACK_BUCKET_DATA,
  isBucketAnswerCorrect,
  isScamAnswerCorrect,
  normalizeBucketData,
} from "@/lib/exerciseAnswers";
import { useTutorialTarget } from "@/hooks/useTutorialTarget";
import { useTutorial } from "@/providers/TutorialProvider";
import { useHearts } from "@/providers/HeartsProvider";
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
  const [correctCount, setCorrectCount] = useState(0);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);

  const { hearts, loseHeart, refillWithGems } = useHearts();
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const { gems } = useRewards();

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
  const contentScreensCount = lesson.screens?.length || 1;
  const totalSteps = contentScreensCount + (questions.length || 4);

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

  function triggerHeartLossFeedback() {
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Dès que les cœurs tombent à 0, bloquer immédiatement la leçon
  useEffect(() => {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
    }
  }, [hearts]);

  async function handleMistake() {
    triggerHeartLossFeedback();
    const remaining = await loseHeart();
    if (remaining <= 0) {
      setIsGameOverModalOpen(true);
    }
  }

  function trackAnswer(isCorrect: boolean) {
    tracker.trackLessonEvent('question_answered', effectiveLessonId, {
      categoryId,
      questionIndex,
      exerciseType,
      prompt: question?.prompt ? question.prompt.slice(0, 100) : `Question ${questionIndex + 1}`,
      isCorrect,
      remainingHearts: hearts - (isCorrect ? 0 : 1),
    });
  }

  function handleSelect(option: LessonOption) {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    if (selectedLetter) return;
    // Répondre à une question termine le tuto (dernière étape).
    pressTarget("lesson-question");
    setSelectedLetter(option.letter || 'A');
    const isCorrect = Boolean(option.correct);
    trackAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  function handleSelectDocumentField(field: DocumentField) {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    if (selectedDocumentFieldId) return;
    pressTarget("lesson-question");
    setSelectedDocumentFieldId(field.id);
    const isCorrect = Boolean(field.correct);
    trackAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  function handleVerifyOrder() {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    pressTarget("lesson-question");
    setIsOrderSubmitted(true);
    trackAnswer(isOrderCorrect);
    if (isOrderCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  function handleBucketAssign(itemId: string, bucketId: string) {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    if (isBucketSubmitted) return;
    setBucketAssignments((prev) => ({ ...prev, [itemId]: bucketId }));
  }

  function handleVerifyBucket() {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    pressTarget("lesson-question");
    const allCorrect = isBucketAnswerCorrect(bucketItems, bucketAssignments);
    setIsBucketCorrect(allCorrect);
    setIsBucketSubmitted(true);
    trackAnswer(allCorrect);
    if (allCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  function handleScamChoice(choseScam: boolean) {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    if (scamUserChoice !== null) return;
    pressTarget("lesson-question");
    setScamUserChoice(choseScam);
    const isCorrect = isScamAnswerCorrect(scamData, choseScam);
    trackAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  function handleScenarioSelect(option: ScenarioOption) {
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }
    if (selectedScenarioOptionId !== null) return;
    pressTarget("lesson-question");
    setSelectedScenarioOptionId(option.id);
    const isCorrect = Boolean(option.correct);
    trackAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      handleMistake();
    }
  }

  async function handleContinue() {
    if (!isQuestionAnswered) return;

    // Si les coeurs sont épuisés, bloquer la progression et afficher le modal de Game Over
    if (hearts <= 0) {
      setIsGameOverModalOpen(true);
      return;
    }

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

  async function handleRefillWithGems() {
    const success = await refillWithGems();
    if (success) {
      setIsGameOverModalOpen(false);
    }
  }

  function handleRestartLesson() {
    setIsGameOverModalOpen(false);
    setQuestionIndex(0);
    setCorrectCount(0);
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
  }

  function handleExit() {
    tracker.trackLessonEvent('lesson_abandoned', effectiveLessonId, {
      categoryId,
      questionIndex,
      remainingHearts: hearts,
    });
    router.replace("/(private)/(tabs)" as any);
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

        <Animated.View style={[styles.hearts, { transform: [{ scale: heartScaleAnim }] }]}>
          <Heart
            color={hearts === 0 ? "#AFAFB8" : "#FF4B6E"}
            fill={hearts === 0 ? "#E5E5E5" : "#FF4B6E"}
            size={20}
          />
          <Text testID="lesson-hearts" style={[styles.heartsText, hearts === 0 && styles.heartsTextEmpty]}>{hearts}</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryHeaderRow}>
          <Text style={styles.category}>{question.category}</Text>

          <TouchableOpacity
            testID="review-lesson-button"
            style={styles.reviewLessonButton}
            onPress={() => setIsLessonModalVisible(true)}
            activeOpacity={0.7}>
            <BookOpen size={14} color="#6366F1" />
            <Text style={styles.reviewLessonButtonText}>Voir la leçon</Text>
          </TouchableOpacity>
        </View>

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
              onMistake={handleMistake}
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

        {hearts === 0 && (
          <View style={styles.emptyHeartsBanner}>
            <HeartCrack size={22} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyHeartsTitle}>Plus de vies !</Text>
              <Text style={styles.emptyHeartsSubtitle}>
                Tu as épuisé tes 5 cœurs. Recharge tes vies avec tes diamants ou recommence la leçon pour continuer.
              </Text>
            </View>
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
            hearts === 0 && styles.continueButtonGameOver,
          ]}
          testID="lesson-continue"
          disabled={!isQuestionAnswered}
          onPress={handleContinue}>
          <Text style={[styles.continueText, hearts === 0 && styles.continueTextGameOver]}>
            {hearts === 0 ? "RECHARGER MES VIES" : "CONTINUER"}
          </Text>
        </TouchableOpacity>
      )}

      {/* MODAL DE GAME OVER QUAND LES COEURS SONT À ZÉRO */}
      <GameOverModal
        visible={isGameOverModalOpen}
        gems={gems}
        onRefillWithGems={handleRefillWithGems}
        onRestartLesson={handleRestartLesson}
        onExit={handleExit}
      />

      {/* MODAL REVOIR LA LEÇON */}
      <Modal
        visible={isLessonModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsLessonModalVisible(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrapper}>
              <Text style={styles.modalCategoryLabel}>{category.label}</Text>
              <Text style={styles.modalTitle}>{lesson.title}</Text>
            </View>
            <TouchableOpacity
              testID="close-lesson-modal"
              onPress={() => setIsLessonModalVisible(false)}
              style={styles.modalCloseButton}>
              <X size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {(lesson.screens || []).map((sc: any, idx: number) => (
              <View key={idx} style={styles.memoCard}>
                <View style={styles.memoCardHeader}>
                  <View style={styles.memoBadge}>
                    <Text style={styles.memoBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.memoCardTitle}>{sc.title}</Text>
                </View>
                <Text style={styles.memoCardBody}>{sc.body}</Text>
                {sc.tip && (
                  <View style={styles.memoTipBox}>
                    <Text style={styles.memoTipText}>💡 {sc.tip}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              testID="resume-quiz-button"
              style={styles.resumeQuizButton}
              onPress={() => setIsLessonModalVisible(false)}
              activeOpacity={0.8}>
              <Text style={styles.resumeQuizButtonText}>Reprendre les questions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  continueButtonGameOver: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  continueText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#3A6F1E",
  },
  continueTextGameOver: {
    color: "#DC2626",
    fontWeight: "900",
  },
  heartsTextEmpty: {
    color: "#AFAFB8",
  },
  emptyHeartsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  emptyHeartsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#B91C1C",
    marginBottom: 2,
  },
  emptyHeartsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#7F1D1D",
  },
  categoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  reviewLessonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  reviewLessonButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  modalCategoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6366F1",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 26,
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingVertical: 16,
    gap: 14,
  },
  memoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  memoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  memoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  memoBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4338CA",
  },
  memoCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  memoCardBody: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
  },
  memoTipBox: {
    marginTop: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  memoTipText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: 18,
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  resumeQuizButton: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  resumeQuizButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
