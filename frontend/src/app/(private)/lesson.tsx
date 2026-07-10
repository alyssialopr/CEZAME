import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LESSON_CONTENT_SCREENS, LESSON_STEPS } from "@/constants/lesson";
import { useProgress, useUpdateStreak } from "@/hooks/useProgress";

type Option = {
  letter: "A" | "B" | "C";
  text: string;
  correct?: boolean;
};

type Question = {
  category: string;
  prompt: string;
  options: Option[];
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    category: "Le découvert et les agios",
    prompt: "Le découvert autorisé, c'est :",
    options: [
      { letter: "A", text: "Un solde négatif toléré, mais avec des frais", correct: true },
      { letter: "B", text: "De l'argent gratuit prêté par la banque" },
      { letter: "C", text: "Interdit avant 25 ans" },
    ],
    explanation: "La banque tolère le négatif mais facture des agios. C'est une dette, pas un bonus.",
  },
  {
    category: "Ton compte au quotidien",
    prompt: "On te demande ton RIB. C'est pour :",
    options: [
      { letter: "A", text: "Recevoir un virement ou mettre en place un prélèvement", correct: true },
      { letter: "B", text: "Payer en magasin" },
      { letter: "C", text: "Prouver ton identité" },
    ],
    explanation: "Le RIB identifie ton compte — indispensable pour le salaire, la CAF ou un abonnement.",
  },
  {
    category: "Le découvert et les agios",
    prompt: "Les agios, c'est :",
    options: [
      { letter: "A", text: "Des frais quand ton compte est à découvert", correct: true },
      { letter: "B", text: "Des intérêts que la banque te verse" },
      { letter: "C", text: "Une prime de bienvenue" },
    ],
    explanation: "Plus tu restes à découvert longtemps, plus les agios s'accumulent.",
  },
  {
    category: "Les réflexes qui sauvent",
    prompt: "Tu perds ta carte bancaire. Tu fais quoi en premier ?",
    options: [
      { letter: "A", text: "Opposition immédiate (appli ou téléphone)", correct: true },
      { letter: "B", text: "Tu attends de voir si quelqu'un l'utilise" },
      { letter: "C", text: "Tu changes de banque" },
    ],
    explanation:
      "L'opposition bloque la carte instantanément. Attendre, c'est risquer de payer les achats d'un voleur.",
  },
  {
    category: "Épargner, même un peu",
    prompt: "Le Livret A, c'est :",
    options: [
      { letter: "A", text: "Une épargne disponible à tout moment, sans risque", correct: true },
      { letter: "B", text: "Un compte bloqué pendant 5 ans" },
      { letter: "C", text: "Un placement réservé aux mineurs" },
    ],
    explanation: "Tu peux retirer quand tu veux, sans frais. C'est la première brique d'épargne idéale.",
  },
  {
    category: "Ton compte au quotidien",
    prompt: "Un prélèvement automatique, c'est :",
    options: [
      { letter: "A", text: "Une autorisation donnée à un organisme de prélever ton compte", correct: true },
      { letter: "B", text: "Impossible à annuler une fois activé" },
      { letter: "C", text: "Réservé au paiement des impôts" },
    ],
    explanation:
      "Tu peux le révoquer à tout moment depuis ta banque, par exemple pour stopper un abonnement.",
  },
  {
    category: "Les réflexes qui sauvent",
    prompt: "Les frais bancaires (carte, tenue de compte) :",
    options: [
      { letter: "A", text: "Varient selon les banques, il faut comparer", correct: true },
      { letter: "B", text: "Sont fixés par l'État, identiques partout" },
      { letter: "C", text: "Sont interdits par la loi" },
    ],
    explanation: "D'une banque à l'autre, la même carte peut coûter 0 € ou plus de 100 € par an.",
  },
  {
    category: "Épargner, même un peu",
    prompt: "La règle 50/30/20 pour gérer son budget, c'est :",
    options: [
      { letter: "A", text: "Besoins / envies / épargne", correct: true },
      { letter: "B", text: "Loyer / courses / sorties" },
      { letter: "C", text: "Un taux d'intérêt bancaire" },
    ],
    explanation: "50 % besoins, 30 % envies, 20 % épargne — un repère simple, à adapter à ta situation.",
  },
];

export default function LessonScreen() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);

  const { data: progressData } = useProgress();
  const updateStreak = useUpdateStreak();

  const question = QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const progress =
    (LESSON_CONTENT_SCREENS + questionIndex + (selectedLetter ? 1 : 0)) / LESSON_STEPS;

  function handleSelect(option: Option) {
    if (selectedLetter) return;
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
          total: String(QUESTIONS.length),
          hearts: String(hearts),
        },
      });
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelectedLetter(null);
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{question.prompt}</Text>
          </View>
        </View>

        <View style={styles.options}>
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
        style={[styles.continueButton, !selectedLetter && styles.continueButtonDisabled]}
        disabled={!selectedLetter}
        onPress={handleContinue}>
        <Text style={styles.continueText}>CONTINUER</Text>
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
