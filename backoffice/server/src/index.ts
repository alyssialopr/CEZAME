import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import statsRoutes from './routes/stats.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminsRoutes from './routes/admins.routes.js';
import contentRoutes from './routes/content.routes.js';
import importExportRoutes from './routes/import-export.routes.js';
import auditRoutes from './routes/audit.routes.js';
import activityRoutes from './routes/activity.routes.js';
import { hasServiceRoleKey } from './config/supabase.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Configuration CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (comme Postman ou curl) ou celles listées
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // En dev permissif
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/activity', activityRoutes);

// Statut de santé du serveur
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serviceRoleConfigured: hasServiceRoleKey,
  });
});

app.listen(port, () => {
  console.log(`🚀 CEZAME Backoffice Server démarré sur http://localhost:${port}`);
  if (!hasServiceRoleKey) {
    console.warn(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY n’est pas définie dans backoffice/server/.env. Renseigne-la pour activer la suppression et création des comptes utilisateurs Auth.'
    );
  } else {
    console.log('✅ Supabase Service Role Key détectée et prête.');
  }
});
