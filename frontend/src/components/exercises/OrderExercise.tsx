import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react-native';

export interface OrderItem {
  id: string;
  text: string;
}

interface OrderExerciseProps {
  items: OrderItem[];
  isRevealed: boolean;
  onOrderChange: (isCorrect: boolean) => void;
  disabled?: boolean;
}

// Mélange un tableau
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Si le mélange donne exactement l'ordre initial et qu'il y a plus d'1 élément, échanger les 2 premiers
  if (arr.length > 1 && arr.every((item, idx) => (item as any).id === (array[idx] as any).id)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export function OrderExercise({
  items: rawItems,
  isRevealed,
  onOrderChange,
  disabled = false,
}: OrderExerciseProps) {
  // Support parsing défensif : chaîne JSON, objet ou tableau
  let parsed: any = rawItems;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = [];
    }
  }
  if (!Array.isArray(parsed) && parsed && typeof parsed === 'object') {
    parsed = parsed.items || parsed.options || parsed.steps || [];
  }

  const items: OrderItem[] = (Array.isArray(parsed) ? parsed : []).map((it: any, idx: number) => ({
    id: String(it?.id || idx + 1),
    text: String(it?.text || it?.label || it?.value || it?.prompt || `Étape ${idx + 1}`),
  }));

  // Filet de sécurité si la liste des étapes est vide
  const effectiveItems = items.length > 0 ? items : [
    { id: '1', text: 'Prendre rendez-vous avec un professionnel' },
    { id: '2', text: 'Préparer ses justificatifs et son dossier' },
    { id: '3', text: 'Se présenter à l\'entretien ou effectuer la démarche' },
    { id: '4', text: 'Conserver la confirmation et les récépissés' },
  ];

  const itemsKey = effectiveItems.map((it) => `${it.id}:${it.text}`).join('|');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>(() => shuffleArray(effectiveItems));

  const onOrderChangeRef = React.useRef(onOrderChange);
  onOrderChangeRef.current = onOrderChange;

  // Réinitialiser / mélanger quand la question change
  useEffect(() => {
    const shuffled = shuffleArray(effectiveItems);
    setCurrentOrder(shuffled);
    const isCorrect = shuffled.every((it, idx) => it.id === effectiveItems[idx]?.id);
    onOrderChangeRef.current(isCorrect);
  }, [itemsKey]);

  // Déplacer un élément vers le haut
  const moveUp = (index: number) => {
    if (index === 0 || disabled || isRevealed) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setCurrentOrder(newOrder);

    const isCorrect = newOrder.every((it, idx) => it.id === effectiveItems[idx]?.id);
    onOrderChange(isCorrect);
  };

  // Déplacer un élément vers le bas
  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1 || disabled || isRevealed) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setCurrentOrder(newOrder);

    const isCorrect = newOrder.every((it, idx) => it.id === effectiveItems[idx]?.id);
    onOrderChange(isCorrect);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {isRevealed
          ? 'Résultat de ton classement :'
          : 'Utilise les flèches pour placer les étapes dans le bon ordre (du début à la fin) :'}
      </Text>

      <View style={styles.list}>
        {currentOrder.map((item, index) => {
          // L'élément est-il à sa place correcte ?
          const isAtCorrectPosition = isRevealed && effectiveItems[index]?.id === item.id;
          const isAtWrongPosition = isRevealed && !isAtCorrectPosition;

          return (
            <View
              key={item.id || index}
              style={[
                styles.itemRow,
                isAtCorrectPosition && styles.itemCorrect,
                isAtWrongPosition && styles.itemWrong,
              ]}>
              {/* Badge numéro */}
              <View
                style={[
                  styles.numberBadge,
                  isAtCorrectPosition && styles.numberBadgeCorrect,
                  isAtWrongPosition && styles.numberBadgeWrong,
                ]}>
                <Text
                  style={[
                    styles.numberText,
                    (isAtCorrectPosition || isAtWrongPosition) && styles.numberTextActive,
                  ]}>
                  {index + 1}
                </Text>
              </View>

              {/* Texte de l'étape */}
              <Text style={styles.itemText}>{item.text}</Text>

              {/* Boutons flèches ou statut de validation */}
              {!isRevealed ? (
                <View style={styles.controls}>
                  <TouchableOpacity
                    onPress={() => moveUp(index)}
                    disabled={index === 0 || disabled}
                    style={[styles.arrowButton, index === 0 && styles.arrowDisabled]}>
                    <ChevronUp size={20} color={index === 0 ? '#CBD5E1' : '#475569'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => moveDown(index)}
                    disabled={index === currentOrder.length - 1 || disabled}
                    style={[
                      styles.arrowButton,
                      index === currentOrder.length - 1 && styles.arrowDisabled,
                    ]}>
                    <ChevronDown
                      size={20}
                      color={index === currentOrder.length - 1 ? '#CBD5E1' : '#475569'}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusIcon}>
                  {isAtCorrectPosition ? (
                    <Check size={20} color="#16A34A" />
                  ) : (
                    <X size={20} color="#DC2626" />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Solution révélée : affiche clairement le bon ordre */}
      {isRevealed && (
        <View style={styles.solutionCard}>
          <Text style={styles.solutionTitle}>
            {effectiveItems.every((it, idx) => it.id === currentOrder[idx]?.id)
              ? '🎯 Bravo ! Tu as trouvé le bon enchaînement :'
              : '💡 Voici l’ordre chronologique correct :'}
          </Text>
          <View style={styles.solutionList}>
            {effectiveItems.map((item, idx) => (
              <View key={item.id || idx} style={styles.solutionRow}>
                <View style={styles.solutionBadge}>
                  <Text style={styles.solutionBadgeText}>{idx + 1}</Text>
                </View>
                <Text style={styles.solutionText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    marginBottom: 12,
    fontWeight: '500',
  },
  list: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemCorrect: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  itemWrong: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeCorrect: {
    backgroundColor: '#22C55E',
  },
  numberBadgeWrong: {
    backgroundColor: '#EF4444',
  },
  numberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  numberTextActive: {
    color: '#FFFFFF',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 19,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
    backgroundColor: 'transparent',
  },
  statusIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solutionCard: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    padding: 12,
  },
  solutionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  solutionList: {
    gap: 6,
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solutionBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solutionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  solutionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
