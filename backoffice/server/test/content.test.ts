import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { onQuery, loginAs, AUTH, callsTo, argsOf, has, QueryCall } from './fakeSupabase';

function asAdmin(extra: (c: QueryCall) => any = () => undefined) {
  const base = loginAs('admin');
  onQuery((c) => base(c) ?? extra(c));
}

describe('/api/content', () => {
  it("exige d'être connecté", async () => {
    const res = await request(app).get('/api/content/categories');
    expect(res.status).toBe(401);
  });

  it('refuse une catégorie sans id ni libellé', async () => {
    asAdmin();
    const res = await request(app).post('/api/content/categories').set(AUTH).send({ label: 'Santé' });
    expect(res.status).toBe(400);
  });

  it('crée une catégorie avec les valeurs par défaut et un id normalisé', async () => {
    asAdmin((c) => (c.table === 'categories' ? { data: { id: 'sport' } } : undefined));
    const res = await request(app).post('/api/content/categories').set(AUTH).send({ id: '  SPORT ', label: 'Sport' });
    expect(res.status).toBe(200);
    expect(argsOf(callsTo('categories')[0], 'insert')?.[0]).toEqual({
      id: 'sport', label: 'Sport', subtitle: undefined, color: '#8FA6FF', border_color: '#607FE8',
      icon_name: 'FileText', mascot_name: 'RicoEntreprise', order_index: 1,
    });
    expect(argsOf(callsTo('audit_logs')[0], 'insert')?.[0]).toMatchObject({ action: 'CREATE_CATEGORY' });
  });

  it('refuse de supprimer une catégorie qui a des unités', async () => {
    asAdmin((c) => (c.table === 'units' ? { count: 2 } : undefined));
    const res = await request(app).delete('/api/content/categories/sante').set(AUTH);
    expect(res.status).toBe(400);
    expect(callsTo('categories').some((c) => has(c, 'delete'))).toBe(false);
  });

  it('refuse une unité sans titre', async () => {
    asAdmin();
    const res = await request(app).post('/api/content/units').set(AUTH).send({ category_id: 'sante' });
    expect(res.status).toBe(400);
  });

  it('refuse un statut de leçon inconnu', async () => {
    asAdmin();
    const res = await request(app).patch('/api/content/lessons/L1/status').set(AUTH).send({ status: 'archived' });
    expect(res.status).toBe(400);
  });

  it('publie une leçon et le journalise', async () => {
    asAdmin((c) => (c.table === 'lessons' ? { data: { id: 'L1', status: 'published' } } : undefined));
    const res = await request(app).patch('/api/content/lessons/L1/status').set(AUTH).send({ status: 'published' });
    expect(res.status).toBe(200);
    expect(argsOf(callsTo('audit_logs')[0], 'insert')?.[0]).toMatchObject({ action: 'PUBLISH_LESSON', target_id: 'L1' });
  });

  it('refuse un réordonnancement de type inconnu', async () => {
    asAdmin();
    const res = await request(app).post('/api/content/reorder').set(AUTH).send({ type: 'categories', items: [] });
    expect(res.status).toBe(400);
  });

  it('met à jour order_index de chaque élément', async () => {
    asAdmin();
    const res = await request(app)
      .post('/api/content/reorder')
      .set(AUTH)
      .send({ type: 'questions', items: [{ id: 'q1', order_index: 2 }, { id: 'q2', order_index: 1 }] });
    expect(res.status).toBe(200);
    const updates = callsTo('lesson_questions');
    expect(updates).toHaveLength(2);
    expect(has(updates[0], 'update', { order_index: 2 })).toBe(true);
    expect(has(updates[0], 'eq', 'id', 'q1')).toBe(true);
  });
});
