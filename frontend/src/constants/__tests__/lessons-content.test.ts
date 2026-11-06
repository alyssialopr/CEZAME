import { CATEGORIES } from '@/constants/categories';
import { LESSONS } from '@/constants/lessons';
import { resolveQuestionType } from '@/services/lessonsService';

// Vérifie que le contenu embarqué (utilisé hors ligne) est jouable.
describe('contenu local des leçons', () => {
  it('couvre chaque catégorie', () => {
    CATEGORIES.forEach((c) => {
      expect(LESSONS[c.id]).toBeDefined();
      expect(LESSONS[c.id].screens.length).toBeGreaterThan(0);
      expect(LESSONS[c.id].questions.length).toBeGreaterThan(0);
    });
  });

  const cases = Object.entries(LESSONS).flatMap(([cat, lesson]) =>
    lesson.questions.map((q, i) => [`${cat} #${i + 1}`, q] as const)
  );

  it.each(cases)('%s a une réponse attendue', (_name, q) => {
    expect(q.prompt).toBeTruthy();
    const type = resolveQuestionType(q.type, q.options);
    const opts: any = q.options;
    switch (type) {
      case 'qcm':
      case 'document':
        expect(opts.some((o: any) => o.correct)).toBe(true);
        break;
      case 'scenario': {
        const data = Array.isArray(opts) ? opts[0] : opts;
        expect(data.options.some((o: any) => o.correct)).toBe(true);
        break;
      }
      case 'scam': {
        const data = Array.isArray(opts) ? opts[0] : opts;
        expect(typeof (data.isScam ?? data.scam)).toBe('boolean');
        break;
      }
      case 'bucket': {
        const data = Array.isArray(opts) ? opts[0] : opts;
        const ids = data.buckets.map((b: any) => b.id);
        data.items.forEach((it: any) => expect(ids).toContain(it.bucketId));
        break;
      }
      case 'matching':
        opts.forEach((p: any) => expect(p.left && p.right).toBeTruthy());
        break;
      case 'order':
        expect(opts.length).toBeGreaterThan(1);
        break;
    }
  });
});
