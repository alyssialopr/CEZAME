import crypto from 'crypto';

export type AppEnvironment = 'local' | 'development' | 'production';

const ENV_ALIASES: Record<string, AppEnvironment> = {
  local: 'local',
  dev: 'development',
  development: 'development',
  prod: 'production',
  production: 'production',
};

const MIN_PROD_MCP_KEY_LENGTH = 32;

/**
 * Détermine l'environnement courant à partir de la variable `ENVIRONMENT`
 * (ou par défaut selon `VERCEL_ENV` / `VERCEL`).
 */
export function getEnvironment(): AppEnvironment {
  const raw = process.env.ENVIRONMENT?.trim().toLowerCase();
  if (raw && raw in ENV_ALIASES) {
    return ENV_ALIASES[raw];
  }

  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  if (process.env.VERCEL) {
    return 'development';
  }
  return 'local';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

export function isLocal(): boolean {
  return getEnvironment() === 'local';
}

export interface McpSecurityConfig {
  environment: AppEnvironment;
  apiKey: string | null;
  isConfigured: boolean;
  configError: string | null;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

/**
 * Vérifie la configuration de sécurité du serveur MCP selon `ENVIRONMENT`.
 * En production, exige une clé `MCP_API_KEY` d'au moins 32 caractères.
 */
export function getMcpSecurityConfig(): McpSecurityConfig {
  const environment = getEnvironment();
  const rawKey = process.env.MCP_API_KEY?.trim() || '';

  let configError: string | null = null;
  if (!rawKey) {
    configError = 'MCP_API_KEY non configurée';
  } else if (environment === 'production' && rawKey.length < MIN_PROD_MCP_KEY_LENGTH) {
    configError = `MCP_API_KEY trop courte pour la production (minimum ${MIN_PROD_MCP_KEY_LENGTH} caractères)`;
  }

  return {
    environment,
    apiKey: configError ? null : rawKey,
    isConfigured: configError === null,
    configError,
    rateLimitMax: environment === 'production' ? 60 : 200,
    rateLimitWindowMs: 60_000,
  };
}

/**
 * Compare deux secrets en temps constant via un hash SHA-256 pour éviter
 * les attaques par canal auxiliaire (timing attacks) même sur des longueurs différentes.
 */
export function safeTokenEquals(provided: string, expected: string): boolean {
  const providedDigest = crypto.createHash('sha256').update(provided).digest();
  const expectedDigest = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

/**
 * Masque les détails internes d'erreur en production.
 */
export function sanitizeErrorMessage(err: unknown, fallback = 'Erreur interne du serveur'): string {
  if (isProduction()) {
    return fallback;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
