import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { onQuery, loginAs, AUTH, callsTo, argsOf, has, QueryCall } from './fakeSupabase';

const SCREENS = [{ title: 'Fiche', body: 'Corps', tip: null, order_index: 1 }];
const QUESTIONS = [
  { type: 'qcm', category: 'Quiz', prompt: 'Q1', options: [{ letter: 'A', text: 'Oui', correct: true }], explanation: 'E', order_index: 1 },
  {
    type: 'bucket', category: 'Tri', prompt: 'Range', explanation: '', order_index: 2,
    options: { buckets: [{ id: 'b1', label: 'Remboursé' }], items: [{ id: 'i1', text: 'Dentiste', bucketId: 'b1' }] },
  },
  {
    type: 'scenario', category: 'Cas', prompt: 'Que fais-tu ?', explanation: '', order_index: 3,
    options: { context: 'Tu reçois un courrier', options: [{ id: 'o1', text: 'Je réponds', correct: true }] },
  },
];

function asAdmin(extra: (c: QueryCall) => any = () => undefined) {
  const base = loginAs('admin');
  onQuery((c) => base(c) ?? extra(c));
}

describe('GET /api/import-export/lessons/:id', () => {
  it('renvoie 404 si la leçon est introuvable', async () => {
    asAdmin((c) => (c.table === 'lessons' ? { data: null, error: { message: 'not found' } } : undefined));
    const res = await request(app).get('/api/import-export/lessons/nope').set(AUTH);
    expect(res.status).toBe(404);
  });

  it('exporte la leçon avec ses fiches et questions', async () => {
    asAdmin((c) => {
      if (c.table === 'lessons') return { data: { id: 'L1', title: 'Carte vitale', category_id: 'sante', xp_reward: 50 } };
      if (c.table === 'lesson_screens') return { data: SCREENS };
      if (c.table === 'lesson_questions') return { data: QUESTIONS };
    });
    const res = await request(app).get('/api/import-export/lessons/L1').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toBe('attachment; filename="lesson-Carte_vitale.json"');
    expect(res.body.lesson).toEqual({ title: 'Carte vitale', category_id: 'sante', xp_reward: 50, screens: SCREENS, questions: QUESTIONS });
  });
});

describe('POST /api/import-export/lessons', () => {
  it('exige unité, catégorie et contenu', async () => {
    asAdmin();
    const res = await request(app).post('/api/import-export/lessons').set(AUTH).send({ targetUnitId: 'U1', payload: {} });
    expect(res.status).toBe(400);
  });

  it("importe un export en brouillon et conserve les types d'exercice", async () => {
    asAdmin((c) => {
      if (c.table === 'lessons' && has(c, 'select', '*', { count: 'exact', head: true })) return { count: 3 };
      if (c.table === 'lessons' && has(c, 'insert')) return { data: { id: 'NEW', title: 'Carte vitale' } };
    });
    const payload = { version: '1.0', lesson: { title: 'Carte vitale', xp_reward: 80, screens: SCREENS, questions: QUESTIONS } };
    const res = await request(app)
      .post('/api/import-export/lessons')
      .set(AUTH)
      .send({ targetUnitId: 'U1', targetCategoryId: 'sante', payload });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, lessonId: 'NEW' });

    const lessonInsert = callsTo('lessons').find((c) => has(c, 'insert'))!;
    expect(argsOf(lessonInsert, 'insert')?.[0]).toEqual({
      unit_id: 'U1', category_id: 'sante', title: 'Carte vitale', xp_reward: 80, order_index: 4, status: 'draft',
    });

    const inserted = argsOf(callsTo('lesson_questions')[0], 'insert')?.[0];
    expect(inserted.map((q: any) => q.type)).toEqual(['qcm', 'bucket', 'scenario']);
    expect(inserted[1].options).toEqual(QUESTIONS[1].options);
    expect(inserted.every((q: any) => q.lesson_id === 'NEW')).toBe(true);

    expect(argsOf(callsTo('audit_logs')[0], 'insert')?.[0]).toMatchObject({
      action: 'IMPORT_LESSON', details: { screensCount: 1, questionsCount: 3 },
    });
  });

  it('accepte une leçon à plat sans fiches ni questions', async () => {
    asAdmin((c) => (c.table === 'lessons' && has(c, 'insert') ? { data: { id: 'NEW2', title: 'X' } } : undefined));
    const res = await request(app)
      .post('/api/import-export/lessons')
      .set(AUTH)
      .send({ targetUnitId: 'U1', targetCategoryId: 'sante', payload: { title: 'X' } });
    expect(res.status).toBe(200);
    expect(callsTo('lesson_screens')).toHaveLength(0);
    expect(callsTo('lesson_questions')).toHaveLength(0);
  });

  // Constat : order_index est calculé par unité, mais la contrainte SQL est
  // UNIQUE(category_id, order_index). Un import dans la 2e unité d'une catégorie
  // peut donc entrer en collision. À corriger côté route avant d'activer ce test.
  it.todo("calcule order_index sur la catégorie, comme l'impose la contrainte UNIQUE(category_id, order_index)");
});

describe('POST /api/import-export/lessons/batch', () => {
  it('exige unité, catégorie et au moins une leçon', async () => {
    asAdmin();
    const res = await request(app)
      .post('/api/import-export/lessons/batch')
      .set(AUTH)
      .send({ targetUnitId: 'U1', targetCategoryId: 'sante', lessons: [] });
    expect(res.status).toBe(400);
  });

  it('crée chaque leçon à la suite des leçons existantes, avec fiches et questions', async () => {
    let created = 0;
    asAdmin((c) => {
      if (c.table === 'lessons' && has(c, 'order')) return { data: [{ order_index: 4 }] };
      if (c.table === 'lessons' && has(c, 'insert')) return { data: { id: `NEW${++created}` } };
    });
    const res = await request(app)
      .post('/api/import-export/lessons/batch')
      .set(AUTH)
      .send({
        targetUnitId: 'U1',
        targetCategoryId: 'sante',
        lessons: [
          { title: 'Carte vitale', status: 'published', screens: SCREENS, questions: QUESTIONS },
          { title: 'Mutuelle', xp_reward: 'abc' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    const inserted = callsTo('lessons').filter((c) => has(c, 'insert')).map((c) => argsOf(c, 'insert')[0]);
    expect(inserted).toEqual([
      expect.objectContaining({ title: 'Carte vitale', order_index: 5, status: 'published', xp_reward: 50 }),
      expect.objectContaining({ title: 'Mutuelle', order_index: 6, status: 'draft', xp_reward: 50 }),
    ]);
    const questions = argsOf(callsTo('lesson_questions').find((c) => has(c, 'insert'))!, 'insert')[0];
    expect(questions.map((q: any) => q.type)).toEqual(['qcm', 'bucket', 'scenario']);
    expect(questions[1].options).toEqual(QUESTIONS[1].options);
    expect(argsOf(callsTo('audit_logs')[0], 'insert')[0]).toMatchObject({ action: 'IMPORT_LESSONS_BATCH', target_id: 'U1' });
  });
});
