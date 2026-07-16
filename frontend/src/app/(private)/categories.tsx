import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Flame, Gem, Landmark } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CATEGORIES } from "@/constants/categories";
import { useProgress } from "@/hooks/useProgress";
import { useActiveCategory } from "@/providers/CategoryProvider";

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();
  const { setActiveCategoryId } = useActiveCategory();

  const handleCategorySelect = async (id: string) => {
    await setActiveCategoryId(id);
    router.replace('/(private)/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Landmark color="#8B5CF6" size={20} />
          <Text style={styles.logoText}>CEZAME</Text>
        </View>

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
        {CATEGORIES.map(({ id, label, subtitle, color, borderColor, icon: Icon, mascot }) => (
          <TouchableOpacity
            key={id}
            style={[styles.card, { backgroundColor: color, borderColor: borderColor || color }]}
            onPress={() => handleCategorySelect(id)}>
            <Icon color={borderColor} size={120} style={styles.cardWatermark} strokeWidth={3} />

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
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#7C4DFF",
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
    borderRadius: 16,
    paddingVertical: 16,
    paddingRight: 20,
    paddingLeft: 108,
    position: "relative",
    overflow: "hidden",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 5,
  },
  cardWatermark: {
    position: "absolute",
    right: -15,
    top: "10%",
    opacity: 1,
    transform: [
      { rotate: "-12deg" }
    ]
  },
  cardMascot: {
    position: "absolute",
    left: -5,
    bottom: -20,
    width: 120,
    height: 120,
    zIndex: 10,
  },
  cardText: {
    flex: 1,
    left: 10,
    zIndex: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E2E2E",
  },
  cardSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4A4A4A",
    marginTop: 2,
  },
});
