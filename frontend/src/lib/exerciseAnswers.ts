import { BucketData, BucketItem, ScamData } from '@/types/lesson';

const DEFAULT_BUCKET_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

// Exercice de tri utilisé quand une question « bucket » arrive sans éléments.
export const FALLBACK_BUCKET_DATA: BucketData = {
  buckets: [
    { id: 'b1', label: 'Besoins (50%)', color: '#3B82F6' },
    { id: 'b2', label: 'Envies (30%)', color: '#8B5CF6' },
    { id: 'b3', label: 'Épargne (20%)', color: '#10B981' },
  ],
  items: [
    { id: '1', text: 'Loyer et électricité', bucketId: 'b1' },
    { id: '2', text: 'Sorties resto & cinéma', bucketId: 'b2' },
    { id: '3', text: 'Virement sur Livret A', bucketId: 'b3' },
    { id: '4', text: 'Courses alimentaires', bucketId: 'b1' },
  ],
};

// Accepte un objet { buckets, items }, un tableau qui l'enveloppe, ou une simple
// liste d'éléments portant un bucketId (les bacs sont alors déduits).
export function normalizeBucketData(rawOptions: any): BucketData {
  if (Array.isArray(rawOptions)) {
    if (rawOptions[0]?.buckets || rawOptions[0]?.items) {
      return rawOptions[0] as BucketData;
    }
    if (rawOptions.some((it: any) => it?.bucketId !== undefined)) {
      const uniqueIds = Array.from(new Set(rawOptions.map((it: any) => it.bucketId)));
      return {
        buckets: uniqueIds.map((bId, idx) => ({
          id: String(bId),
          label: `Bac ${idx + 1}`,
          color: DEFAULT_BUCKET_COLORS[idx % DEFAULT_BUCKET_COLORS.length],
        })),
        items: rawOptions as BucketItem[],
      };
    }
    return { buckets: [], items: [] };
  }
  if (rawOptions && typeof rawOptions === 'object') {
    return rawOptions as BucketData;
  }
  return { buckets: [], items: [] };
}

export function isBucketAnswerCorrect(items: BucketItem[], assignments: Record<string, string>): boolean {
  return items.length > 0 && items.every((it) => assignments[it.id] === it.bucketId);
}

export function isScamAnswerCorrect(scamData: ScamData | undefined, choseScam: boolean): boolean {
  const isActualScam = Boolean(scamData?.isScam !== undefined ? scamData.isScam : (scamData as any)?.scam);
  return choseScam === isActualScam;
}
