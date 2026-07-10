import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LESSON_STEPS } from "@/constants/lesson";

const LESSON_TITLE = "Gérer ton argent au quotidien";

type LessonScreen = {
  title: string;
  body: string;
  tip?: string;
};

const SCREENS: LessonScreen[] = [
  {
    title: "Ton compte au quotidien",
    body: "Ton compte courant sert à recevoir de l'argent et payer tes dépenses. Le RIB est sa « carte d'identité » : tu le donnes pour recevoir un virement (salaire, CAF) ou autoriser un prélèvement (abonnement, loyer). Un prélèvement peut toujours être annulé depuis ta banque.",
  },
  {
    title: "Le découvert et les agios",
    body: "Être à découvert = avoir un solde négatif. Si ta banque l'autorise, ce n'est pas gratuit : elle prélève des agios (des frais). Sans autorisation, les frais explosent et des paiements peuvent être rejetés. Le découvert n'est pas de l'argent en plus, c'est une dette.",
    tip: "Bon réflexe : active les notifications de solde de ton appli bancaire — tu vois le découvert arriver.",
  },
  {
    title: "Épargner, même un peu",
    body: "Le Livret A est l'épargne de base : sans risque, sans frais, et l'argent reste disponible à tout moment. Une méthode simple pour ton budget : la règle 50/30/20 — environ 50 % pour les besoins (loyer, courses), 30 % pour les envies, 20 % pour l'épargne.",
  },
  {
    title: "Les réflexes qui sauvent",
    body: "Carte perdue ou volée : fais opposition immédiatement depuis l'appli ou par téléphone — chaque minute compte. Avant de choisir une banque, compare les frais réels : cotisation de carte, tenue de compte, frais à l'étranger. Ils varient beaucoup d'une banque à l'autre.",
  },
];

export default function LessonContentScreen() {
  const router = useRouter();
  const [screenIndex, setScreenIndex] = useState(0);

  const screen = SCREENS[screenIndex];
  const isLastScreen = screenIndex === SCREENS.length - 1;
  const progress = (screenIndex + 1) / LESSON_STEPS;

  function handleContinue() {
    if (isLastScreen) {
      router.push("/lesson");
      return;
    }
    setScreenIndex((i) => i + 1);
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
          <Text style={styles.heartsText}>5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{LESSON_TITLE}</Text>

        <View style={styles.speechWrapper}>
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />
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

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
