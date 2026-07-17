import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonPath } from "@/components/lesson-path";
import { CATEGORIES } from "@/constants/categories";
import { LESSONS } from "@/constants/lessons";

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = CATEGORIES.find((item) => item.id === id);

  if (!category) {
    return <Redirect href="/categories" />;
  }

  const Icon = category.icon;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#3C3C43" size={24} />
        </TouchableOpacity>

        <View style={[styles.headerIcon, { backgroundColor: category.color }]}>
          <Icon color="#3C3C43" size={18} />
        </View>

        <Text style={styles.title}>{category.label}</Text>
      </View>

      <ScrollView>
        {LESSONS[category.id] ? (
          <LessonPath category={category} />
        ) : (
          <View style={styles.comingSoon}>
            <Image source={category.mascot} style={styles.mascot} contentFit="contain" />
            <View style={styles.lockedBadge}>
              <Lock size={28} color="#AFAFB8" />
            </View>
            <Text style={styles.comingSoonText}>Cette catégorie arrive bientôt !</Text>
          </View>
        )}
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
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  comingSoon: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  mascot: {
    width: 96,
    height: 96,
  },
  lockedBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ECEAF1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#D4D0DB",
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#60646C",
    textAlign: "center",
  },
});
