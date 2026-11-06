import type { Page, Route } from '@playwright/test';

// Fausse API du backoffice : intercepte http://api.test/api/** et répond à partir
// d'un état en mémoire. Les requêtes reçues sont gardées pour les assertions.

export const API_URL = 'http://api.test/api';

type Handler = (body: any, url: URL) => { status?: number; json: unknown } | undefined;

export class BackofficeApiMock {
  requests: { method: string; path: string; body: any }[] = [];
  admins: Record<string, { id: string; email: string; role: 'admin' | 'superadmin'; username: string }> = {};
  categories: any[] = [
    { id: 'finance', label: 'Finance', subtitle: 'Budget', color: '#8FA6FF', border_color: '#607FE8', icon_name: 'Euro', mascot_name: 'RicoEntrepriseDroit', order_index: 1 },
  ];
  units: any[] = [{ id: 'unit-finance-1', category_id: 'finance', unit_number: 1, title: 'Les bases', order_index: 1, lessons: [] }];
  lessons: any[] = [];
  private routes = new Map<string, Handler>();

  constructor() {
    this.on('GET /auth/system-status', () => ({ json: { hasSuperadmin: true } }));
    this.on('GET /stats', () => ({
      json: {
        totalUsers: 12, totalLessons: this.lessons.length, totalUnits: this.units.length, totalQuestions: 0,
        totalScreens: 0, totalCompletedLessons: 3, categoryStats: [], recentLogs: [],
      },
    }));
    this.on('GET /content/categories', () => ({ json: this.categories }));
    this.on('POST /content/categories', (body) => {
      if (!body.id || !body.label) return { status: 400, json: { error: 'ID et libellé de catégorie requis' } };
      const cat = { ...body, id: String(body.id).toLowerCase().trim() };
      this.categories.push(cat);
      return { json: cat };
    });
    this.on('GET /content/units', (_b, url) => {
      const cat = url.searchParams.get('category_id');
      return { json: cat ? this.units.filter((u) => u.category_id === cat) : this.units };
    });
    this.on('GET /content/lessons', () => ({ json: this.lessons }));
    this.on('POST /import-export/lessons', (body) => {
      const lessonData = body.payload?.lesson || body.payload;
      const lesson = {
        id: 'lesson-imported', unit_id: body.targetUnitId, category_id: body.targetCategoryId,
        title: lessonData.title, xp_reward: lessonData.xp_reward ?? 50, order_index: 1, status: 'draft',
        screens: lessonData.screens ?? [], questions: (lessonData.questions ?? []).map((q: any, i: number) => ({ id: `q${i}`, ...q })),
        screensCount: lessonData.screens?.length ?? 0, questionsCount: lessonData.questions?.length ?? 0,
      };
      this.lessons.push(lesson);
      return { json: { success: true, message: 'Leçon importée avec succès en statut brouillon !', lessonId: lesson.id } };
    });
    this.on('POST /import-export/lessons/batch', (body) => {
      if (!body.targetUnitId || !body.targetCategoryId || !body.lessons?.length) {
        return { status: 400, json: { error: 'targetUnitId, targetCategoryId et tableau lessons requis et non vide' } };
      }
      const created = body.lessons.map((l: any, i: number) => ({
        id: `lesson-batch-${i + 1}`, unit_id: body.targetUnitId, category_id: body.targetCategoryId,
        title: l.title, xp_reward: l.xp_reward ?? 50, order_index: this.lessons.length + i + 1, status: l.status ?? 'draft',
        screensCount: l.screens?.length ?? 0, questionsCount: l.questions?.length ?? 0,
      }));
      this.lessons.push(...created);
      return { json: { success: true, count: created.length, lessons: created } };
    });
    this.on('GET /content/lessons/lesson-imported', () => ({ json: this.lessons.find((l) => l.id === 'lesson-imported') }));
  }

  on(key: string, handler: Handler) {
    this.routes.set(key, handler);
  }

  addAdmin(token: string, admin: { id: string; email: string; role: 'admin' | 'superadmin'; username: string }) {
    this.admins[token] = admin;
  }

  sent(method: string, path: string) {
    return this.requests.filter((r) => r.method === method && r.path === path).map((r) => r.body);
  }

  async install(page: Page) {
    await page.route(`${API_URL}/**`, (route) => this.handle(route));
  }

  private async handle(route: Route) {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace('/api', '');
    const method = req.method();
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
    };
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    let body: any = null;
    try {
      body = req.postDataJSON();
    } catch {}
    this.requests.push({ method, path, body });

    const reply = (status: number, json: unknown) =>
      route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(json) });

    const token = req.headers()['authorization']?.replace('Bearer ', '');
    if (path !== '/auth/system-status') {
      if (!token) return reply(401, { error: 'Jeton d’authentification manquant' });
      if (!this.admins[token]) {
        return reply(403, { error: 'Accès refusé : votre compte n’est pas enregistré comme administrateur dans la table "admin_roles".' });
      }
    }
    if (path === '/auth/me') return reply(200, { user: this.admins[token!] });

    const handler = this.routes.get(`${method} ${path}`);
    if (!handler) return reply(404, { error: `route non simulée : ${method} ${path}` });
    const res = handler(body, url) ?? { json: {} };
    return reply(res.status ?? 200, res.json);
  }
}
