import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Option = {
  letter: "A" | "B" | "C";
  text: string;
  correct?: boolean;
};

type Question = {
  category: string;
  prompt: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    category: "Ouvrir un compte bancaire",
    prompt: "Lequel est un justificatif de domicile ?",
    options: [
      { letter: "A", text: "Facture d'électricité", correct: true },
      { letter: "B", text: "Carte de bus" },
      { letter: "C", text: "Selfie" },
    ],
  },
  {
    category: "Ouvrir un compte bancaire",
    prompt: "Quel document prouve votre identité ?",
    options: [
      { letter: "A", text: "Ticket de caisse" },
      { letter: "B", text: "Carte d'identité", correct: true },
      { letter: "C", text: "Photo de vacances" },
    ],
  },
];

export default function LessonScreen() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);

  const question = QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;
  const progress = (questionIndex + (selectedLetter ? 1 : 0)) / QUESTIONS.length;

  function handleSelect(option: Option) {
    if (selectedLetter) return;
    setSelectedLetter(option.letter);
    if (!option.correct) {
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function handleContinue() {
    if (!selectedLetter) return;
    if (isLastQuestion) {
      router.back();
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
    fontSize: 18,
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
  },
  continueButton: {
    marginTop: "auto",
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
