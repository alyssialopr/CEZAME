import { useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Heart, HeartCrack, Gem, RotateCcw, Home } from "lucide-react-native";

interface GameOverModalProps {
  visible: boolean;
  gems: number;
  onRefillWithGems: () => void;
  onRestartLesson?: () => void;
  onExit: () => void;
}

const REFILL_COST_GEMS = 50;

export function GameOverModal({
  visible,
  gems,
  onRefillWithGems,
  onRestartLesson,
  onExit,
}: GameOverModalProps) {
  const pressAnimRefill = useRef(new Animated.Value(0)).current;
  const pressAnimHome = useRef(new Animated.Value(0)).current;

  if (!visible) return null;

  const canAffordGems = gems >= REFILL_COST_GEMS;

  const animatePress = (anim: Animated.Value, toValue: number, bounce = 0) => {
    Animated.spring(anim, {
      toValue,
      speed: 40,
      bounciness: bounce,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Mascotte Rico Docteur pour soigner les vies */}
          <View style={styles.mascotWrapper}>
            <Image
              source={require("@/images/RicoDocteur.svg")}
              style={styles.mascotImg}
              contentFit="contain"
            />
          </View>

          {/* Badge & Titre */}
          <View style={styles.headerRow}>
            <HeartCrack size={28} color="#EF4444" />
            <Text style={styles.title}>PLUS DE VIES !</Text>
          </View>

          <Text style={styles.subtitle}>
            Tu as épuisé tes 5 cœurs. Tes vies se rechargent automatiquement chaque jour, ou immédiatement avec tes diamants !
          </Text>

          {/* Solde de diamants actuel */}
          <View style={styles.balanceContainer}>
            <View style={styles.gemTag}>
              <Gem size={18} color="#0284C7" />
              <Text style={styles.balanceLabel}>Ton solde :</Text>
              <Text style={styles.balanceValue}>{gems} diamants</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Option 1 : Recharger avec des gemmes */}
            <Animated.View style={{ transform: [{ translateY: pressAnimRefill }], width: "100%" }}>
              <TouchableOpacity
                style={[
                  styles.refillButton,
                  !canAffordGems && styles.refillButtonDisabled,
                ]}
                disabled={!canAffordGems}
                onPressIn={() => animatePress(pressAnimRefill, 4)}
                onPressOut={() => animatePress(pressAnimRefill, 0, 10)}
                onPress={onRefillWithGems}
                activeOpacity={0.9}>
                <View style={styles.buttonContentRow}>
                  <Heart size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.refillButtonText}>
                    RECHARGER 5 VIES ({REFILL_COST_GEMS}
                  </Text>
                  <Gem size={16} color="#FFFFFF" />
                  <Text style={styles.refillButtonText}>)</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Option 2 : Revenir à l'accueil */}
            <Animated.View style={{ transform: [{ translateY: pressAnimHome }], width: "100%" }}>
              <TouchableOpacity
                style={styles.homeButton}
                onPressIn={() => animatePress(pressAnimHome, 3)}
                onPressOut={() => animatePress(pressAnimHome, 0, 8)}
                onPress={onExit}
                activeOpacity={0.85}>
                <View style={styles.buttonContentRow}>
                  <Home size={18} color="#1D8271" />
                  <Text style={styles.homeButtonText}>REVENIR À L'ACCUEIL</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Option 3 : Recommencer la leçon (optionnel) */}
            {onRestartLesson && (
              <TouchableOpacity style={styles.restartButton} onPress={onRestartLesson} activeOpacity={0.7}>
                <RotateCcw size={15} color="#8E8E93" />
                <Text style={styles.restartButtonText}>Recommencer la leçon</Text>
              </TouchableOpacity>
            )}
          </View>
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
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  mascotWrapper: {
    width: 140,
    height: 140,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  mascotImg: {
    width: "100%",
    height: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  balanceContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  gemTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#0369A1",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 14,
    color: "#0284C7",
    fontWeight: "800",
  },
  actions: {
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  refillButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 4,
    borderBottomColor: "#059669",
    width: "100%",
  },
  refillButtonDisabled: {
    backgroundColor: "#94A3B8",
    borderBottomColor: "#64748B",
    opacity: 0.7,
  },
  refillButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  homeButton: {
    backgroundColor: "#E6F4F1",
    borderColor: "#A3D9CF",
    borderWidth: 1.5,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#80C5B7",
    width: "100%",
  },
  homeButtonText: {
    color: "#1D8271",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    marginTop: 2,
  },
  restartButtonText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
  },
});
