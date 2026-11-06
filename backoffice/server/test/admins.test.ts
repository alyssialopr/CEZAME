import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { onQuery, loginAs, AUTH, callsTo, argsOf } from './fakeSupabase';

describe('/api/admins', () => {
  it('est réservé aux superadmins', async () => {
    onQuery(loginAs('admin'));
    const res = await request(app).get('/api/admins').set(AUTH);
    expect(res.status).toBe(403);
  });

  it("refuse un rôle invalide à la création", async () => {
    onQuery(loginAs('superadmin'));
    const res = await request(app).post('/api/admins').set(AUTH).send({ email: 'a@b.c', password: 'x', role: 'roi' });
    expect(res.status).toBe(400);
  });

  it('interdit de se retirer ses propres droits de superadmin', async () => {
    onQuery(loginAs('superadmin'));
    const res = await request(app).patch('/api/admins/admin-1').set(AUTH).send({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('interdit de révoquer son propre accès', async () => {
    onQuery(loginAs('superadmin'));
    const res = await request(app).delete('/api/admins/admin-1').set(AUTH);
    expect(res.status).toBe(400);
  });

  it("change le rôle d'un autre admin et l'inscrit au journal d'audit", async () => {
    onQuery(loginAs('superadmin'));
    const res = await request(app).patch('/api/admins/other').set(AUTH).send({ role: 'superadmin' });
    expect(res.status).toBe(200);
    const audit = callsTo('audit_logs')[0];
    expect(argsOf(audit, 'insert')?.[0]).toMatchObject({
      action: 'UPDATE_ADMIN_ROLE', target_id: 'other', details: { newRole: 'superadmin' },
    });
  });
});
