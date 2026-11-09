import { submitOnboardingAnswers } from '@/lib/onboarding';
import {
  STEPS,
  computeOnboardingResult,
  createEmptyAnswers,
  recommendedCategoryId,
} from '@/lib/onboardingSteps';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveCategory } from '@/providers/CategoryProvider';
import { useTutorial } from '@/providers/TutorialProvider';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, X as XIcon } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { tracker } from '@/services/trackerService';

export default function OnboardingScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { requestTutorial } = useTutorial();
  const { setActiveCategoryId } = useActiveCategory();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [answers, setAnswers] = useState<any>(createEmptyAnswers);

  const step = STEPS[currentStepIndex];

  const handleToggle = (questionKey: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [step.id]: {
        ...prev[step.id],
        [questionKey]: !prev[step.id][questionKey]
      }
    }));
  };

  const handleSetAnswer = (questionKey: string, value: boolean) => {
    setAnswers((prev: any) => ({
      ...prev,
      [step.id]: {
        ...prev[step.id],
        [questionKey]: value,
      },
    }));
  };

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  useEffect(() => {
    tracker.track('onboarding_started', { eventType: 'onboarding' });
  }, []);

  const finishOnboarding = async () => {
    if (!session?.user?.id) return;
    setIsSubmitting(true);
    try {
      await submitOnboardingAnswers(session.user.id, answers);

      // Synchronously update the cache to prevent race condition during navigation
      queryClient.setQueryData(['userProfile', session.user.id], (old: any) => {
        if (!old) return old;
        return { ...old, is_onboarding_completed: true };
      });

      queryClient.invalidateQueries({ queryKey: ['userProfile', session.user.id] });
      // Demande le tuto dès la fin de l'onboarding (démarrera sur le home).
      requestTutorial();
      tracker.track('onboarding_completed', {
        eventType: 'onboarding',
        properties: { score, weakCategories: weakCategoryIds },
      });
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { score, rank, weakCategoryTitles, weakCategoryIds } = useMemo(
    () => computeOnboardingResult(answers),
    [answers]
  );

  const finishAndGoHome = async () => {
    // Récupère la catégorie correspondant au score le plus faible
    const recommendedCatId = recommendedCategoryId(weakCategoryIds);

    // Définit la catégorie recommandée comme active pour le parcours
    await setActiveCategoryId(recommendedCatId);

    // Demande le tutoriel interactif (démarrera sur le home)
    requestTutorial();

    // Redirige directement vers le parcours d'apprentissage de la catégorie recommandée
    router.replace('/(private)/(tabs)');
  };

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ConfettiCannon count={100} origin={{x: -10, y: 0}} fallSpeed={2500} fadeOut={true} />
        <View style={[styles.container, styles.resultsContainer]}>
          <Animated.View entering={ZoomIn.duration(600)} style={styles.resultsContent}>
            <Text style={styles.resultsHeader}>🎉 Bilan de Départ 🎉</Text>
            
            <View style={styles.scoreCircle}>
              <Text testID="onboarding-score" style={styles.scoreText}>{score}/15</Text>
            </View>
            
            <Text style={styles.rankText}>{rank}</Text>
            
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationTitle}>Recommandations :</Text>
              <Text style={styles.recommendationText}>
                On te conseille de commencer par les ateliers liés à :
              </Text>
              {weakCategoryTitles.map((cat, idx) => (
                <Text key={idx} style={styles.weakCategoryBullet}>• {cat}</Text>
              ))}
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.btnPrimary, { width: '100%' }]} 
              testID="onboarding-start"
              onPress={finishAndGoHome}
            >
              <Text style={styles.btnPrimaryText}>C'est parti !</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.progressBar, i <= currentStepIndex ? styles.progressActive : styles.progressInactive]}
            />
          ))}
        </View>

        <Animated.View
          key={currentStepIndex}
          entering={FadeInRight}
          exiting={FadeOutLeft}
          layout={LinearTransition}
          style={styles.contentContainer}
        >
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.questionsContainer}>
            {step.questions.map((q) => {
              const isChecked = answers[step.id][q.key];
              return (
                <View
                  key={q.key}
                  style={[styles.questionCard, isChecked && styles.questionCardActive]}
                >
                  <TouchableOpacity
                    style={styles.questionTextWrapper}
                    testID={`onboarding-question-${q.key}`}
                    onPress={() => handleToggle(q.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.questionText, isChecked && styles.questionTextActive]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.choiceGroup}>
                    <TouchableOpacity
                      style={[styles.choiceBtn, isChecked && styles.choiceBtnYesActive]}
                      testID={`onboarding-question-${q.key}-yes`}
                      onPress={() => handleSetAnswer(q.key, true)}
                      activeOpacity={0.7}
                    >
                      <Check size={14} color={isChecked ? '#15803D' : '#64748B'} strokeWidth={2.5} />
                      <Text style={[styles.choiceBtnText, isChecked && styles.choiceBtnTextYesActive]}>
                        Oui
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.choiceBtn, !isChecked && styles.choiceBtnNoActive]}
                      testID={`onboarding-question-${q.key}-no`}
                      onPress={() => handleSetAnswer(q.key, false)}
                      activeOpacity={0.7}
                    >
                      <XIcon size={14} color={!isChecked ? '#475569' : '#94A3B8'} strokeWidth={2.5} />
                      <Text style={[styles.choiceBtnText, !isChecked && styles.choiceBtnTextNoActive]}>
                        Non
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnSecondary, currentStepIndex === 0 && { opacity: 0 }]}
            onPress={handleBack}
            disabled={currentStepIndex === 0 || isSubmitting}
          >
            <Text style={styles.btnSecondaryText}>Retour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, isSubmitting && { opacity: 0.7 }]}
            testID="onboarding-next"
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>
                {currentStepIndex === STEPS.length - 1 ? "Terminer" : "Suivant"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFAF8',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  resultsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  resultsHeader: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#A8EA73',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#A8EA73',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  recommendationBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  weakCategoryBullet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    paddingLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#A8EA73',
  },
  progressInactive: {
    backgroundColor: '#EBEBEB',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  questionsContainer: {
    gap: 16,
  },
  questionCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  questionCardActive: {
    borderColor: '#A8EA73',
    backgroundColor: '#F9FFF4',
  },
  questionTextWrapper: {
    width: '100%',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 22,
  },
  questionTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  choiceGroup: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'flex-end',
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  choiceBtnYesActive: {
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
  },
  choiceBtnNoActive: {
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
  },
  choiceBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  choiceBtnTextYesActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  choiceBtnTextNoActive: {
    color: '#334155',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    width: '100%',
  },
  btnSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  btnPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    backgroundColor: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minWidth: 140,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
