import { submitOnboardingAnswers } from '@/lib/onboarding';
import { useAuth } from '@/providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
  {
    id: 'social_security',
    title: '🏥 Santé',
    description: 'Commençons par ta couverture santé.',
    questions: [
      { key: 'ameli_account_created', label: 'As-tu créé ton compte Ameli ?' },
      { key: 'vitale_card_requested', label: 'As-tu demandé ta carte Vitale ?' },
      { key: 'has_mutuelle', label: 'As-tu une mutuelle complémentaire ?' },
    ]
  },
  {
    id: 'bank_account',
    title: '💰 Finance',
    description: 'Gérer ton argent au quotidien.',
    questions: [
      { key: 'has_identity_doc', label: 'As-tu une pièce d\'identité valide en ta possession ?' },
      { key: 'has_proof_of_address', label: 'As-tu un justificatif de domicile à ton nom ?' },
      { key: 'has_proof_of_income', label: 'As-tu conservé tes justificatifs de revenus (fiches de paie) ?' },
    ]
  },
  {
    id: 'driver_licence',
    title: '🚗 Voiture',
    description: 'Ton permis et ta mobilité.',
    questions: [
      { key: 'ants_account_created', label: 'As-tu un compte ANTS pour tes démarches ?' },
      { key: 'code_passed', label: 'As-tu réussi le code de la route ?' },
      { key: 'practical_exam_passed', label: 'As-tu réussi l\'examen pratique du permis ?' },
    ]
  },
  {
    id: 'tax_return',
    title: '📄 Administration',
    description: 'Les papiers officiels et impôts.',
    questions: [
      { key: 'must_declare', label: 'Sais-tu si tu dois déclarer tes impôts seul(e) ?' },
      { key: 'impots_account_created', label: 'As-tu un compte impots.gouv.fr actif ?' },
      { key: 'income_collected', label: 'As-tu récupéré l\'ensemble de tes fiches de paie pour l\'année ?' },
    ]
  },
  {
    id: 'housing',
    title: '🏠 Logement',
    description: 'Ton chez-toi et tes garanties.',
    questions: [
      { key: 'has_tenant_file', label: 'As-tu un dossier locataire complet prêt à être envoyé ?' },
      { key: 'has_guarantor', label: 'As-tu un garant physique ou moral ?' },
      { key: 'uses_visale', label: 'Sais-tu ce qu\'est la garantie Visale ou l\'utilises-tu ?' },
    ]
  }
];

export default function OnboardingScreen() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState<any>({
    social_security: { ameli_account_created: false, vitale_card_requested: false, has_mutuelle: false },
    bank_account: { has_identity_doc: false, has_proof_of_address: false, has_proof_of_income: false },
    driver_licence: { ants_account_created: false, code_passed: false, practical_exam_passed: false },
    tax_return: { must_declare: false, impots_account_created: false, income_collected: false },
    housing: { has_tenant_file: false, has_guarantor: false, uses_visale: false },
  });

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
      router.replace('/(private)/(tabs)');
    } catch (err) {
      console.error(err);
      // In a real app we'd show a toast here
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <TouchableOpacity
                  key={q.key}
                  style={[styles.questionCard, isChecked && styles.questionCardActive]}
                  onPress={() => handleToggle(q.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.questionText, isChecked && styles.questionTextActive]}>
                    {q.label}
                  </Text>
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <View style={styles.checkmark} />}
                  </View>
                </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  questionCardActive: {
    borderColor: '#A8EA73',
    backgroundColor: '#F9FFF4',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 22,
    paddingRight: 16,
  },
  questionTextActive: {
    color: '#1A1A1A',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#A8EA73',
    backgroundColor: '#A8EA73',
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
