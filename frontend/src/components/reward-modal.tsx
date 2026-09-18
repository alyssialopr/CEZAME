import { useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  Gem,
  Zap,
  PiggyBank,
  Coins,
  ShieldCheck,
  Heart,
  FileText,
  Landmark,
  Car,
  Key,
  Award,
  Sparkles,
  Check,
} from "lucide-react-native";
import { UnitReward } from "@/constants/categoryRewards";

interface RewardModalProps {
  visible: boolean;
  unitTitle: string;
  categoryColor: string;
  reward: UnitReward | null;
  onClaim: () => void;
}

function BadgeIcon({ iconName, size = 32, color = "#FFFFFF" }: { iconName: string; size?: number; color?: string }) {
  switch (iconName) {
    case "PiggyBank":
      return <PiggyBank size={size} color={color} />;
    case "Coins":
      return <Coins size={size} color={color} />;
    case "ShieldCheck":
      return <ShieldCheck size={size} color={color} />;
    case "Heart":
      return <Heart size={size} color={color} />;
    case "FileText":
      return <FileText size={size} color={color} />;
    case "Landmark":
      return <Landmark size={size} color={color} />;
    case "Car":
      return <Car size={size} color={color} />;
    case "Key":
      return <Key size={size} color={color} />;
    case "Sparkles":
      return <Sparkles size={size} color={color} />;
    default:
      return <Award size={size} color={color} />;
  }
}

export function RewardModal({
  visible,
  unitTitle,
  categoryColor,
  reward,
  onClaim,
}: RewardModalProps) {
  const { width, height } = Dimensions.get("window");
  const pressAnim = useRef(new Animated.Value(0)).current;

  if (!visible || !reward) return null;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 5,
      speed: 60,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      speed: 25,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  };

  const isGems = reward.type === "gems";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Pluie de confettis festive */}
        <ConfettiCannon
          count={150}
          origin={{ x: width / 2, y: -20 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={2800}
          explosionSpeed={350}
        />

        <View style={styles.dialogCard}>
          {/* Mascotte Rico en fête */}
          <View style={styles.mascotWrapper}>
            <Image
              source={require("@/images/RicoJoy.svg")}
              style={styles.mascotImg}
              contentFit="contain"
            />
          </View>

          {/* En-tête */}
          <Text style={styles.congratsBadge}>🎉 FÉLICITATIONS !</Text>
          <Text style={styles.unitTitle}>{unitTitle}</Text>
          <Text style={styles.unitSubtitle}>Tu as débloqué le coffre de cette unité !</Text>

          {/* CARTE 1 : RÉCOMPENSE ALÉATOIRE (XP OU DIAMANTS) */}
          <View style={[styles.rewardCard, isGems ? styles.gemsCard : styles.xpCard]}>
            <View style={styles.rewardIconWrapper}>
              {isGems ? (
                <View style={styles.gemCircle}>
                  <Gem size={32} color="#0284C7" />
                </View>
              ) : (
                <View style={styles.xpCircle}>
                  <Zap size={32} color="#D97706" />
                </View>
              )}
            </View>

            <View style={styles.rewardTextCol}>
              <Text style={[styles.rewardCategoryTag, { color: isGems ? "#0284C7" : "#D97706" }]}>
                {isGems ? "💎 TRÉSOR DE DIAMANTS" : "⚡ BONUS D'EXPÉRIENCE"}
              </Text>
              <Text style={styles.rewardAmountText}>
                +{reward.amount} {isGems ? "Diamants" : "XP"}
              </Text>
              <Text style={styles.rewardDescription}>
                {isGems ? "Ajoutés directement à ton solde !" : "Pour grimper dans les ligues !"}
              </Text>
            </View>
          </View>

          {/* CARTE 2 : NOUVEAU BADGE GAGNÉ */}
          <View style={styles.badgeCard}>
            <View style={[styles.badgeIconWrapper, { backgroundColor: reward.badge.color }]}>
              <BadgeIcon iconName={reward.badge.iconName} size={30} color="#FFFFFF" />
            </View>

            <View style={styles.badgeTextCol}>
              <View style={styles.badgeTagRow}>
                <Sparkles size={13} color="#F59E0B" />
                <Text style={styles.badgeTagText}>NOUVEAU BADGE DÉBLOQUÉ</Text>
              </View>
              <Text style={styles.badgeNameText}>{reward.badge.label}</Text>
              <Text style={styles.badgeDescriptionText}>{reward.badge.description}</Text>
            </View>
          </View>

          {/* BOUTON D'ACTION 3D */}
          <Animated.View style={{ transform: [{ translateY: pressAnim }], width: "100%", marginTop: 18 }}>
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: categoryColor || "#8B5CF6" }]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onClaim}
              activeOpacity={0.92}>
              <Text style={styles.claimButtonText}>RÉCUPÉRER MON TRÉSOR</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  dialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  mascotWrapper: {
    width: 100,
    height: 100,
    marginTop: -40,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  mascotImg: {
    width: 100,
    height: 100,
  },

  congratsBadge: {
    fontSize: 12,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  unitTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },

  unitSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },

  rewardCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
  },

  gemsCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },

  xpCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },

  rewardIconWrapper: {
    marginRight: 14,
  },

  gemCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },

  xpCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  rewardTextCol: {
    flex: 1,
  },

  rewardCategoryTag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  rewardAmountText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2,
  },

  rewardDescription: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },

  badgeCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF5FF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },

  badgeIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  badgeTextCol: {
    flex: 1,
  },

  badgeTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },

  badgeTagText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#D97706",
    letterSpacing: 0.5,
  },

  badgeNameText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2,
  },

  badgeDescriptionText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 15,
  },

  claimButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
});
