import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gift, Lock, Check, Sparkles } from "lucide-react-native";

interface UnitRewardChestProps {
  unitId: string;
  unitTitle: string;
  categoryColor: string;
  accentColor: string;
  isCompleted: boolean;
  isClaimed: boolean;
  remainingCount: number;
  onOpenChest: () => void;
}

export function UnitRewardChest({
  unitId,
  unitTitle,
  categoryColor,
  accentColor,
  isCompleted,
  isClaimed,
  remainingCount,
  onOpenChest,
}: UnitRewardChestProps) {
  // Animation d'enfoncement 3D tactile
  const pressAnim = useRef(new Animated.Value(0)).current;

  // Animation de vibration/wobble quand le coffre est prêt à ouvrir
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  // Animation de flottement du badge OUVRIR
  const badgeBounce = useRef(new Animated.Value(0)).current;

  // Animation de secousse pour le coffre verrouillé
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Boucle d'excitation quand le coffre est prêt à être ouvert
  useEffect(() => {
    if (isCompleted && !isClaimed) {
      const wobbleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: 1.06,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0.98,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      wobbleLoop.start();
      return () => wobbleLoop.stop();
    }
  }, [isCompleted, isClaimed, wobbleAnim]);

  // Boucle de flottement du badge
  useEffect(() => {
    if (isCompleted && !isClaimed) {
      const badgeLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeBounce, {
            toValue: -5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(badgeBounce, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      badgeLoop.start();
      return () => badgeLoop.stop();
    }
  }, [isCompleted, isClaimed, badgeBounce]);

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

  const handleLockedPress = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  // CAS 1 : COFFRE DÉJÀ RÉCLAMÉ
  if (isClaimed) {
    return (
      <View style={styles.chestContainer}>
        <View style={styles.claimedBadge}>
          <Text style={styles.claimedBadgeText}>✓ COFFRE RÉCLAMÉ</Text>
        </View>

        <Animated.View style={{ transform: [{ translateY: pressAnim }] }}>
          <TouchableOpacity
            style={styles.claimedChest}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onOpenChest}
            activeOpacity={0.88}>
            <Check size={36} color="#15803D" strokeWidth={3} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.chestSubtext}>Unité accomplie</Text>
      </View>
    );
  }

  // CAS 2 : COFFRE PRÊT À OUVRIR (Toutes les leçons complétées)
  if (isCompleted) {
    return (
      <View style={styles.chestContainer}>
        {/* Badge animé avec pointeur */}
        <Animated.View
          style={[
            styles.openBadgeWrapper,
            { transform: [{ translateY: badgeBounce }] },
          ]}>
          <View style={styles.openBadge}>
            <Sparkles size={14} color="#D97706" />
            <Text style={styles.openBadgeText}>OUVRIR LE TRÉSOR !</Text>
          </View>
          <View style={styles.openBadgeTriangle} />
        </Animated.View>

        {/* Coffre doré vibrant */}
        <Animated.View
          style={{
            transform: [
              { translateY: pressAnim },
              { scale: wobbleAnim },
            ],
          }}>
          <TouchableOpacity
            style={styles.readyChest}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onOpenChest}
            activeOpacity={0.9}>
            <Gift size={42} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.readyChestSubtext}>Touchez pour ouvrir !</Text>
      </View>
    );
  }

  // CAS 3 : COFFRE VERROUILLÉ (Leçons restantes)
  return (
    <View style={styles.chestContainer}>
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <TouchableOpacity
          style={styles.lockedChest}
          onPress={handleLockedPress}
          activeOpacity={0.85}>
          <Lock size={28} color="#94A3B8" />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.lockedChestSubtext}>
        {remainingCount > 1
          ? `Encore ${remainingCount} leçons pour ouvrir`
          : "Encore 1 leçon pour ouvrir"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chestContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 26,
  },

  openBadgeWrapper: {
    alignItems: "center",
    marginBottom: 8,
  },

  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  openBadgeText: {
    color: "#B45309",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.6,
  },

  openBadgeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F59E0B",
    marginTop: -1,
  },

  readyChest: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FDE68A",
    borderBottomWidth: 8,
    borderBottomColor: "#B45309",
    elevation: 8,
    shadowColor: "#B45309",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  readyChestSubtext: {
    fontSize: 12,
    fontWeight: "800",
    color: "#D97706",
    marginTop: 8,
    letterSpacing: 0.3,
  },

  claimedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    marginBottom: 8,
  },

  claimedBadgeText: {
    color: "#166534",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  claimedChest: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#86EFAC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BBF7D0",
    borderBottomWidth: 6,
    borderBottomColor: "#22C55E",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  chestSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803D",
    marginTop: 6,
  },

  lockedChest: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderBottomWidth: 6,
    borderBottomColor: "#CBD5E1",
  },

  lockedChestSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 8,
  },
});
