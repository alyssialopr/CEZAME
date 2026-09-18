import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, StyleProp, TextStyle, ViewStyle } from "react-native";

interface AnimatedCounterProps {
  value: number;
  icon?: React.ReactNode;
  color?: string;
  fontSize?: number;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  formatNumber?: (n: number) => string;
}

/**
 * Compteur numérique animé (Number Roll-up / Ticker) avec pulsation joyeuse.
 */
export function AnimatedCounter({
  value,
  icon,
  color = "#29B6F6",
  fontSize = 14,
  style,
  containerStyle,
  formatNumber,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;

    if (startValue === endValue) return;

    prevValueRef.current = endValue;

    // Animation de pulsation du conteneur
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.28,
        duration: 180,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Défilement numérique fluide (Roll-up)
    const duration = 500; // ms
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(startValue + (endValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayValue(endValue);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [value, scaleAnim]);

  const formatted = formatNumber ? formatNumber(displayValue) : displayValue.toString();

  return (
    <Animated.View style={[styles.container, containerStyle, { transform: [{ scale: scaleAnim }] }]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.text, { color, fontSize }, style]}>{formatted}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 4,
  },
  text: {
    fontWeight: "800",
  },
});
