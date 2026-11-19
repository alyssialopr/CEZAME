# 📊 Analyse Croisée : Retours Utilisateurs (24 réponses) × KPIs Backoffice — CEZAME

**Période de collecte :** du 6 novembre au 17 novembre 2026  
**Sources croisées :**  
1. **Déclaratif (Formulaire Tally)** : **24 répondants** (19 initiaux + 5 nouveaux les 16 et 17 novembre)  
2. **Comportemental (Backoffice Telemetry)** : **2 443 événements**, **27 testeurs** (25 ayant terminé l'onboarding), **170 lancements de leçons**

---

## 1. Vue d'ensemble : Tableau de Bord Croisé (Déclaratif vs Backoffice)

| Dimension | Indicateur Questionnaire (24 rép.) | Indicateur Backoffice (Télémétrie) | Lecture & Convergence |
| :--- | :--- | :--- | :--- |
| **Adoption & Onboarding** | **100 % OK** sur `ONB-01` et `ONB-02` (19/19 testés) | **93 % de complétion** (`25 / 27` ont terminé le bilan) | Excellente entrée en matière, quasi aucun décrochage à l'onboarding. |
| **Satisfaction globale** | **4,33 / 5** ⭐ (dont **4,55 / 5** sur la cible novice/débutant) | **0 abandon** une fois le quiz démarré (`32 / 45` validés) | Le cœur ludique (quiz) engage fortement dès qu'on y entre. |
| **Recommandation (NPS)** | **7,88 / 10** (**NPS = +16,7** global · **+54,5** chez les débutants) | **1,1 leçon validée / testeur** en moyenne | Très fort chez les 18–24 ans débutants ; plus mitigé chez les +25 ans déjà autonomes. |
| **Durée & Format** | **62,5 % « Parfaite »** · 25 % « Trop courte » · 12,5 % « Trop longue » | **2,5 min** par leçon complète (cours + quiz) | Format micro-learning validé, mais les fiches texte initiales freinent avant le quiz. |
| **Point de friction #1** | Verbatims sur le **quiz d'ordre chronologique** & les **pavés de texte** | **`ORDER` = 36 % de réussite** (`12/33`) et **26 % de passage Théorie → Quiz** | **Corrélation à 100 %** entre le ressenti déclaré et les métriques BO. |

---

## 2. Les 5 Enseignements Majeurs du Croisement BO × Retours Utilisateurs

### 🔴 Enseignement #1 : L'exercice `ORDER` (Ordre chronologique) était le goulet d'étranglement absolu
- **Ce que dit le Backoffice :**
  - Alors que les exercices **SCENARIO (100 %)**, **SCAM (95 %)** et **QCM (89 %)** affichent d'excellents taux de réussite, le type **ORDER chute à 36 % (`12 / 33`)**.
  - **100 % du Top 5 des « Questions Pièges »** les plus échouées de l'application sont des questions de type `ORDER` :
    1. *Étapes du jour de l'emménagement* (Logement) — **4 erreurs (100 % d'échec)**
    2. *Étapes pour préparer sa situation fiscale* (Administration) — **4 erreurs (100 % d'échec)**
    3. *Étapes pour ouvrir son premier compte bancaire* (Finance) — **3 erreurs (100 % d'échec)**
    4. *Étapes pour activer son compte Ameli* (Santé) — **3 erreurs (100 % d'échec)**
    5. *Étapes pour obtenir la garantie Visale* (Logement) — **2 erreurs (100 % d'échec)**
- **Ce que disent les utilisateurs :**
  - Alexandre (*« quiz où il faut ordonner les réponses »*) et les retours qualitatifs précédents pointaient le manque de lisibilité chronologique et la lourdeur des flèches haut/bas.
- **Impact produit :**
  - La refonte déployée sur [`OrderExercise.tsx`](file:///e:/Cours/PIE/MVP/CEZAME/frontend/src/components/exercises/OrderExercise.tsx) (repère visuel `1. Première étape → N. Dernière étape` dès le départ, rail chronologique continu, **Drag & Drop** et **Tap-to-Swap**) cible exactement la cause n°1 d'échec mesurée par le BO.

---

### 🟠 Enseignement #2 : L'entonnoir Théorie → Quiz (`26 %`) expliqué par les « pavés de texte » (et un doublon de tracking)
- **Ce que dit le Backoffice :**
  - **170** `lesson_started` → **45** `quiz_started` (**26 %**) → **32** `lesson_completed` (**71 % des quiz démarrés**).
  - **11 abandons explicites** ont lieu **pendant la lecture des fiches théoriques**, contre **0 abandon pendant le quiz** !
- **Ce que disent les nouveaux retours (16–17 nov.) :**
  - **Thomas** : *« Un pavé de texte sur créer un compte bancaire c'est pas marrant »*.
  - **Anthony (#23)** : À améliorer en priorité : *« La longueur des textes »* (dans les fiches de cours).
  - **Jan (#21)** : *« Le côté ludique à la Duolingo [plaît], mais les exercices sont peut-être trop courts »* (par rapport à la lecture préalable).
- **Double explication (UX + Technique) :**
  1. **Facteur UX** : L'utilisateur veut agir rapidement. Lire 3 ou 4 cartes de texte dense avant la première interaction crée de l'impatience, alors qu'une fois dans le quiz, **0 utilisateur n'abandonne**. Découper ou raccourcir les fiches théoriques (ou alterner 1 fiche = 1 question) augmentera fortement la conversion.
  2. **Facteur Technique (Tracking BO)** : Dans le code actuel, l'événement `lesson_started` est envoyé **à la fois** à l'ouverture de [`lesson-content.tsx`](file:///e:/Cours/PIE/MVP/CEZAME/frontend/src/app/(private)/lesson-content.tsx) **et** à l'ouverture de [`lesson.tsx`](file:///e:/Cours/PIE/MVP/CEZAME/frontend/src/app/(private)/lesson.tsx), ainsi qu'à chaque rafraîchissement des données de la leçon. Cela gonfle artificiellement le compteur « 1. Leçon Démarrée (170) » par rapport à « 2. Quiz Démarré (45) ».

---

### 🟡 Enseignement #3 : Intérêt par Thématique — Déclaratif vs Comportement Réel en App

| Thématique | Intentions Déclarées (Formulaire - 24 rép.) | Interactions Réelles (Backoffice - 190 clics) | Analyse de l'écart |
| :--- | :---: | :---: | :--- |
| 🏠 **Logement** | **#1 — 58,3 %** *(14 votes)* | **#1 — 32 %** *(60 interactions · 1er choix de 10 testeurs)* | **Locomotive incontestée** de l'app, en déclaratif comme en usage réel. |
| 📄 **Administration** | **#2 ex-æquo — 50,0 %** *(12 votes)* | **#3 — 23 %** *(44 interactions)* | Forte demande (impôts, CAF, papiers), bien explorée dans l'app. |
| 💰 **Finance** | **#2 ex-æquo — 50,0 %** *(12 votes)* | **#4 — 13 %** *(24 interactions)* | **Sous-consommé dans l'app (13 %) malgré 50 % d'intérêt !** Rejoint la remarque de Tom : *« Mettre plus en valeur les autres secteurs »*. |
| 🏥 **Santé** | **#4 — 29,2 %** *(7 votes)* | **#2 — 25 %** *(47 interactions)* | Sur-représenté dans les clics BO car c'est le thème fallback par défaut et le plus fourni (12 leçons). |
| 🚗 **Voiture** | **#5 — 16,7 %** *(4 votes)* | **#5 — 8 %** *(15 interactions)* | Thème de niche, pertinent au moment du permis ou de l'achat d'un 1er véhicule. |

---

### 🟢 Enseignement #4 : Segmentation nette entre la cible « Novice (18–24 ans) » et les « Déjà autonomes (24+ ans) »
L'ajout des 5 derniers répondants (*tristan, Jan, Leo, Anthony, Thomas*) met en lumière un contraste très instructif selon la maturité administrative :

| Segment de testeurs | Effectif | Note Globale (/5) | Utilité perçue (« Oui bcp » / « Un peu ») | Recommandation (/10) |
| :--- | :---: | :---: | :---: | :---: |
| **Cible cœur : Débutants / En cours** *(« Je commence » ou « Jamais occupé »)* | **11 testeurs** | **4,55 / 5** ⭐ | **100 % utile** *(73 % « Oui, beaucoup » · 27 % « Un peu »)* | **8,55 / 10** |
| **Déjà autonomes** *(« Je gère déjà la plupart de mes démarches seul·e »)* | **13 testeurs** | **4,15 / 5** | **61,5 % utile** *(38,5 % « Pas vraiment »)* | **7,31 / 10** |

- **Verbatims clés :**
  - **Anaé** : *« Des informations pratiques et accessibles pour tous, sans doute plus utile pour les très jeunes étudiants (autour de 18 ans) »*.
  - **Thomas (déjà autonome)** : *« Généralement tu viens pour apprendre un truc précis j'ai l'impression plus que pour avoir la connaissance ultime de toute l'administration FR »*.
- **Opportunité Produit** : Proposer, à côté du parcours gamifié linéaire (idéal pour les 18–22 ans), un **mode « Guide / Recherche rapide par démarche + Liens officiels »** pour ceux qui cherchent une réponse immédiate à un problème précis.

---

## 3. Focus sur les 5 Nouveaux Retours (16 – 17 novembre 2026)

| # | Date | Prénom | Appareil | Âge | Profil | Utilité | Thèmes | Longueur | Note | Reco | Retours Qualitatifs (Aimé / À améliorer) |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **20** | 16/11 11:15 | **tristan** | iPhone 15 Pro | > 25 | Gère seul | Pas vraiment | Finance, Admin | Parfaite | **4/5** | **6/10** | **+** *« C'est fluide, l'affichage est ergonomique et responsive »* |
| **21** | 16/11 13:48 | **Jan** | Samsung ZFlip 7 | > 25 | Gère seul | Un peu | Admin, Finance, Logement | Trop courte | **4/5** | **8/10** | **+** *« Le côté ludique à la Duolingo »* · **−** *« Les exercices sont peut-être trop courts »* |
| **22** | 17/11 10:21 | **Leo** | Web | 22-25 | Gère seul | Pas vraiment | Finance, Admin, Logement | Parfaite | **4/5** | **6/10** | — |
| **23** | 17/11 11:04 | **Anthony** | Web | 22-25 | Jamais occupé | Un peu | Tous les 5 | Trop longue | **4/5** | **5/10** | **+** *« Le pigeon [la mascotte] »* · **−** *« La longueur des textes »* |
| **24** | 17/11 11:11 | **Thomas** | Web | 22-25 | Gère seul | Pas vraiment | Finance, Logement | Parfaite | **3/5** | **3/10** | **+** *« Le toucan il est cool, bonne copie de Duolingo »* · **−** *« Un pavé de texte sur créer un compte bancaire c'est pas marrant. On vient souvent pour apprendre un truc précis. »* |

---

## 4. Plan d'Action Priorisé (Basé sur BO + 24 Retours)

1. ✅ **Corriger l'ergonomie des exercices `ORDER` (36 % de réussite dans le BO)** — **Déjà fait** :
   - Ajout de la frise chronologique numérotée dès le départ, du Drag & Drop et du Tap-to-Swap + bouton *« Voir la leçon »* pendant le quiz pour consulter la fiche mémo sans perdre ses vies.
2. 🎯 **Optimiser le passage Théorie → Quiz (actuellement 26 % dans le BO)** :
   - **Alléger les fiches théoriques** : remplacer les « pavés de texte » par des listes à puces visuelles de 2–3 points clés maximum par écran.
   - **Corriger le double comptage de `lesson_started`** : ne déclencher `lesson_started` qu'une seule fois dans `lesson-content.tsx` (et non une seconde fois à l'entrée dans `lesson.tsx`).
3. 🔗 **Créer un accès rapide « Fiches & Liens Utiles » (Demande récurrente de Victor, Clément, Anaé, Thomas)** :
   - Ajouter les liens directs vers les sites officiels (`ameli.fr`, `caf.fr`, `impots.gouv.fr`, `visale.fr`, `ants.gouv.fr`) sur les écrans de leçons et dans un onglet/bibliothèque consultable à la demande sans devoir refaire tout le parcours.
4. 📚 **Enrichir les thématiques à forte demande déclarée mais sous-représentées en clics** :
   - **Finance (50 % d'intérêt vs 13 % des clics)** et **Vie pro / Travail** (lire une fiche de paie, contrat de travail, RTT/CP, aides CAF, déclaration d'impôts).
