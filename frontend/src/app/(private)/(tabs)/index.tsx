import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Flame,
  Gem,
  Home,
  Landmark,
  Settings,
  Trophy,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LessonPath } from "@/components/lesson-path";
import { useProgress } from "@/hooks/useProgress";

export default function HomeScreen() {
  const router = useRouter();
  const { data: progress } = useProgress();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push("/categories")}>
          <Landmark color="#8B5CF6" size={20} />
          <Text style={styles.logo}>CEZAME</Text>
        </TouchableOpacity>

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

      <ScrollView>
        <LessonPath />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem}>
          <Home color="#7C4DFF" size={24} />
          <Text style={styles.activeNav}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Trophy color="#8A8A99" size={24} />
          <Text style={styles.nav}>PROFILE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Settings color="#8A8A99" size={24} />
          <Text style={styles.nav}>SETTINGS</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    fontSize: 24,
    fontWeight: "700",
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

  bottomBar: {
    height: 80,
    borderTopWidth: 1,
    borderColor: "#E2E2E2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
  },

  navItem: {
    alignItems: "center",
  },

  activeNav: {
    color: "#7C4DFF",
    fontWeight: "700",
    marginTop: 4,
  },

  nav: {
    color: "#8A8A99",
    marginTop: 4,
  },
});
