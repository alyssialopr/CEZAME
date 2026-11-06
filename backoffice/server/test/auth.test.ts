import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { auth, onQuery, loginAs, AUTH, has } from './fakeSupabase';

describe('GET /api/health', () => {
  it('répond ok sans authentification', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', serviceRoleConfigured: true });
  });
});

describe('requireAuth (via GET /api/auth/me)', () => {
  it('refuse sans en-tête Bearer', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(auth.getUser).not.toHaveBeenCalled();
  });

  it('refuse un jeton invalide', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad jwt' } });
    const res = await request(app).get('/api/auth/me').set(AUTH);
    expect(res.status).toBe(401);
    expect(auth.getUser).toHaveBeenCalledWith('valid-token');
  });

  it("refuse un compte qui n'est pas admin", async () => {
    onQuery(loginAs(null));
    const res = await request(app).get('/api/auth/me').set(AUTH);
    expect(res.status).toBe(403);
  });

  it('renvoie 500 avec un indice si la table des rôles manque', async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: 'u', email: 'a@b.c' } }, error: null });
    onQuery(() => ({ error: { message: 'relation does not exist', code: '42P01' } }));
    const res = await request(app).get('/api/auth/me').set(AUTH);
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('20260914_backoffice_schema.sql');
  });

  it("renvoie l'utilisateur admin avec un pseudo déduit de l'email", async () => {
    onQuery(loginAs('admin'));
    const res = await request(app).get('/api/auth/me').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'admin-1', email: 'admin@cezame.app', role: 'admin', username: 'admin' });
  });
});

describe('GET /api/auth/system-status', () => {
  it('indique si un superadmin existe', async () => {
    onQuery((c) => (c.table === 'admin_roles' && has(c, 'eq', 'role', 'superadmin') ? { count: 1 } : undefined));
    const res = await request(app).get('/api/auth/system-status');
    expect(res.body).toEqual({ hasSuperadmin: true });
  });
});

describe('POST /api/auth/bootstrap-superadmin', () => {
  it('exige email et mot de passe', async () => {
    const res = await request(app).post('/api/auth/bootstrap-superadmin').send({ email: 'a@b.c' });
    expect(res.status).toBe(400);
  });

  it("refuse s'il existe déjà un superadmin", async () => {
    onQuery(() => ({ count: 1 }));
    const res = await request(app).post('/api/auth/bootstrap-superadmin').send({ email: 'a@b.c', password: 'x' });
    expect(res.status).toBe(400);
    expect(auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('crée le compte puis attribue le rôle superadmin', async () => {
    onQuery(() => ({ count: 0 }));
    auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'new-1' } }, error: null });
    const res = await request(app)
      .post('/api/auth/bootstrap-superadmin')
      .send({ email: 'boss@cezame.app', password: 'secret' });
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('new-1');
    expect(auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'boss@cezame.app', email_confirm: true, user_metadata: { username: 'Super Admin' } })
    );
  });
});
