import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, ChevronUp, Check, X, GripVertical, ArrowDown } from 'lucide-react-native';

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
  const effectiveItems =
    items.length > 0
      ? items
      : [
          { id: '1', text: 'Prendre rendez-vous avec un professionnel' },
          { id: '2', text: 'Préparer ses justificatifs et son dossier' },
          { id: '3', text: "Se présenter à l'entretien ou effectuer la démarche" },
          { id: '4', text: 'Conserver la confirmation et les récépissés' },
        ];

  const itemsKey = effectiveItems.map((it) => `${it.id}:${it.text}`).join('|');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>(() =>
    shuffleArray(effectiveItems)
  );
  const [selectedToSwapIndex, setSelectedToSwapIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onOrderChangeRef = useRef(onOrderChange);
  onOrderChangeRef.current = onOrderChange;

  // Réinitialiser / mélanger quand la question change
  useEffect(() => {
    const shuffled = shuffleArray(effectiveItems);
    setCurrentOrder(shuffled);
    setSelectedToSwapIndex(null);
    setDraggedIndex(null);
    const isCorrect = shuffled.every((it, idx) => it.id === effectiveItems[idx]?.id);
    onOrderChangeRef.current(isCorrect);
  }, [itemsKey]);

  const updateOrder = (newOrder: OrderItem[]) => {
    setCurrentOrder(newOrder);
    const isCorrect = newOrder.every((it, idx) => it.id === effectiveItems[idx]?.id);
    onOrderChange(isCorrect);
  };

  // Déplacer un élément vers le haut
  const moveUp = (index: number) => {
    if (index === 0 || disabled || isRevealed) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    updateOrder(newOrder);
    setSelectedToSwapIndex(null);
  };

  // Déplacer un élément vers le bas
  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1 || disabled || isRevealed) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    updateOrder(newOrder);
    setSelectedToSwapIndex(null);
  };

  // Échange rapide au clic (Tap-to-Swap)
  const handleItemPress = (index: number) => {
    if (disabled || isRevealed) return;

    if (selectedToSwapIndex === null) {
      setSelectedToSwapIndex(index);
    } else if (selectedToSwapIndex === index) {
      setSelectedToSwapIndex(null);
    } else {
      const newOrder = [...currentOrder];
      const temp = newOrder[selectedToSwapIndex];
      newOrder[selectedToSwapIndex] = newOrder[index];
      newOrder[index] = temp;
      updateOrder(newOrder);
      setSelectedToSwapIndex(null);
    }
  };

  // Support Web Drag & Drop
  const handleWebDragStart = (e: any, index: number) => {
    if (Platform.OS === 'web' && e?.dataTransfer) {
      e.dataTransfer.setData('text/plain', String(index));
      setDraggedIndex(index);
    }
  };

  const handleWebDrop = (e: any, targetIndex: number) => {
    if (Platform.OS === 'web' && e?.dataTransfer) {
      e.preventDefault();
      const sourceIndexStr = e.dataTransfer.getData('text/plain');
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        const newOrder = [...currentOrder];
        const [moved] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, moved);
        updateOrder(newOrder);
      }
      setDraggedIndex(null);
    }
  };

  const handleWebDragOver = (e: any) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
    }
  };

  return (
    <View style={styles.container}>
      {/* Guide chronologique du haut */}
      <View style={styles.chronologicalGuide}>
        <View style={styles.guideBadge}>
          <Text style={styles.guideBadgeText}>1. Première étape</Text>
        </View>
        <ArrowDown size={14} color="#6366F1" />
        <View style={[styles.guideBadge, styles.guideBadgeEnd]}>
          <Text style={styles.guideBadgeText}>
            {effectiveItems.length}. Dernière étape
          </Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        {isRevealed
          ? 'Résultat de ton classement :'
          : 'Glisse-dépose ou utilise les flèches pour placer les étapes dans l’ordre :'}
      </Text>

      <View style={styles.timelineWrapper}>
        {/* Ligne verticale chronologique reliant les numéros */}
        <View style={styles.timelineVerticalLine} />

        <View style={styles.list}>
          {currentOrder.map((item, index) => {
            const isAtCorrectPosition =
              isRevealed && effectiveItems[index]?.id === item.id;
            const isAtWrongPosition = isRevealed && !isAtCorrectPosition;
            const isSelectedToSwap = selectedToSwapIndex === index;
            const isBeingDragged = draggedIndex === index;

            return (
              <View
                key={item.id || index}
                {...(Platform.OS === 'web'
                  ? ({
                      draggable: !disabled && !isRevealed,
                      onDragStart: (e: any) => handleWebDragStart(e, index),
                      onDragOver: handleWebDragOver,
                      onDrop: (e: any) => handleWebDrop(e, index),
                      onDragEnd: () => setDraggedIndex(null),
                    } as any)
                  : {})}
                style={[
                  styles.itemRow,
                  isSelectedToSwap && styles.itemSelectedToSwap,
                  isBeingDragged && styles.itemDragged,
                  isAtCorrectPosition && styles.itemCorrect,
                  isAtWrongPosition && styles.itemWrong,
                ]}>
                {/* Numéro chronologique fixe de la position */}
                <View
                  style={[
                    styles.numberBadge,
                    index === 0 && styles.numberBadgeStart,
                    index === currentOrder.length - 1 && styles.numberBadgeEnd,
                    isAtCorrectPosition && styles.numberBadgeCorrect,
                    isAtWrongPosition && styles.numberBadgeWrong,
                  ]}>
                  <Text
                    style={[
                      styles.numberText,
                      (isAtCorrectPosition || isAtWrongPosition) &&
                        styles.numberTextActive,
                    ]}>
                    {index + 1}
                  </Text>
                </View>

                {/* Poignée Drag & Drop */}
                {!isRevealed && (
                  <View style={styles.dragHandle}>
                    <GripVertical size={18} color="#94A3B8" />
                  </View>
                )}

                {/* Texte de l'étape cliquable pour Tap-to-Swap */}
                <TouchableOpacity
                  style={styles.textWrapper}
                  disabled={disabled || isRevealed}
                  onPress={() => handleItemPress(index)}
                  activeOpacity={0.7}>
                  <Text style={styles.itemText}>{item.text}</Text>
                  {isSelectedToSwap && (
                    <Text style={styles.swapHintText}>
                      Tape sur une autre étape pour échanger
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Boutons flèches ou statut de validation */}
                {!isRevealed ? (
                  <View style={styles.controls}>
                    <TouchableOpacity
                      testID={`order-up-${index}`}
                      onPress={() => moveUp(index)}
                      disabled={index === 0 || disabled}
                      style={[
                        styles.arrowButton,
                        index === 0 && styles.arrowDisabled,
                      ]}>
                      <ChevronUp
                        size={20}
                        color={index === 0 ? '#CBD5E1' : '#475569'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      testID={`order-down-${index}`}
                      onPress={() => moveDown(index)}
                      disabled={index === currentOrder.length - 1 || disabled}
                      style={[
                        styles.arrowButton,
                        index === currentOrder.length - 1 && styles.arrowDisabled,
                      ]}>
                      <ChevronDown
                        size={20}
                        color={
                          index === currentOrder.length - 1
                            ? '#CBD5E1'
                            : '#475569'
                        }
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
  chronologicalGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  guideBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  guideBadgeEnd: {
    borderColor: '#CBD5E1',
  },
  guideBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  instruction: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  timelineWrapper: {
    position: 'relative',
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 25,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: '#CBD5E1',
    zIndex: 0,
  },
  list: {
    gap: 12,
    zIndex: 1,
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
  itemSelectedToSwap: {
    borderColor: '#7C4DFF',
    backgroundColor: '#F5F0FF',
    shadowOpacity: 0.1,
  },
  itemDragged: {
    opacity: 0.6,
    borderColor: '#6366F1',
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    zIndex: 2,
  },
  numberBadgeStart: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  numberBadgeEnd: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  numberBadgeCorrect: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  numberBadgeWrong: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  numberTextActive: {
    color: '#FFFFFF',
  },
  dragHandle: {
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 19,
  },
  swapHintText: {
    fontSize: 11,
    color: '#7C4DFF',
    fontWeight: '500',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'column',
    gap: 4,
  },
  arrowButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  arrowDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#F1F5F9',
    opacity: 0.5,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solutionCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  solutionList: {
    gap: 8,
  },
  solutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  solutionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solutionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  solutionText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 17,
  },
});
