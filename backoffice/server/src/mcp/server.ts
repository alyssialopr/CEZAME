import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { supabaseAdmin } from '../config/supabase.js';
import { EXERCISE_TYPES_REFERENCE } from './schemas.js';
import { registerCurriculumTools } from './tools/curriculum.tools.js';
import { registerAnalyticsTools } from './tools/analytics.tools.js';

export function createCezameMcpServer(): McpServer {
  const server = new McpServer({
    name: 'cezame-backoffice-mcp',
    version: '1.0.0',
  });

  // Resource 1 : Schémas exacts des 7 types d'exercices CEZAME
  server.registerResource(
    'exercise-types-schema',
    'cezame://schema/exercise-types',
    {
      title: "Schémas des types d'exercices CEZAME",
      description:
        'Formats JSON exacts attendus pour lesson_questions.options (qcm, order, matching, document, bucket, scam, scenario).',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(EXERCISE_TYPES_REFERENCE, null, 2),
        },
      ],
    })
  );

  // Resource 2 : Vue d'ensemble du curriculum
  server.registerResource(
    'curriculum-overview',
    'cezame://curriculum/overview',
    {
      title: 'Arborescence du curriculum CEZAME',
      description: 'Liste des catégories, unités et leçons actuelles (statut, XP, ordre).',
      mimeType: 'application/json',
    },
    async (uri) => {
      const [{ data: categories }, { data: units }, { data: lessons }] = await Promise.all([
        supabaseAdmin.from('categories').select('id, label, order_index').order('order_index'),
        supabaseAdmin.from('units').select('id, category_id, unit_number, title').order('order_index'),
        supabaseAdmin.from('lessons').select('id, unit_id, category_id, title, status, xp_reward, order_index').order('order_index'),
      ]);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                categories: categories || [],
                units: units || [],
                lessons: lessons || [],
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  registerCurriculumTools(server);
  registerAnalyticsTools(server);

  return server;
}
