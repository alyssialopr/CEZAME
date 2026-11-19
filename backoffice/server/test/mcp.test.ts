import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getEnvironment, getMcpSecurityConfig } from '../src/config/env.js';
import { resetMcpRateLimit } from '../src/middleware/mcpAuth.js';
import { validateLessonPayload } from '../src/mcp/schemas.js';
import { onQuery, callsTo, argsOf, has } from './fakeSupabase';

const TEST_MCP_KEY = 'cezame-test-mcp-key-with-at-least-32-characters-0123456789';
const MCP_HEADERS = {
  Authorization: `Bearer ${TEST_MCP_KEY}`,
  Accept: 'application/json, text/event-stream',
};

const VALID_LESSON_PAYLOAD = {
  title: 'Gérer son budget étudiant',
  xp_reward: 60,
  screens: [
    {
      title: 'La règle 50/30/20',
      body: 'Répartis tes revenus entre besoins essentiels, envies et épargne.',
      tip: 'Automatise un virement épargne dès réception de ta paie.',
    },
  ],
  questions: [
    {
      type: 'qcm' as const,
      category: 'Budget',
      prompt: 'Quelle part du budget est dédiée aux besoins essentiels ?',
      options: [
        { letter: 'A', text: '50 %', correct: true },
        { letter: 'B', text: '10 %' },
      ],
      explanation: 'La règle 50/30/20 réserve 50 % aux besoins essentiels.',
    },
    {
      type: 'scam' as const,
      category: 'Sécurité',
      prompt: 'Ce SMS est-il une arnaque ?',
      options: {
        sender: '+33 7 00 00 00 00',
        channel: 'sms' as const,
        message: 'Cliquez ici pour débloquer votre compte.',
        isScam: true,
        redFlags: ['Lien suspect par SMS'],
      },
      explanation: 'Une banque ne demande jamais de cliquer sur un lien par SMS.',
    },
  ],
};

describe('ENVIRONMENT & sécurité MCP', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetMcpRateLimit();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('détecte correctement ENVIRONMENT (local, development, production)', () => {
    delete process.env.ENVIRONMENT;
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    expect(getEnvironment()).toBe('local');

    process.env.ENVIRONMENT = 'dev';
    expect(getEnvironment()).toBe('development');

    process.env.ENVIRONMENT = 'prod';
    expect(getEnvironment()).toBe('production');

    delete process.env.ENVIRONMENT;
    process.env.VERCEL = '1';
    process.env.VERCEL_ENV = 'production';
    expect(getEnvironment()).toBe('production');
  });

  it('refuse en 503 (fail-closed) si MCP_API_KEY est absente', async () => {
    delete process.env.MCP_API_KEY;
    process.env.ENVIRONMENT = 'local';

    const res = await request(app).post('/api/mcp').send({});
    expect(res.status).toBe(503);
    expect(res.body.error).toContain('MCP_API_KEY');
  });

  it('refuse en 503 en production si MCP_API_KEY est trop courte (< 32 chars)', async () => {
    process.env.ENVIRONMENT = 'production';
    process.env.MCP_API_KEY = 'trop-courte';

    const cfg = getMcpSecurityConfig();
    expect(cfg.isConfigured).toBe(false);

    const res = await request(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer trop-courte')
      .send({});
    expect(res.status).toBe(503);
    // Ne fuite pas les détails de config en production
    expect(res.body.error).toBe('Service MCP indisponible');
  });

  it('retourne 401 si le jeton Bearer est absent ou invalide', async () => {
    process.env.ENVIRONMENT = 'local';
    process.env.MCP_API_KEY = TEST_MCP_KEY;

    const missing = await request(app).post('/api/mcp').send({});
    expect(missing.status).toBe(401);

    const wrong = await request(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer mauvais-jeton')
      .send({});
    expect(wrong.status).toBe(401);
  });

  it('retourne 405 sur GET /api/mcp (mode stateless)', async () => {
    process.env.ENVIRONMENT = 'local';
    process.env.MCP_API_KEY = TEST_MCP_KEY;

    const res = await request(app).get('/api/mcp').set(MCP_HEADERS);
    expect(res.status).toBe(405);
  });

  it('expose environment dans /api/health', async () => {
    process.env.ENVIRONMENT = 'development';
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.environment).toBe('development');
  });
});

describe('MCP Protocol, Tools & Validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ENVIRONMENT = 'local';
    process.env.MCP_API_KEY = TEST_MCP_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('répond à initialize et tools/list via Streamable HTTP', async () => {
    const initRes = await request(app)
      .post('/api/mcp')
      .set(MCP_HEADERS)
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'vitest', version: '1.0.0' },
        },
      });

    expect(initRes.status).toBe(200);
    expect(initRes.body.result.serverInfo.name).toBe('cezame-backoffice-mcp');

    const listRes = await request(app)
      .post('/api/mcp')
      .set(MCP_HEADERS)
      .send({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      });

    expect(listRes.status).toBe(200);
    const toolNames = listRes.body.result.tools.map((t: any) => t.name);
    expect(toolNames).toEqual(
      expect.arrayContaining([
        'list_curriculum',
        'get_lesson',
        'validate_lesson_payload',
        'create_lesson_draft',
        'get_analytics_summary',
        'get_lesson_friction',
      ])
    );
  });

  it('valide les payloads de leçons et rejette un QCM sans bonne réponse', () => {
    expect(validateLessonPayload(VALID_LESSON_PAYLOAD).valid).toBe(true);

    const invalid = {
      ...VALID_LESSON_PAYLOAD,
      questions: [
        {
          type: 'qcm',
          category: 'Test',
          prompt: 'Question ?',
          options: [
            { letter: 'A', text: 'Faux' },
            { letter: 'B', text: 'Faux aussi' },
          ],
          explanation: 'Explication',
        },
      ],
    };
    const res = validateLessonPayload(invalid);
    expect(res.valid).toBe(false);
  });

  it('create_lesson_draft crée une leçon en draft uniquement et journalise dans audit_logs', async () => {
    const unitId = '11111111-1111-4111-8111-111111111111';
    const lessonId = '22222222-2222-4222-8222-222222222222';

    onQuery((c) => {
      if (c.table === 'units') {
        return { data: { id: unitId, category_id: 'finance', title: 'Unité 1' } };
      }
      if (c.table === 'lessons') {
        if (has(c, 'insert')) {
          return {
            data: {
              id: lessonId,
              unit_id: unitId,
              category_id: 'finance',
              title: VALID_LESSON_PAYLOAD.title,
              xp_reward: 60,
              order_index: 3,
              status: 'draft',
            },
          };
        }
        if (has(c, 'select')) {
          return { data: [{ order_index: 2 }] };
        }
      }
      return undefined;
    });

    const res = await request(app)
      .post('/api/mcp')
      .set(MCP_HEADERS)
      .send({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'create_lesson_draft',
          arguments: {
            target_category_id: 'finance',
            target_unit_id: unitId,
            lesson: VALID_LESSON_PAYLOAD,
          },
        },
      });

    expect(res.status).toBe(200);
    const payload = JSON.parse(res.body.result.content[0].text);
    expect(payload.created).toBe(true);
    expect(payload.status).toBe('draft');
    expect(payload.screensCount).toBe(1);
    expect(payload.questionsCount).toBe(2);

    const lessonInsert = callsTo('lessons').find((c) => has(c, 'insert'));
    expect(argsOf(lessonInsert!, 'insert')?.[0]).toMatchObject({
      status: 'draft',
      order_index: 3,
    });

    expect(argsOf(callsTo('audit_logs')[0], 'insert')?.[0]).toMatchObject({
      admin_email: 'mcp-agent',
      action: 'MCP_CREATE_LESSON_DRAFT',
      target_id: lessonId,
    });
  });

  it('get_analytics_summary retourne des métriques agrégées anonymisées', async () => {
    onQuery((c) => {
      if (c.table === 'user_events') {
        return {
          data: [
            {
              event_type: 'navigation',
              event_name: 'lesson_opened',
              screen_name: 'Lesson',
              properties: { categoryId: 'finance' },
              user_id: 'secret-user-uuid',
              created_at: new Date().toISOString(),
            },
          ],
          count: 1,
        };
      }
      return { count: 5 };
    });

    const res = await request(app)
      .post('/api/mcp')
      .set(MCP_HEADERS)
      .send({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_analytics_summary',
          arguments: { event_sample_limit: 500 },
        },
      });

    expect(res.status).toBe(200);
    const rawText = res.body.result.content[0].text;
    expect(rawText).not.toContain('secret-user-uuid');
    const parsed = JSON.parse(rawText);
    expect(parsed.funnel.opened).toBe(1);
  });
});
