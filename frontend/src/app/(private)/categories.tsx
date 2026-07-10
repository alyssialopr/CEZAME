import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Flame, Gem } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { useProgress } from "@/hooks/useProgress";

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#3C3C43" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Catégories</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Flame size={18} color={progress?.streak && progress.streak > 0 ? "#FF9800" : "#E5E5E5"} />
            <Text style={styles.orange}>{progress?.streak || 0}</Text>
          </View>

          <View style={styles.stat}>
            <Gem size={18} color="#29B6F6" />
            <Text style={styles.blue}>500</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {CATEGORIES.map(({ id, label, subtitle, color, icon: Icon, mascot }) => (
          <TouchableOpacity
            key={id}
            style={[styles.card, { backgroundColor: color }]}
            onPress={() => router.push({ pathname: "/category/[id]", params: { id } })}>
            <Icon color="#FFFFFF" size={72} style={styles.cardWatermark} />

            <Image source={mascot} style={styles.cardMascot} contentFit="contain" />

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{label}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F5F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  stats: {
    flexDirection: "row",
    gap: 20,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  orange: {
    color: "#FF9800",
    fontWeight: "700",
  },
  blue: {
    color: "#29B6F6",
    fontWeight: "700",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 110,
    borderRadius: 18,
    paddingVertical: 16,
    paddingRight: 20,
    paddingLeft: 108,
    position: "relative",
    overflow: "hidden",
  },
  cardWatermark: {
    position: "absolute",
    right: -10,
    top: -10,
    opacity: 0.25,
  },
  cardMascot: {
    position: "absolute",
    left: -5,
    bottom: -14,
    width: 120,
    height: 120,
  },
  cardText: {
    flex: 1,
    left: 15
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#3C3C43",
    marginTop: 2,
  },
});
