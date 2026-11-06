import type { Page, Route } from '@playwright/test';

// Faux Supabase pour les tests E2E : intercepte http://supabase.test/** et sert
// l'authentification (auth/v1) et une mini-API PostgREST (rest/v1) en mémoire.

export const SUPABASE_URL = 'http://supabase.test';

type Row = Record<string, any>;

export interface MockUser {
  id: string;
  email: string;
  password?: string;
  user_metadata?: Row;
}

export class SupabaseMock {
  tables: Record<string, Row[]> = {};
  users: MockUser[] = [];
  requests: { method: string; path: string; body: any }[] = [];
  private nextId = 1;

  table(name: string): Row[] {
    return (this.tables[name] ??= []);
  }

  seed(name: string, rows: Row[]) {
    this.table(name).push(...rows);
  }

  rowsWritten(table: string, method?: string) {
    return this.requests
      .filter((r) => r.path.startsWith(`/rest/v1/${table}`) && (!method || r.method === method))
      .flatMap((r) => (Array.isArray(r.body) ? r.body : [r.body]));
  }

  async install(page: Page) {
    await page.route(`${SUPABASE_URL}/**`, (route) => this.handle(route));
  }

  private session(user: MockUser) {
    const now = Math.floor(Date.now() / 1000);
    return {
      access_token: `token-${user.id}`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: now + 3600,
      refresh_token: `refresh-${user.id}`,
      user: this.publicUser(user),
    };
  }

  private publicUser(user: MockUser) {
    return {
      id: user.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: user.email,
      user_metadata: user.user_metadata ?? {},
      app_metadata: { provider: 'email' },
      created_at: new Date().toISOString(),
    };
  }

  private async handle(route: Route) {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    let body: any = null;
    try {
      body = req.postDataJSON();
    } catch {
      body = req.postData();
    }
    this.requests.push({ method, path: url.pathname + url.search, body });

    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-expose-headers': 'content-range',
    };
    const json = (status: number, data: unknown, headers: Record<string, string> = {}) =>
      route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json', ...headers }, body: JSON.stringify(data) });

    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    if (url.pathname.startsWith('/auth/v1/')) return this.handleAuth(url, method, body, json, route, cors);
    if (url.pathname.startsWith('/rest/v1/rpc/')) return json(200, null);
    if (url.pathname.startsWith('/rest/v1/')) return this.handleRest(url, method, body, req.headers(), json, route, cors);
    return json(404, { message: 'not mocked' });
  }

  private handleAuth(url: URL, method: string, body: any, json: any, route: Route, cors: Row) {
    const path = url.pathname.replace('/auth/v1', '');
    const token = route.request().headers()['authorization']?.replace('Bearer ', '');

    if (path === '/signup' && method === 'POST') {
      const user: MockUser = {
        id: `user-${this.nextId++}`,
        email: body.email,
        password: body.password,
        user_metadata: body.data ?? {},
      };
      this.users.push(user);
      return json(200, this.session(user));
    }
    if (path === '/token') {
      const user = this.users.find((u) => u.email === body.email && u.password === body.password);
      if (!user) {
        return json(400, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials' });
      }
      return json(200, this.session(user));
    }
    if (path === '/user') {
      const user = this.users.find((u) => `token-${u.id}` === token);
      return user ? json(200, this.publicUser(user)) : json(401, { message: 'invalid JWT' });
    }
    if (path === '/logout') return route.fulfill({ status: 204, headers: cors });
    return json(404, { message: `auth route not mocked: ${path}` });
  }

  private handleRest(url: URL, method: string, body: any, headers: Row, json: any, route: Route, cors: Row) {
    const name = url.pathname.replace('/rest/v1/', '');
    const rows = this.table(name);
    const filters = [...url.searchParams.entries()].filter(([k, v]) => !['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k) && v.startsWith('eq.'));
    const matches = (r: Row) => filters.every(([k, v]) => String(r[k]) === v.slice(3));
    const wantsObject = (headers['accept'] ?? '').includes('vnd.pgrst.object');
    const wantsRows = (headers['prefer'] ?? '').includes('return=representation');

    const respond = (result: Row[], status = 200) => {
      if (wantsObject) {
        if (result.length !== 1) {
          return json(406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: null, hint: null });
        }
        return json(status, result[0]);
      }
      return json(status, result);
    };

    if (method === 'GET' || method === 'HEAD') {
      return respond(rows.filter(matches));
    }

    if (method === 'POST') {
      const incoming: Row[] = Array.isArray(body) ? body : [body];
      const upsert = (headers['prefer'] ?? '').includes('resolution=merge-duplicates');
      const conflictCols = (url.searchParams.get('on_conflict') ?? 'id').split(',');
      const saved = incoming.map((row) => {
        const existing = upsert ? rows.find((r) => conflictCols.every((c) => r[c] === row[c])) : undefined;
        if (existing) return Object.assign(existing, row);
        const created = { id: row.id ?? `${name}-${this.nextId++}`, ...row };
        rows.push(created);
        return created;
      });
      if (!wantsRows && !wantsObject) return route.fulfill({ status: 201, headers: cors });
      return respond(saved, 201);
    }

    if (method === 'PATCH') {
      const updated = rows.filter(matches).map((r) => Object.assign(r, body));
      if (!wantsRows && !wantsObject) return route.fulfill({ status: 204, headers: cors });
      return respond(updated);
    }

    if (method === 'DELETE') {
      this.tables[name] = rows.filter((r) => !matches(r));
      return route.fulfill({ status: 204, headers: cors });
    }

    return json(405, { message: 'method not mocked' });
  }
}
