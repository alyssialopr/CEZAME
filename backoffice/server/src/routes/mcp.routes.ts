import { Router, Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createCezameMcpServer } from '../mcp/server.js';
import { sanitizeErrorMessage } from '../config/env.js';

const router = Router();

/**
 * Endpoint MCP Streamable HTTP en mode stateless (compatible Vercel Serverless).
 */
router.post('/', async (req: Request, res: Response) => {
  const server = createCezameMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('Erreur MCP transport:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: sanitizeErrorMessage(err, 'Erreur interne du serveur MCP'),
        },
        id: null,
      });
    }
  }
});

// En mode stateless sur Vercel, les streams GET SSE et fermetures DELETE ne sont pas utilisés.
router.get('/', (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed: serveur MCP stateless (utiliser POST /api/mcp).',
    },
    id: null,
  });
});

router.delete('/', (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed: serveur MCP stateless.',
    },
    id: null,
  });
});

export default router;
