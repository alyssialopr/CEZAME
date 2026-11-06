# CEZAME Backoffice Web Application 🚀

Application d'administration complète pour le backend Supabase de CEZAME développée en **React.js** et **Node.js**.

---

## 🌟 Fonctionnalités Incluses

1. **Authentification & Rôles (RBAC)** :
   - Accès strictement réservé aux comptes autorisés (`admin` et `superadmin`).
   - Les **Superadmins** peuvent créer et gérer les comptes des autres administrateurs.
   - Système de premier bootstrap pour initialiser le tout premier Superadmin en un clic.

2. **CRUD Pédagogique Complet** :
   - **Catégories** : création dynamique avec couleur, bordure et icône.
   - **Unités** : structuration par catégorie avec ordre d'affichage.
   - **Leçons** : paramétrage de la récompense XP, statut **Brouillon / Publié**.
   - **Fiches de cours** : rédaction assistée avec bloc réflexe / astuce ("tip").
   - **Questions de quiz** : options dynamiques A, B, C, choix de la bonne réponse, explication pédagogique.

3. **Simulateur Mobile en Direct (Phone Live Preview)** :
   - Visualisation synchrone de chaque fiche et question dans un smartphone virtuel stylisé aux couleurs de CEZAME pendant la frappe.

4. **Glisser-Déposer (Drag & Drop)** :
   - Réordonnancement interactif des fiches d'une leçon et des questions d'un quiz.

5. **Import & Export JSON** :
   - Exporter ou importer une leçon complète avec toutes ses fiches et questions d'un simple clic.

6. **Gestion des Utilisateurs Mobiles** :
   - Consultation des comptes, progression détaillée, leçons validées et suppression sécurisée avec dialogue de confirmation.

7. **Dashboard Analytique & Journal d'Audit** :
   - Indicateurs clés (KPIs), graphiques de répartition par catégorie et historique de toutes les actions administratives.

---

## 📦 Structure du Dossier

```
backoffice/
├── server/       # API Express + Supabase Admin SDK
│   ├── src/
│   │   ├── config/      # Configuration & Client Supabase Admin
│   │   ├── middleware/  # Auth JWT, Guards RBAC, Audit
│   │   └── routes/      # Endpoints REST (auth, stats, users, content, admins, audit)
│   └── .env
└── client/       # Webapp React (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/  # Layout, PhonePreview, Modals, ConfirmDialog
    │   ├── pages/       # Dashboard, Categories, LessonEditor, Users, Admins, AuditLogs
    │   └── contexts/    # AuthContext
    └── .env
```

---

## ⚡ Installation & Démarrage Rapide

### 1. Appliquer la migration SQL dans Supabase
Exécutez le script SQL situé dans :
👉 `supabase/migrations/20260914_backoffice_schema.sql`
dans le **SQL Editor** de votre console Supabase.

### 2. Installer les dépendances
À la racine de `backoffice/` :
```bash
cd backoffice
npm run install:all
```
*(Ou manuellement : `cd server && npm install`, puis `cd ../client && npm install`)*

### 3. Configurer les variables d'environnement
- Dans `backoffice/server/.env` :
  - `SUPABASE_SERVICE_ROLE_KEY` : copiez la clé secrète **service_role** disponible sur votre tableau de bord Supabase (*Settings -> API -> Project API keys -> service_role*).
- Dans `backoffice/client/.env` :
  - Déjà configuré par défaut pour pointer vers le serveur local.

### 4. Lancer le Backoffice
À la racine de `backoffice/` :
```bash
npm run dev
```
- Le serveur Node.js démarre sur : **http://localhost:4000**
- Le client React démarre sur : **http://localhost:5173**

Ouvrez simplement **http://localhost:5173** dans votre navigateur !

### 5. Lancer les tests
```bash
cd server && npm test   # API : Vitest + Supertest, Supabase simulé
cd ../client && npm test  # interface : Vitest + Testing Library
```
Les parcours end-to-end sont dans `e2e/` à la racine du dépôt (voir `TESTING.md`).
