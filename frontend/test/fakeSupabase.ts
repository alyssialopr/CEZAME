// Faux client Supabase pour Jest : chaque requête enregistre ses méthodes
// (select, eq, upsert…) puis se résout via le gestionnaire fourni par le test.

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
  'order', 'range', 'limit', 'single', 'maybeSingle',
];

export const calls: QueryCall[] = [];
let handler: Handler = () => undefined;

export function onQuery(h: Handler) {
  handler = h;
}

export function callsTo(table: string) {
  return calls.filter((c) => c.table === table);
}

export function argsOf(call: QueryCall | undefined, name: string) {
  return call?.ops.find((op) => op.name === name)?.args;
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

export const supabase = {
  from: jest.fn((table: string) => makeBuilder(table)),
  rpc: jest.fn(async () => ({ data: null, error: null })),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(async () => ({ error: null })),
    getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
    getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
};

export function resetFake() {
  calls.length = 0;
  handler = () => undefined;
  supabase.from.mockClear();
  supabase.rpc.mockClear();
  supabase.auth.signUp.mockReset();
  supabase.auth.signInWithPassword.mockReset();
}
