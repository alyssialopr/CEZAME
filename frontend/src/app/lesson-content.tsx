import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowDown, Heart, User, UserCheck, X } from "lucide-react-native";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LESSON_STEPS } from "@/constants/lesson";

export default function LessonContentScreen() {
  const router = useRouter();

  function handleContinue() {
    router.push("/lesson");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color="#AFAFB8" size={26} />
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(1 / LESSON_STEPS) * 100}%` }]} />
        </View>

        <View style={styles.hearts}>
          <Heart color="#FF4B6E" size={20} />
          <Text style={styles.heartsText}>5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Ouvrir un compte en banque</Text>

        <View style={styles.speechWrapper}>
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Mineur vs Majeur : qui ouvre le compte ?</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.cardIconMinor]}>
              <User color="#B8860B" size={20} />
            </View>
            <Text style={styles.cardTitle}>Avant 18 ans</Text>
          </View>
          <Text style={styles.cardText}>
            Tu peux déjà avoir un compte, mais tes parents doivent signer avec toi. C&apos;est un
            compte &quot;avec autorisation parentale&quot; : ils peuvent voir tes opérations et
            fixer des limites (plafond carte, retraits).
          </Text>
        </View>

        <ArrowDown color="#AFAFB8" size={22} style={styles.arrow} />

        <View style={[styles.card, styles.cardHighlighted]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, styles.cardIconMajor]}>
              <UserCheck color="#FFFFFF" size={20} />
            </View>
            <Text style={styles.cardTitle}>Après 18 ans</Text>
          </View>
          <Text style={styles.cardText}>
            Le compte devient 100% le tien. Tu signes seul la convention de compte, tu choisis ta
            carte et tes options, et tes parents n&apos;ont plus aucun regard dessus.
          </Text>
        </View>
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
  cardHighlighted: {
    backgroundColor: "#EAF9E0",
    borderColor: "#86D95B",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconMinor: {
    backgroundColor: "#FBE7A1",
  },
  cardIconMajor: {
    backgroundColor: "#86D95B",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#3C3C43",
  },
  arrow: {
    alignSelf: "center",
    marginVertical: 8,
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
