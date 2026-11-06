# Tests

Il y a quatre suites. Aucune ne touche au vrai projet Supabase : les tests unitaires remplacent le client Supabase par un faux, et les tests E2E interceptent dans le navigateur les appels vers des adresses factices (`http://supabase.test`, `http://api.test`).

Il faut Node 22.

| Suite | Dossier | Outils | Commande |
|---|---|---|---|
| API du backoffice | `backoffice/server` | Vitest + Supertest | `npm test` |
| Interface du backoffice | `backoffice/client` | Vitest + Testing Library | `npm test` |
| App mobile (unitaires) | `frontend` | jest-expo + React Native Testing Library | `npm test` |
| Parcours E2E (app web + backoffice) | `e2e` | Playwright | `npm test` |

Depuis la racine : `npm run test:unit`, `npm run test:e2e`, ou `npm test` pour tout lancer.

## E2E

```bash
cd e2e
npm ci
npx playwright install chromium
npm test                 # les deux projets
npm run test:mobile      # app Expo, exportée pour le web, en viewport mobile
npm run test:backoffice  # backoffice Vite
npm run report           # rapport HTML du dernier passage
```

- Playwright exporte l'app Expo pour le web dans `frontend/dist-e2e`, la sert sur le port 8391, et lance le backoffice sur le port 5391.
- Pour réutiliser un export déjà fait : `E2E_SKIP_BUILD=1 npm test`. Il faut le refaire dès que le code de l'app change.
- Les faux serveurs sont dans `e2e/fixtures/` :
  - `supabaseMock.ts` : authentification et mini-PostgREST en mémoire ;
  - `apiMock.ts` : API du backoffice ;
  - `cezameData.ts` : leçon d'exemple et utilisateur déjà passé par l'onboarding.
- Les sélecteurs passent par les `testID` (app) et les `data-testid` (backoffice). Sur le web, react-native-web rend un `testID` sous la forme `data-testid`.
