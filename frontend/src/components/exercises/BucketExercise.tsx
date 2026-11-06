import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, X, Layers } from 'lucide-react-native';
import { BucketData, BucketDefinition, BucketItem } from '@/types/lesson';

interface BucketExerciseProps {
  data: BucketData;
  userAssignments: Record<string, string>; // itemId -> bucketId
  isRevealed: boolean;
  onAssign: (itemId: string, bucketId: string) => void;
  disabled?: boolean;
}

export function BucketExercise({
  data,
  userAssignments,
  isRevealed,
  onAssign,
  disabled = false,
}: BucketExerciseProps) {
  let parsed: any = data;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = {};
    }
  }

  const defaultColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

  let buckets: BucketDefinition[] = [];
  let items: BucketItem[] = [];

  if (Array.isArray(parsed)) {
    if (parsed[0]?.buckets || parsed[0]?.items) {
      buckets = Array.isArray(parsed[0].buckets) ? parsed[0].buckets : [];
      items = Array.isArray(parsed[0].items) ? parsed[0].items : [];
    } else if (parsed.some((it: any) => it?.bucketId !== undefined)) {
      items = parsed;
      const uniqueIds = Array.from(new Set(parsed.map((it: any) => it.bucketId)));
      buckets = uniqueIds.map((bId, idx) => ({
        id: String(bId),
        label: `Bac ${idx + 1}`,
        color: defaultColors[idx % defaultColors.length],
      }));
    }
  } else if (parsed && typeof parsed === 'object') {
    buckets = Array.isArray(parsed.buckets) ? parsed.buckets : (Array.isArray(parsed.categories) ? parsed.categories : []);
    items = Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed.elements) ? parsed.elements : []);
  }

  // Filet de sécurité si aucune donnée valide n'a été transmise
  if (items.length === 0) {
    buckets = [
      { id: 'b1', label: 'Besoins (50%)', color: '#3B82F6' },
      { id: 'b2', label: 'Envies (30%)', color: '#8B5CF6' },
      { id: 'b3', label: 'Épargne (20%)', color: '#10B981' },
    ];
    items = [
      { id: '1', text: 'Loyer et électricité', bucketId: 'b1' },
      { id: '2', text: 'Sorties resto & cinéma', bucketId: 'b2' },
      { id: '3', text: 'Virement sur Livret A', bucketId: 'b3' },
      { id: '4', text: 'Courses alimentaires', bucketId: 'b1' },
    ];
  }

  return (
    <View style={styles.container}>
      {/* Légende des Bacs */}
      <View style={styles.bucketsHeader}>
        <View style={styles.bucketIconRow}>
          <Layers size={18} color="#4F46E5" />
          <Text style={styles.headerTitle}>Bacs de classement :</Text>
        </View>
        <View style={styles.legendRow}>
          {buckets.map((b, idx) => {
            const color = b.color || defaultColors[idx % defaultColors.length];
            return (
              <View key={b.id} style={[styles.legendPill, { borderColor: color, backgroundColor: `${color}15` }]}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={[styles.legendLabel, { color }]}>{b.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.instruction}>
        {isRevealed
          ? 'Résultat de ton classement :'
          : 'Attribue chaque élément au bon bac en touchant sa catégorie :'}
      </Text>

      {/* Liste des éléments à classer */}
      <View style={styles.itemsList}>
        {items.map((item, index) => {
          const selectedBucketId = userAssignments[item.id];
          const isCorrect = isRevealed && selectedBucketId === item.bucketId;
          const isWrong = isRevealed && selectedBucketId !== item.bucketId;
          const correctBucket = buckets.find((b) => b.id === item.bucketId);

          return (
            <View
              key={item.id || `item-${index}`}
              style={[
                styles.itemCard,
                isCorrect && styles.itemCardCorrect,
                isWrong && styles.itemCardWrong,
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemText}>{item.text}</Text>
                {isRevealed && (
                  <View
                    style={[
                      styles.statusBadge,
                      isCorrect ? styles.statusCorrect : styles.statusWrong,
                    ]}
                  >
                    {isCorrect ? (
                      <Check size={14} color="#FFFFFF" />
                    ) : (
                      <X size={14} color="#FFFFFF" />
                    )}
                  </View>
                )}
              </View>

              {/* Boutons Bacs */}
              <View style={styles.bucketButtonsRow}>
                {buckets.map((bucket, bIdx) => {
                  const isSelected = selectedBucketId === bucket.id;
                  const color = bucket.color || defaultColors[bIdx % defaultColors.length];

                  return (
                    <TouchableOpacity
                      key={bucket.id}
                      activeOpacity={0.7}
                      disabled={isRevealed || disabled}
                      onPress={() => onAssign(item.id, bucket.id)}
                      style={[
                        styles.bucketBtn,
                        isSelected && {
                          backgroundColor: color,
                          borderColor: color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bucketBtnText,
                          isSelected && styles.bucketBtnTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {bucket.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Feedback si erreur */}
              {isWrong && correctBucket && (
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackText}>
                    💡 Bonne catégorie :{' '}
                    <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                      {correctBucket.label}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  bucketsHeader: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    marginBottom: 12,
  },
  bucketIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#312E81',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  instruction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  itemCardWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  statusBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCorrect: {
    backgroundColor: '#10B981',
  },
  statusWrong: {
    backgroundColor: '#EF4444',
  },
  bucketButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bucketBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bucketBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  bucketBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  feedbackRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECDD3',
  },
  feedbackText: {
    fontSize: 11,
    color: '#B91C1C',
  },
});
