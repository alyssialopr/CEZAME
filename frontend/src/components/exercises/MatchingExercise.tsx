import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

interface MatchingExerciseProps {
  pairs: MatchingPair[];
  isRevealed: boolean;
  onComplete: (isCorrect: boolean) => void;
  onMistake: () => void;
  disabled?: boolean;
}

// Couleurs discrètes pour distinguer visuellement les paires reliées
const MATCH_COLORS = ['#10B981', '#6366F1', '#EC4899', '#F59E0B', '#06B6D4'];

// Mélange un tableau
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchingExercise({
  pairs,
  isRevealed,
  onComplete,
  onMistake,
  disabled = false,
}: MatchingExerciseProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // Liste des IDs de paires validées
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);
  const [errorPair, setErrorPair] = useState<{ leftId: string; rightId: string } | null>(null);

  // Initialisation : mélanger la colonne de droite
  useEffect(() => {
    if (pairs && pairs.length > 0) {
      const rights = pairs.map((p) => ({ id: p.id, text: p.right }));
      setShuffledRights(shuffle(rights));
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setErrorPair(null);
    }
  }, [pairs]);

  // Vérifier si toutes les paires sont trouvées
  useEffect(() => {
    if (pairs.length > 0 && matchedPairs.length === pairs.length) {
      onComplete(true);
    }
  }, [matchedPairs, pairs]);

  const handleLeftPress = (pairId: string) => {
    if (disabled || isRevealed || matchedPairs.includes(pairId)) return;
    setErrorPair(null);

    // Cas 1 : Un élément de droite était déjà sélectionné (connexion droite -> gauche)
    if (selectedRight) {
      if (selectedRight === pairId) {
        // ✅ Bonne association !
        setMatchedPairs((prev) => [...prev, pairId]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // ❌ Mauvaise association !
        setErrorPair({ leftId: pairId, rightId: selectedRight });
        onMistake();
        setTimeout(() => {
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 700);
      }
      return;
    }

    // Cas 2 : Aucun élément à droite sélectionné -> basculer ou sélectionner à gauche
    if (selectedLeft === pairId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(pairId);
    }
  };

  const handleRightPress = (rightId: string) => {
    if (disabled || isRevealed || matchedPairs.includes(rightId)) return;
    setErrorPair(null);

    // Cas 1 : Un élément de gauche était déjà sélectionné (connexion gauche -> droite)
    if (selectedLeft) {
      if (selectedLeft === rightId) {
        // ✅ Bonne association !
        setMatchedPairs((prev) => [...prev, rightId]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // ❌ Mauvaise association !
        setErrorPair({ leftId: selectedLeft, rightId });
        onMistake();
        setTimeout(() => {
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 700);
      }
      return;
    }

    // Cas 2 : Aucun élément à gauche sélectionné -> basculer ou sélectionner à droite (sens inverse !)
    if (selectedRight === rightId) {
      setSelectedRight(null);
    } else {
      setSelectedRight(rightId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {matchedPairs.length === pairs.length
          ? '🎉 Bravo, toutes les associations sont complètes !'
          : 'Touche un point à gauche ou à droite pour relier chaque élément à sa réponse :'}
      </Text>

      <View style={styles.columnsWrapper}>
        {/* COLONNE GAUCHE (Éléments / Notions) */}
        <View style={styles.column}>
          {pairs.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isError = errorPair?.leftId === pair.id;
            const matchIndex = matchedPairs.indexOf(pair.id);
            const pairColor = matchIndex >= 0 ? MATCH_COLORS[matchIndex % MATCH_COLORS.length] : undefined;

            return (
              <TouchableOpacity
                key={`left-${pair.id}`}
                testID={`matching-left-${pair.id}`}
                onPress={() => handleLeftPress(pair.id)}
                disabled={isMatched || disabled || isRevealed}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  styles.cardLeft,
                  isSelected && styles.cardSelected,
                  isMatched && styles.cardMatched,
                  isMatched && pairColor ? { borderColor: pairColor } : null,
                  isError && styles.cardError,
                ]}>
                <Text
                  style={[
                    styles.cardTextLeft,
                    isSelected && styles.cardTextSelected,
                    isMatched && styles.cardTextMatched,
                    isError && styles.cardTextError,
                  ]}>
                  {pair.left}
                </Text>

                {/* Point de connexion (côté droit de la carte gauche) */}
                <View
                  style={[
                    styles.connectorDot,
                    styles.connectorDotRight,
                    isSelected && styles.connectorDotSelected,
                    isMatched && styles.connectorDotMatched,
                    isMatched && pairColor ? { backgroundColor: pairColor, borderColor: pairColor } : null,
                    isError && styles.connectorDotError,
                  ]}
                />

                {isMatched && <Check size={14} color="#16A34A" style={styles.checkIcon} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* COLONNE DROITE (Rôles / Définitions mélangés) */}
        <View style={styles.column}>
          {shuffledRights.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isError = errorPair?.rightId === item.id;
            const matchIndex = matchedPairs.indexOf(item.id);
            const pairColor = matchIndex >= 0 ? MATCH_COLORS[matchIndex % MATCH_COLORS.length] : undefined;

            return (
              <TouchableOpacity
                key={`right-${item.id}`}
                testID={`matching-right-${item.id}`}
                onPress={() => handleRightPress(item.id)}
                disabled={isMatched || disabled || isRevealed}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  styles.cardRight,
                  isSelected && styles.cardSelected,
                  isMatched && styles.cardMatched,
                  isMatched && pairColor ? { borderColor: pairColor } : null,
                  isError && styles.cardError,
                ]}>
                {/* Point de connexion (côté gauche de la carte droite) */}
                <View
                  style={[
                    styles.connectorDot,
                    styles.connectorDotLeft,
                    isSelected && styles.connectorDotSelected,
                    isMatched && styles.connectorDotMatched,
                    isMatched && pairColor ? { backgroundColor: pairColor, borderColor: pairColor } : null,
                    isError && styles.connectorDotError,
                  ]}
                />

                <Text
                  style={[
                    styles.cardTextRight,
                    isSelected && styles.cardTextSelected,
                    isMatched && styles.cardTextMatched,
                    isError && styles.cardTextError,
                  ]}>
                  {item.text}
                </Text>

                {isMatched && <Check size={14} color="#16A34A" style={styles.checkIcon} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  instruction: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  columnsWrapper: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 68,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  cardLeft: {
    paddingRight: 16,
  },
  cardRight: {
    paddingLeft: 16,
  },
  cardSelected: {
    borderColor: '#7C4DFF',
    backgroundColor: '#F5F0FF',
  },
  cardMatched: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  cardError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cardTextLeft: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardTextRight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 16,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#6D28D9',
  },
  cardTextMatched: {
    color: '#15803D',
    fontWeight: '700',
  },
  cardTextError: {
    color: '#B91C1C',
  },
  connectorDot: {
    position: 'absolute',
    top: '50%',
    marginTop: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    zIndex: 10,
  },
  connectorDotRight: {
    right: -8,
  },
  connectorDotLeft: {
    left: -8,
  },
  connectorDotSelected: {
    borderColor: '#7C4DFF',
    backgroundColor: '#7C4DFF',
    transform: [{ scale: 1.2 }],
  },
  connectorDotMatched: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  connectorDotError: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
