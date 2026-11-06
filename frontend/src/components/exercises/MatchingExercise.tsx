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
    setSelectedLeft(pairId);
  };

  const handleRightPress = (rightId: string) => {
    if (disabled || isRevealed || matchedPairs.includes(rightId)) return;

    if (!selectedLeft) {
      // Aucun élément gauche sélectionné pour l'instant
      return;
    }

    if (selectedLeft === rightId) {
      // ✅ Bonne association !
      const newMatched = [...matchedPairs, rightId];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setErrorPair(null);
    } else {
      // ❌ Mauvaise association !
      setErrorPair({ leftId: selectedLeft, rightId });
      onMistake();

      // Effacer l'erreur après un court instant
      setTimeout(() => {
        setErrorPair(null);
        setSelectedLeft(null);
      }, 700);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {matchedPairs.length === pairs.length
          ? '🎉 Bravo, toutes les associations sont complètes !'
          : 'Tape d\'abord sur un élément à gauche, puis sur son rôle correspondant à droite :'}
      </Text>

      <View style={styles.columnsWrapper}>
        {/* COLONNE GAUCHE (Éléments / Notions) */}
        <View style={styles.column}>
          {pairs.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isError = errorPair?.leftId === pair.id;

            return (
              <TouchableOpacity
                key={`left-${pair.id}`}
                testID={`matching-left-${pair.id}`}
                onPress={() => handleLeftPress(pair.id)}
                disabled={isMatched || disabled || isRevealed}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isMatched && styles.cardMatched,
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
                {isMatched && <Check size={16} color="#16A34A" style={styles.checkIcon} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* COLONNE DROITE (Rôles / Définitions mélangés) */}
        <View style={styles.column}>
          {shuffledRights.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isError = errorPair?.rightId === item.id;

            return (
              <TouchableOpacity
                key={`right-${item.id}`}
                testID={`matching-right-${item.id}`}
                onPress={() => handleRightPress(item.id)}
                disabled={isMatched || disabled || isRevealed}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  isMatched && styles.cardMatched,
                  isError && styles.cardError,
                ]}>
                <Text
                  style={[
                    styles.cardTextRight,
                    isMatched && styles.cardTextMatched,
                    isError && styles.cardTextError,
                  ]}>
                  {item.text}
                </Text>
                {isMatched && <Check size={16} color="#16A34A" style={styles.checkIcon} />}
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
  },
  columnsWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 64,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
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
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
