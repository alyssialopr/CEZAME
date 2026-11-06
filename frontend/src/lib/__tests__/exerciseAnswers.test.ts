import {
  FALLBACK_BUCKET_DATA,
  isBucketAnswerCorrect,
  isScamAnswerCorrect,
  normalizeBucketData,
} from '@/lib/exerciseAnswers';

describe('normalizeBucketData', () => {
  const data = { buckets: [{ id: 'b1', label: 'Oui' }], items: [{ id: 'i1', text: 'x', bucketId: 'b1' }] };

  it("garde un objet { buckets, items } tel quel", () => {
    expect(normalizeBucketData(data)).toBe(data);
  });

  it('déballe un tableau qui contient cet objet', () => {
    expect(normalizeBucketData([data])).toBe(data);
  });

  it("déduit les bacs d'une liste d'éléments", () => {
    const items = [
      { id: '1', text: 'Loyer', bucketId: 'fixe' },
      { id: '2', text: 'Cinéma', bucketId: 'loisir' },
      { id: '3', text: 'EDF', bucketId: 'fixe' },
    ];
    expect(normalizeBucketData(items)).toEqual({
      buckets: [
        { id: 'fixe', label: 'Bac 1', color: '#3B82F6' },
        { id: 'loisir', label: 'Bac 2', color: '#8B5CF6' },
      ],
      items,
    });
  });

  it('renvoie un tri vide pour une entrée inexploitable', () => {
    expect(normalizeBucketData(null)).toEqual({ buckets: [], items: [] });
    expect(normalizeBucketData([{ letter: 'A' }])).toEqual({ buckets: [], items: [] });
  });

  it('a un exercice de secours cohérent', () => {
    const ids = FALLBACK_BUCKET_DATA.buckets.map((b) => b.id);
    FALLBACK_BUCKET_DATA.items.forEach((it) => expect(ids).toContain(it.bucketId));
  });
});

describe('isBucketAnswerCorrect', () => {
  const items = FALLBACK_BUCKET_DATA.items;

  it('exige que chaque élément soit dans son bac', () => {
    expect(isBucketAnswerCorrect(items, { '1': 'b1', '2': 'b2', '3': 'b3', '4': 'b1' })).toBe(true);
    expect(isBucketAnswerCorrect(items, { '1': 'b1', '2': 'b2', '3': 'b3', '4': 'b2' })).toBe(false);
    expect(isBucketAnswerCorrect(items, { '1': 'b1' })).toBe(false);
  });

  it('refuse un exercice sans élément', () => {
    expect(isBucketAnswerCorrect([], {})).toBe(false);
  });
});

describe('isScamAnswerCorrect', () => {
  it("compare le choix à isScam, ou à l'ancien champ scam", () => {
    expect(isScamAnswerCorrect({ isScam: true } as any, true)).toBe(true);
    expect(isScamAnswerCorrect({ isScam: false } as any, true)).toBe(false);
    expect(isScamAnswerCorrect({ scam: true } as any, true)).toBe(true);
    expect(isScamAnswerCorrect(undefined, false)).toBe(true);
  });
});
