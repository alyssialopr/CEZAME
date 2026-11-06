import { vi } from 'vitest';

// Faux client Supabase : chaque requête enregistre les méthodes appelées
// (select, eq, insert…) puis se résout via le gestionnaire fourni par le test.

export interface QueryCall {
  table: string;
  ops: { name: string; args: any[] }[];
}

export interface QueryResult {
  data?: any;
  error?: { message: string; code?: string } | null;
  count?: number | null;
}

type Handler = (call: QueryCall) => QueryResult | undefined;

const CHAIN_METHODS = [
  'select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'or', 'gte', 'lte',
  'order', 'range', 'limit', 'single', 'maybeSingle', 'ilike', 'match',
];

export const calls: QueryCall[] = [];
let handler: Handler = () => undefined;

export function onQuery(h: Handler) {
  handler = h;
}

export function has(call: QueryCall, name: string, ...args: any[]) {
  return call.ops.some(
    (op) => op.name === name && args.every((a, i) => JSON.stringify(op.args[i]) === JSON.stringify(a))
  );
}

export function argsOf(call: QueryCall, name: string) {
  return call.ops.find((op) => op.name === name)?.args;
}

export function callsTo(table: string) {
  return calls.filter((c) => c.table === table);
}

function makeBuilder(table: string) {
  const call: QueryCall = { table, ops: [] };
  calls.push(call);
  const builder: any = {};
  for (const m of CHAIN_METHODS) {
    builder[m] = (...args: any[]) => {
      call.ops.push({ name: m, args });
      return builder;
    };
  }
  builder.then = (resolve: any, reject: any) => {
    try {
      const r = handler(call) || {};
      return Promise.resolve({ data: r.data ?? null, error: r.error ?? null, count: r.count ?? null }).then(resolve, reject);
    } catch (e) {
      return Promise.reject(e).then(resolve, reject);
    }
  };
  return builder;
}

export const auth = {
  getUser: vi.fn(),
  admin: {
    listUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  },
};

export const fakeClient = {
  from: vi.fn((table: string) => makeBuilder(table)),
  auth,
};

export function resetFake() {
  calls.length = 0;
  handler = () => undefined;
  fakeClient.from.mockClear();
  auth.getUser.mockReset();
  Object.values(auth.admin).forEach((fn) => fn.mockReset());
}

export const supabaseModule = {
  supabaseUrl: 'http://supabase.test',
  supabaseAnonKey: 'anon',
  supabaseServiceKey: 'service',
  supabasePublic: fakeClient,
  supabaseAdmin: fakeClient,
  hasServiceRoleKey: true,
  getUserClient: () => fakeClient,
};

// Simule un utilisateur connecté avec le rôle donné (ou sans rôle).
export function loginAs(role: 'admin' | 'superadmin' | null, user = { id: 'admin-1', email: 'admin@cezame.app' }) {
  auth.getUser.mockResolvedValue({ data: { user: { ...user, user_metadata: {} } }, error: null });
  return (call: QueryCall): QueryResult | undefined => {
    if (call.table === 'admin_roles' && has(call, 'maybeSingle')) {
      return { data: role ? { role } : null };
    }
    return undefined;
  };
}

export const AUTH = { Authorization: 'Bearer valid-token' };
