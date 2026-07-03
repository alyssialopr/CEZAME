import { Image } from "expo-image";
import {
  Flame,
  Footprints,
  Gem,
  Heart,
  Landmark,
  Lock,
  Pencil,
  PiggyBank,
  Shield,
  UserRound,
  Zap,
} from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/providers/AuthProvider";

const BADGES = [
  { key: "premier-pas", label: "Premier Pas", icon: Footprints, color: "#9B6CFF", unlocked: true },
  { key: "as-du-budget", label: "As du Budget", icon: PiggyBank, color: "#5FC97A", unlocked: true },
  { key: "sante-de-fer", label: "Santé de Fer", icon: Heart, color: "#FF6B7A", unlocked: true },
  { key: "pro-impot", label: "Pro de l'Impôt", icon: Lock, color: "#D4D0DB", unlocked: false },
];

const RANK_INFO: Record<'bronze' | 'silver' | 'gold' | 'diamond' | 'rainbow', { label: string; color: string }> = {
  bronze: { label: "Bronze", color: "#CD7F32" },
  silver: { label: "Argent", color: "#9CA3AF" },
  gold: { label: "Or", color: "#E8B923" },
  diamond: { label: "Diamant", color: "#4FC3D9" },
  rainbow: { label: "Arc-en-ciel", color: "#B14EFF" },
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: progress } = useProgress();

  const username = (user?.user_metadata?.username as string | undefined) || "Explorateur";
  const streak = progress?.streak ?? 0;
  const xp = progress?.xp ?? 0;
  const rank = RANK_INFO[progress?.rank ?? "bronze"];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Landmark color="#8B5CF6" size={20} />
          <Text style={styles.logo}>CEZAME</Text>
        </View>

        <View style={styles.stat}>
          <Gem size={18} color="#29B6F6" />
          <Text style={styles.blue}>500</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.editButton}>
            <Pencil size={14} color="#8A8A99" />
          </TouchableOpacity>

          <View style={styles.avatar}>
            <UserRound size={36} color="#8B5CF6" />
          </View>

          <Text style={styles.name}>{username}</Text>
          <Text style={styles.subtitle}>Explorateur Administratif</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FFE9CC" }]}>
              <Flame size={20} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>JOURS DE SUITE</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#D6F3FB" }]}>
              <Zap size={20} color="#29B6F6" />
            </View>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>XP TOTAL</Text>
          </View>
        </View>

        <View style={styles.leagueCard}>
          <Text style={styles.leagueLabel}>LIGUE ACTUELLE</Text>
          <View style={styles.leagueRow}>
            <Shield size={20} color={rank.color} />
            <Text style={[styles.leagueName, { color: rank.color }]}>{rank.label}</Text>
          </View>
          <View style={styles.leagueProgressTrack}>
            <View style={[styles.leagueProgressFill, { backgroundColor: rank.color }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Badges Réussis</Text>
        <View style={styles.badgesRow}>
          {BADGES.map(({ key, label, icon: Icon, color, unlocked }) => (
            <View key={key} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeCircle,
                  { backgroundColor: unlocked ? color : "#ECEAF1" },
                ]}>
                <Icon size={24} color={unlocked ? "#FFFFFF" : "#AFAFB8"} />
              </View>
              <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.speechWrapper}>
          <Image
            source={require("@/images/RicoHappy.svg")}
            style={styles.mascot}
            contentFit="contain"
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Tu es en feu, {username} !{"\n"}Continue comme ça 🔥
            </Text>
          </View>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#F6F5F8",
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
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  blue: {
    color: "#29B6F6",
    fontWeight: "700",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EDE4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  subtitle: {
    fontSize: 14,
    color: "#8A8A99",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A8A99",
    letterSpacing: 0.3,
  },
  leagueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  leagueLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A8A99",
    letterSpacing: 0.3,
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#CD7F32",
  },
  leagueProgressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F3",
    overflow: "hidden",
  },
  leagueProgressFill: {
    width: "40%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#CD7F32",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badgeItem: {
    alignItems: "center",
    gap: 6,
    width: 76,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3C3C43",
    textAlign: "center",
  },
  badgeLabelLocked: {
    color: "#AFAFB8",
  },
  speechWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 8,
  },
  mascot: {
    width: 64,
    height: 64,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#EDE4FF",
    padding: 16,
    borderRadius: 18,
  },
  bubbleText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#3C1D6B",
  },
});
