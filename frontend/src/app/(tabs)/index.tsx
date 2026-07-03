import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
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
  Lock,
  PiggyBank,
  Settings,
  Trophy,
  Wallet,
} from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Landmark color="#8B5CF6" size={20} />
          <Text style={styles.logo}>CEZAME</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Flame size={18} color="#FF9800" />
            <Text style={styles.orange}>12</Text>
          </View>

          <View style={styles.stat}>
            <Gem size={18} color="#29B6F6" />
            <Text style={styles.blue}>500</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* UNITÉ 1 */}
        <View style={styles.unitCard}>
          <Text style={styles.unitTitle}>Unité 1</Text>
          <Text style={styles.unitSubtitle}>Maîtriser ses finances</Text>
        </View>

        <View style={styles.timeline}>
          <View style={styles.line} />

          {/* Step completed */}
          <View style={styles.stepContainer}>
            <View style={styles.completedStep}>
              <Text style={styles.check}>✓</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.completedStep}>
              <Text style={styles.check}>✓</Text>
            </View>
          </View>

          {/* START */}
          <View style={styles.startContainer}>
            <View style={styles.startBadge}>
              <Text style={styles.startText}>START</Text>
            </View>

            <TouchableOpacity
              style={styles.mainStep}
              onPress={() => router.push("/lesson")}>
              <PiggyBank color="#4B1D9A" size={42} />
            </TouchableOpacity>
          </View>

          {/* Mascotte */}
          <View style={styles.speechWrapper}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                Gère ton budget{"\n"}comme un pro !
              </Text>
            </View>

            <Image
              source={require("@/images/RicoHappy.svg")}
              style={styles.mascot}
              contentFit="contain"
            />
          </View>

          {/* Locked */}
          <View style={styles.stepContainer}>
            <View style={styles.lockedStep}>
              <Lock size={28} color="#AFAFB8" />
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.lockedStep}>
              <Wallet size={28} color="#AFAFB8" />
            </View>
          </View>
        </View>

        {/* UNITÉ 2 */}
        <View style={styles.unitCard}>
          <Text style={styles.unitTitle}>Unité 2</Text>
          <Text style={styles.unitSubtitle}>Les impôts démystifiés</Text>
        </View>
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

  unitCard: {
    margin: 24,
    backgroundColor: "#A178FF",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
  },

  unitTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },

  unitSubtitle: {
    color: "white",
    marginTop: 5,
    fontSize: 18,
  },

  timeline: {
    alignItems: "center",
    position: "relative",
    paddingBottom: 50,
  },

  line: {
    position: "absolute",
    width: 8,
    backgroundColor: "#DDD",
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },

  stepContainer: {
    marginVertical: 28,
  },

  completedStep: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#A8EA73",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#86D95B",
  },

  check: {
    fontSize: 34,
    color: "#366D19",
    fontWeight: "bold",
  },

  startContainer: {
    alignItems: "center",
    marginVertical: 25,
  },

  startBadge: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 5,
    zIndex: 2,
  },

  startText: {
    color: "#6D4AFF",
    fontWeight: "700",
  },

  mainStep: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#9B6CFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#8B5CF6",
  },

  speechWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 40,
  },

  bubble: {
    backgroundColor: "#8BD0C6",
    padding: 18,
    borderRadius: 18,
    marginRight: 15,
    width: 200,
  },

  bubbleText: {
    fontWeight: "700",
    fontSize: 20,
    color: "#0D2A2A",
  },

  mascot: {
    width: 72,
    height: 72,
  },

  lockedStep: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ECEAF1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#D4D0DB",
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
