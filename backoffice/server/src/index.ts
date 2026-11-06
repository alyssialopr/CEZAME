import dotenv from 'dotenv';
import { app } from './app.js';
import { hasServiceRoleKey } from './config/supabase.js';

dotenv.config();

const port = process.env.PORT || 4000;

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
