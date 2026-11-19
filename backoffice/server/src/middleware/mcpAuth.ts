import { Request, Response, NextFunction } from 'express';
import { getMcpSecurityConfig, safeTokenEquals } from '../config/env.js';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

/** Réinitialise le compteur de rate-limit (utile pour les tests). */
export function resetMcpRateLimit(): void {
  rateLimitStore.clear();
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function extractMcpToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    return token || null;
  }

  const apiKeyHeader = req.headers['x-mcp-api-key'];
  if (typeof apiKeyHeader === 'string' && apiKeyHeader.trim()) {
    return apiKeyHeader.trim();
  }

  return null;
}

/**
 * Middleware de sécurité pour l'endpoint `/api/mcp` :
 * - Fail-closed si `MCP_API_KEY` est absente (ou trop courte en production)
 * - Rate limiting par IP selon `ENVIRONMENT`
 * - Vérification en temps constant du jeton Bearer / x-mcp-api-key
 */
export function mcpAuth(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  const config = getMcpSecurityConfig();

  if (!config.isConfigured || !config.apiKey) {
    const message =
      config.environment === 'production'
        ? 'Service MCP indisponible'
        : `Service MCP non configuré (${config.configError}). Définis MCP_API_KEY dans .env.`;
    res.status(503).json({ error: message });
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    const ip = getClientIp(req);
    const now = Date.now();
    const bucket = rateLimitStore.get(ip);

    if (!bucket || now >= bucket.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + config.rateLimitWindowMs });
    } else if (bucket.count >= config.rateLimitMax) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfterSec, 1)));
      res.status(429).json({ error: 'Trop de requêtes MCP. Réessaye plus tard.' });
      return;
    } else {
      bucket.count += 1;
    }
  }

  const providedToken = extractMcpToken(req);
  if (!providedToken || !safeTokenEquals(providedToken, config.apiKey)) {
    res.status(401).json({ error: 'Authentification MCP invalide ou manquante' });
    return;
  }

  next();
}
