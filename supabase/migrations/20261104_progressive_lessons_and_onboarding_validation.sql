-- ====================================================================
-- MIGRATION: Leçons et Unités Progressives & Validation Onboarding
-- Ordre logique de vie, structure pédagogique en 5 étapes par leçon
-- et validation automatique des étapes déjà maîtrisées par l'utilisateur.
-- ====================================================================

-- 1. Mise à jour de la contrainte CHECK sur lesson_questions.type
DO $$
DECLARE
  c_name TEXT;
BEGIN
  -- Vérifier ou ajouter la colonne 'type' si nécessaire
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lesson_questions'
      AND column_name = 'type'
  ) THEN
    ALTER TABLE public.lesson_questions
    ADD COLUMN type TEXT NOT NULL DEFAULT 'qcm';
  END IF;

  -- Trouver et supprimer l'ancienne contrainte CHECK sur 'type'
  SELECT con.conname INTO c_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
  WHERE con.conrelid = 'public.lesson_questions'::regclass
    AND att.attname = 'type'
    AND con.contype = 'c';

  IF c_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.lesson_questions DROP CONSTRAINT ' || quote_ident(c_name);
  END IF;

  -- Ajouter la contrainte complète avec tous les types d'exercices
  ALTER TABLE public.lesson_questions
  ADD CONSTRAINT lesson_questions_type_check
  CHECK (type IN ('qcm', 'order', 'matching', 'document', 'bucket', 'scam', 'scenario'));
END $$;

-- 2. Nettoyage complet des anciennes leçons et unités
DELETE FROM public.lesson_questions;
DELETE FROM public.lesson_screens;
DELETE FROM public.user_lesson_progress;
DELETE FROM public.lessons;
DELETE FROM public.units;

-- 3. Peuplement des Unités et Leçons pour chaque catégorie
DO $$
DECLARE
  -- FINANCE
  u_fin_1 UUID; u_fin_2 UUID; u_fin_3 UUID;
  l_fin_1 UUID; l_fin_2 UUID; l_fin_3 UUID;

  -- SANTÉ
  u_san_1 UUID; u_san_2 UUID; u_san_3 UUID;
  l_san_1 UUID; l_san_2 UUID; l_san_3 UUID;

  -- VOITURE
  u_voi_1 UUID; u_voi_2 UUID; u_voi_3 UUID;
  l_voi_1 UUID; l_voi_2 UUID; l_voi_3 UUID;

  -- ADMINISTRATION
  u_adm_1 UUID; u_adm_2 UUID; u_adm_3 UUID;
  l_adm_1 UUID; l_adm_2 UUID; l_adm_3 UUID;

  -- LOGEMENT
  u_log_1 UUID; u_log_2 UUID; u_log_3 UUID;
  l_log_1 UUID; l_log_2 UUID; l_log_3 UUID;

BEGIN

  -- ==================================================================
  -- 1. FINANCE : Le compte bancaire -> Gérer son budget -> Épargner
  -- ==================================================================

  -- Unité 1 : Le Compte Bancaire & le RIB
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('finance', 1, 'Unité 1 : Le Compte & le RIB', 'Ouvrir son premier compte et comprendre ses coordonnées', 'RicoEntrepriseDroit', 1)
  RETURNING id INTO u_fin_1;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_fin_1, 'finance', 1, 'Ouvrir son compte bancaire & comprendre son RIB', 50, 'published')
  RETURNING id INTO l_fin_1;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_fin_1, 1,
    'Ton compte bancaire et ton identité financière',
    'Pour être autonome, ton compte courant est indispensable : il reçoit tes salaires, bourses et aides, et sert à régler tes dépenses quotidiennes. Pour l''ouvrir, la loi exige une pièce d''identité en cours de validité et un justificatif de domicile récent. Ton RIB (Relevé d''Identité Bancaire) contient ton IBAN : c''est l''adresse officielle de ton compte que tu transmets sans danger pour recevoir des virements ou autoriser des prélèvements récurrents.',
    'Ton RIB permet de te verser de l''argent ou d''en prélever si tu as signé un mandat. En revanche, ne donne JAMAIS les 16 chiffres de ta carte bancaire ni ton mot de passe !'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_1, 1, 'qcm', 'Ouvrir son compte',
    'Parmi ces documents, lequel est obligatoirement exigé pour ouvrir un compte bancaire en France ?',
    '[
      {"letter": "A", "text": "Une pièce d''identité officielle en cours de validité (CNI ou passeport)", "correct": true},
      {"letter": "B", "text": "Un diplôme universitaire ou relevé de notes du baccalauréat"},
      {"letter": "C", "text": "Une attestation d''assurance automobile"}
    ]'::jsonb,
    'La loi exige obligatoirement une pièce d''identité officielle et un justificatif de domicile pour ouvrir tout compte bancaire.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_1, 2, 'matching', 'Vocabulaire bancaire',
    'Associe chaque terme bancaire à sa définition exacte :',
    '[
      {"id": "1", "left": "RIB / IBAN", "right": "Identifiant officiel pour virements et salaires"},
      {"id": "2", "left": "Prélèvement SEPA", "right": "Débit automatique récurrent qu''on peut révoquer"},
      {"id": "3", "left": "Droit au compte", "right": "Procédure Banque de France si refus des banques"},
      {"id": "4", "left": "Compte courant", "right": "Compte de dépôt pour les opérations quotidiennes"}
    ]'::jsonb,
    'Parfait ! Le RIB identifie ton compte sans jamais donner accès direct à tes fonds.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_1, 3, 'order', 'Démarche d''ouverture',
    'Remets dans le bon ordre chronologique les étapes pour ouvrir ton premier compte bancaire :',
    '[
      {"id": "1", "text": "Rassembler ses justificatifs officiels (pièce d''identité, justificatif de domicile)"},
      {"id": "2", "text": "Comparer les offres bancaires (frais de carte, agence physique ou banque en ligne)"},
      {"id": "3", "text": "Signer la convention de compte (en agence ou par signature électronique)"},
      {"id": "4", "text": "Activer sa carte bancaire et télécharger son RIB depuis son espace sécurisé"}
    ]'::jsonb,
    'En réunissant vos pièces au préalable, l''ouverture d''un compte bancaire ne prend que quelques minutes.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_1, 4, 'scam', 'Sécurité bancaire',
    'Tu reçois ce SMS d''alerte sur ton téléphone portable. D''après toi, arnaque ou authentique ?',
    '{
      "sender": "Alerte-Banque (+33 6 42 98 17 50)",
      "channel": "sms",
      "message": "ALERTE SÉCURITÉ : Un débit suspect de 380,00 € est en attente. Si vous n''êtes pas à l''origine de cet achat, annulez-le immédiatement ici : https://espace-banque-opposition-securisee.fr",
      "isScam": true,
      "redFlags": [
        "Une banque ne demande JAMAIS d''annuler une opération via un lien par SMS",
        "Le message provient d''un numéro mobile personnel en 06/07",
        "L''adresse URL redirige vers un faux site pirate destiné à voler vos accès"
      ]
    }'::jsonb,
    'C''est l''arnaque au faux conseiller / débit frauduleux. Votre banque ne vous transmet jamais de lien pour annuler une fraude. Connectez-vous toujours directement via votre application officielle.'
  );

  -- Unité 2 : Gérer son Budget & ses Revenus
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('finance', 2, 'Unité 2 : Budget & Revenus', 'Fiches de paie, charges fixes et maîtrise du découvert', 'RicoEntrepriseDroit', 2)
  RETURNING id INTO u_fin_2;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_fin_2, 'finance', 2, 'Gérer ses revenus, ses dépenses et éviter le découvert', 50, 'published')
  RETURNING id INTO l_fin_2;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_fin_2, 1,
    'Comprendre sa paie et anticiper ses dépenses',
    'Lorsque tu travailles, ta fiche de paie distingue le salaire brut (avant cotisations) et le salaire net (ce qui est réellement viré sur ton compte). Dès que ta paie arrive, règle en priorité tes charges fixes incompressibles (loyer, assurances, factures, abonnements). L''argent qui reste constitue ton « reste à vivre » pour les courses et sorties. Être à découvert n''est pas de l''argent en cadeau : c''est une dette soumise à des agios très élevés. Si tu dépasses ton autorisation, les paiements peuvent être rejetés avec de lourds frais.',
    'Active les notifications sur ton application bancaire pour recevoir une alerte dès que ton solde passe en dessous de 50 €.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_2, 1, 'qcm', 'Comprendre ses revenus',
    'Quelle est la différence essentielle entre salaire brut et salaire net sur ton bulletin de paie ?',
    '[
      {"letter": "A", "text": "Le salaire net est le montant perçu sur ton compte après déduction des cotisations sociales", "correct": true},
      {"letter": "B", "text": "Le salaire brut est le montant exact versé chaque mois sur ton compte bancaire"},
      {"letter": "C", "text": "Il n''y a aucune différence, ce sont deux termes désignant exactement la même somme"}
    ]'::jsonb,
    'Le salaire net correspond au salaire brut duquel sont retranchées les cotisations sociales (retraite, chômage, santé).'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_2, 2, 'matching', 'Notions budgétaires',
    'Associe chaque notion financière à sa réalité concrète :',
    '[
      {"id": "1", "left": "Salaire Net", "right": "Montant réel viré sur ton compte bancaire"},
      {"id": "2", "left": "Charges fixes", "right": "Dépenses indispensables récurrentes (loyer, assurance)"},
      {"id": "3", "left": "Agios bancaires", "right": "Intérêts et frais facturés en cas de solde négatif"},
      {"id": "4", "left": "Reste à vivre", "right": "Somme disponible après paiement des dépenses fixes"}
    ]'::jsonb,
    'Excellent ! Connaître son reste à vivre permet de planifier ses dépenses sans risque d''agios.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_2, 3, 'order', 'Routine budgétaire',
    'Remets dans le bon ordre chronologique la gestion de tes finances chaque début de mois :',
    '[
      {"id": "1", "text": "Vérifier la réception de son salaire net ou de sa bourse sur son compte"},
      {"id": "2", "text": "Payer en priorité ses charges fixes obligatoires (loyer, factures, assurances)"},
      {"id": "3", "text": "Définir l''enveloppe dédiée aux besoins vitaux (courses alimentaires, transports)"},
      {"id": "4", "text": "Allouer le solde restant entre loisirs plaisirs et épargne de précaution"}
    ]'::jsonb,
    'Payer ses charges prioritaires dès le versement du salaire évite tout risque d''impayé ou de découvert.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_2, 4, 'scenario', 'Cas pratique budget',
    'Aide Maxime à résoudre son imprévu financier de fin de mois.',
    '{
      "context": "Maxime, 20 ans, est étudiant salarié. Il lui reste 40 € sur son compte bancaire alors que son salaire n''arrive que dans 8 jours. Une facture d''électricité de 60 € doit être prélevée dans 48h.",
      "persona": {"name": "Maxime", "role": "Étudiant salarié 20 ans"},
      "keyFacts": [
        {"label": "Solde actuel", "value": "40 €"},
        {"label": "Facture énergie", "value": "60 €"},
        {"label": "Délai paie", "value": "8 jours"}
      ],
      "options": [
        {
          "id": "opt1",
          "text": "Contacter immédiatement son fournisseur d''électricité pour demander un report d''échéance de 10 jours sans frais",
          "correct": true,
          "consequence": "Super décision ! Les fournisseurs acceptent volontiers de décaler une date de prélèvement si on prévient avant l''échéance, évitant tout agio bancaire."
        },
        {
          "id": "opt2",
          "text": "Laisser le prélèvement passer et subir 20 € de frais de rejet bancaire",
          "correct": false,
          "consequence": "Mauvais choix : le prélèvement sera rejeté avec de lourds frais bancaires et la facture restera due."
        },
        {
          "id": "opt3",
          "text": "Souscrire un mini-prêt instantané à 20% d''intérêts sur Internet",
          "correct": false,
          "consequence": "Piège dangereux : les mini-prêts express en ligne ont des taux prohibitifs qui aggravent l''endettement."
        }
      ]
    }'::jsonb,
    'Anticiper et communiquer avec ses créanciers avant la date du prélèvement évite les frais de rejet et le surendettement.'
  );

  -- Unité 3 : Épargne & Projets d'Avenir
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('finance', 3, 'Unité 3 : Épargne & Projets', 'Livret A, LEP et constitution d''un matelas de sécurité', 'RicoEntrepriseDroit', 3)
  RETURNING id INTO u_fin_3;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_fin_3, 'finance', 3, 'Construire son épargne de sécurité & livrets d''État', 50, 'published')
  RETURNING id INTO l_fin_3;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_fin_3, 1,
    'Mettre de côté sans risque pour ses projets',
    'L''épargne n''est pas réservée aux personnes fortunées : mettre 20 € ou 50 € de côté chaque mois fait une énorme différence au bout d''un an ! La première étape est le « matelas de sécurité » (l''équivalent de 2 à 3 mois de dépenses) pour faire face aux imprévus sans stress (ordinateur cassé, caution d''appartement). En France, privilégie les livrets d''épargne réglementés par l''État : le Livret A (sans risque, disponible à tout moment, 0 impôt) et surtout le LEP (Livret d''Épargne Populaire) qui offre un taux boosté si tu as des revenus modestes ou es étudiant indépendant.',
    'Règle d''or : programme un virement automatique vers ton livret le lendemain de ta paie (« paie-toi en premier »).'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_3, 1, 'qcm', 'Livrets d''épargne',
    'Quel est le principal avantage du Livret A pour un jeune adulte ?',
    '[
      {"letter": "A", "text": "L''argent est 100% garanti par l''État, disponible à tout instant et totalement exonéré d''impôt", "correct": true},
      {"letter": "B", "text": "L''argent est bloqué pendant 10 ans sans aucune possibilité de retrait"},
      {"letter": "C", "text": "Il rapporte 25% d''intérêts garantis chaque mois sans risque"}
    ]'::jsonb,
    'Le Livret A est totalement garanti par l''État, sans frais, disponible à tout moment et net d''impôt.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_3, 2, 'matching', 'Solutions d''épargne',
    'Associe chaque dispositif d''épargne à sa caractéristique principale :',
    '[
      {"id": "1", "left": "Livret A", "right": "Épargne sécurisée sans impôt plafonnée à 22 950 €"},
      {"id": "2", "left": "LEP", "right": "Taux boosté pour les étudiants et revenus modestes"},
      {"id": "3", "left": "Règle 50/30/20", "right": "50% Besoins, 30% Loisirs, 20% Épargne"},
      {"id": "4", "left": "Matelas d''urgence", "right": "2 à 3 mois de charges de sécurité pour les pépins"}
    ]'::jsonb,
    'Bravo ! En combinant livret réglementé et règle 50/30/20, ton épargne grandit en toute sérénité.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_3, 3, 'order', 'Stratégie d''épargne',
    'Remets dans le bon ordre chronologique les étapes pour bâtir son épargne :',
    '[
      {"id": "1", "text": "Équilibrer son budget mensuel sans être à découvert"},
      {"id": "2", "text": "Ouvrir un Livret A ou un LEP dans son établissement bancaire"},
      {"id": "3", "text": "Programmer un virement automatique mensuel dès le versement de sa paie"},
      {"id": "4", "text": "Constituer son fonds d''urgence de 2 à 3 mois avant d''investir à long terme"}
    ]'::jsonb,
    'Automatiser son épargne dès le début de mois permet d''épargner régulièrement sans y penser.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_fin_3, 4, 'scam', 'Arnaques financières',
    'Tu tombes sur cette offre sponsorisée sur un réseau social. Arnaque ou opportunité ?',
    '{
      "sender": "Trading-Crypto-Elite (@crypto_fortune_france)",
      "channel": "email",
      "message": "OFFRE JEUNES ACTIFS : Dépose 200 € sur notre bot de trading IA automatisé et obtiens 1 800 € garantis sous 7 jours sans aucun risque ! Déjà 3 000 jeunes devenus rentiers. Rejoins le canal Telegram vip.",
      "isScam": true,
      "redFlags": [
        "La promesse de gains mirobolants rapides et garantis n''existe pas en finance",
        "Le terme « sans aucun risque » est l''indice absolu d''une escroquerie",
        "L''incitation à envoyer des fonds vers un canal privé ou plateforme non régulée"
      ]
    }'::jsonb,
    'C''est une escroquerie financière classique (système pyramidal ou faux investissement). En économie, rendement élevé rime toujours avec risque élevé. Méfiez-vous de toute promesse d''argent facile.'
  );


  -- ==================================================================
  -- 2. SANTÉ : Compte Ameli -> Carte Vitale & Médecin -> Mutuelle
  -- ==================================================================

  -- Unité 1 : S'affilier à la Sécu & Créer son compte Ameli
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('sante', 1, 'Unité 1 : Affiliation & Ameli', 'Droits d''Assurance Maladie et espace officiel en ligne', 'RicoDocteur', 1)
  RETURNING id INTO u_san_1;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_san_1, 'sante', 1, 'Activer ses droits Sécu & créer son compte Ameli', 50, 'published')
  RETURNING id INTO l_san_1;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_san_1, 1,
    'La Sécu et ton compte en ligne Ameli',
    'En France, l''Assurance Maladie (la Sécurité sociale via la CPAM) rembourse la majeure partie de tes frais de santé (consultations, médicaments, hospitalisation). Ton numéro de Sécurité sociale (NIR à 15 chiffres) est ton identifiant unique à vie. Ton compte en ligne sur ameli.fr est le centre de contrôle de ta santé : tu y suis tes remboursements en temps réel, télécharges ton attestation de droits et commandes tes documents de santé.',
    'L''attestation de droits prouve ton affiliation à la Sécu. Tu peux la télécharger en PDF en 1 clic sur ton compte Ameli.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_1, 1, 'qcm', 'Rôle d''Ameli',
    'À quoi sert principalement ton compte personnel sur ameli.fr ?',
    '[
      {"letter": "A", "text": "Suivre ses remboursements de soins, télécharger ses attestations et gérer ses démarches", "correct": true},
      {"letter": "B", "text": "Payer obligatoirement une cotisation mensuelle pour avoir le droit d''être soigné"},
      {"letter": "C", "text": "Acheter des médicaments sans ordonnance médicale"}
    ]'::jsonb,
    'Ameli.fr est le portail officiel gratuit de l''Assurance Maladie pour gérer ses remboursements et attestations.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_1, 2, 'matching', 'Acteurs de santé',
    'Associe chaque sigle ou document de santé à sa fonction exacte :',
    '[
      {"id": "1", "left": "CPAM", "right": "Caisse Primaire d''Assurance Maladie locale"},
      {"id": "2", "left": "Ameli.fr", "right": "Portail web et appli pour gérer ses droits Sécu"},
      {"id": "3", "left": "Numéro NIR", "right": "Numéro de Sécurité sociale à 15 chiffres"},
      {"id": "4", "left": "Attestation de droits", "right": "Document papier justifiant de ta couverture maladie"}
    ]'::jsonb,
    'Parfait ! Ces fondamentaux te permettent de faire toutes tes formalités sans confusion.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_1, 3, 'order', 'Création compte Ameli',
    'Remets dans le bon ordre chronologique les étapes pour activer son compte Ameli :',
    '[
      {"id": "1", "text": "Se munir de son numéro de Sécurité sociale provisoire ou définitif"},
      {"id": "2", "text": "Se rendre sur ameli.fr ou l''application mobile Ameli (ou FranceConnect)"},
      {"id": "3", "text": "Renseigner son RIB bancaire pour recevoir directement les remboursements"},
      {"id": "4", "text": "Définir son mot de passe sécurisé et télécharger son attestation de droits"}
    ]'::jsonb,
    'Une fois le compte activé avec ton RIB, tes remboursements arriveront automatiquement sur ton compte bancaire.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_1, 4, 'scam', 'Arnaque dossier Sécu',
    'Tu reçois cet e-mail urgent concernant ton dossier d''assurance maladie. Arnaque ou message officiel ?',
    '{
      "sender": "Service-Ameli <gestion-dossier@securite-sociale-mise-a-jour.com>",
      "channel": "email",
      "message": "Dossier Médical : Suite à la mise à jour de nos serveurs, vos droits Sécurité sociale sont suspendus. Veuillez confirmer vos coordonnées et régler 1,80 € de frais de traitement sous 48h sur le lien ci-dessous pour maintenir vos remboursements.",
      "isScam": true,
      "redFlags": [
        "L''Assurance Maladie ne suspend jamais les droits avec demande de paiement par e-mail",
        "L''adresse de l''expéditeur ne se termine pas par le domaine officiel « @assurance-maladie.fr »",
        "La Sécurité sociale ne facture aucun frais de traitement ou de mise à jour de dossier"
      ]
    }'::jsonb,
    'L''Assurance Maladie ne facture jamais la mise à jour de votre dossier. Ne cliquez jamais sur ces liens et supprimez le message.'
  );

  -- Unité 2 : Obtenir sa Carte Vitale & déclarer son médecin traitant
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('sante', 2, 'Unité 2 : Carte Vitale & Médecin', 'Le parcours de soins coordonnés et la télétransmission', 'RicoDocteur', 2)
  RETURNING id INTO u_san_2;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_san_2, 'sante', 2, 'Obtenir sa Carte Vitale & déclarer son médecin traitant', 50, 'published')
  RETURNING id INTO l_san_2;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_san_2, 1,
    'La Carte Vitale et le parcours de soins',
    'Ta Carte Vitale est 100% gratuite : elle contient électroniquement tes droits d''assurance maladie. Tu la présentes chez le médecin, à la pharmacie ou à l''hôpital pour bénéficier de la télétransmission automatique. Déclarer un « médecin traitant » est essentiel : il coordonne tes soins et te garantit d''être remboursé à 70% par la Sécu. Sans médecin traitant déclaré, la Sécu ne te rembourse qu''à 30% ! La déclaration se fait directement chez le médecin avec ta carte Vitale en 2 minutes.',
    'Mets à jour ta Carte Vitale une fois par an sur les bornes vertes disponibles dans toutes les pharmacies.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_2, 1, 'qcm', 'Tarif carte Vitale',
    'Combien coûte la commande ou le renouvellement de sa Carte Vitale ?',
    '[
      {"letter": "A", "text": "Rien, la Carte Vitale est toujours 100% gratuite", "correct": true},
      {"letter": "B", "text": "Environ 25 € de frais de fabrication"},
      {"letter": "C", "text": "C''est payant à partir de l''âge de 20 ans"}
    ]'::jsonb,
    'La Carte Vitale est strictement gratuite. Tout message réclamant des frais de livraison est une tentative d''arnaque.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_2, 2, 'matching', 'Dispositifs de soins',
    'Associe chaque élément du parcours de soins à son rôle :',
    '[
      {"id": "1", "left": "Médecin traitant", "right": "Médecin référent assurant un remboursement à 70%"},
      {"id": "2", "left": "Carte Vitale", "right": "Télétransmet automatiquement la feuille de soins"},
      {"id": "3", "left": "Borne verte en pharmacie", "right": "Actualise les droits inscrits sur la puce"},
      {"id": "4", "left": "Tiers-payant", "right": "Dispense d''avancer les frais médicaux réglés par la Sécu"}
    ]'::jsonb,
    'Excellent ! Déclarer son médecin traitant prend 2 minutes en consultation et optimise tous tes remboursements.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_2, 3, 'order', 'Parcours de soins',
    'Remets dans le bon ordre les étapes pour déclarer son médecin traitant et consulter :',
    '[
      {"id": "1", "text": "Choisir son médecin généraliste de référence lors d''une première consultation"},
      {"id": "2", "text": "Lui présenter sa Carte Vitale et lui demander d''être son médecin traitant"},
      {"id": "3", "text": "Le médecin valide électroniquement la déclaration auprès de l''Assurance Maladie"},
      {"id": "4", "text": "Bénéficier automatiquement du taux de remboursement maximal (parcours de soins)"}
    ]'::jsonb,
    'Dans le parcours de soins, la Sécurité sociale rembourse 70% de la consultation (au lieu de 30% hors parcours).'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_2, 4, 'scam', 'Faux SMS Carte Vitale',
    'Tu reçois ce SMS sur ton smartphone. Arnaque ou message authentique ?',
    '{
      "sender": "Assurance-Maladie (+33 7 49 18 22 04)",
      "channel": "sms",
      "message": "Assurance Maladie : Votre nouvelle carte Vitale V3 est disponible. Veuillez confirmer vos coordonnées de livraison et vous acquitter des frais d''envoi (2,60 €) : https://ameli-portail-renouvellement.fr",
      "isScam": true,
      "redFlags": [
        "La carte Vitale est 100% gratuite (jamais de frais d''envoi facturés)",
        "Le message provient d''un 07 (numéro mobile personnel)",
        "L''Assurance Maladie n''utilise jamais d''URL non officielle en dehors de « ameli.fr »"
      ]
    }'::jsonb,
    'C''est l''arnaque la plus répandue en France. La carte Vitale ne se périme pas et ne nécessite aucun paiement.'
  );

  -- Unité 3 : Mutuelle Santé & Tiers Payant
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('sante', 3, 'Unité 3 : Mutuelle & Prise en Charge', 'Remboursements complets, mutuelle et Complémentaire Solidaire', 'RicoDocteur', 3)
  RETURNING id INTO u_san_3;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_san_3, 'sante', 3, 'La mutuelle complémentaire santé & la CSS', 50, 'published')
  RETURNING id INTO l_san_3;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_san_3, 1,
    'La mutuelle et la Complémentaire Santé Solidaire',
    'La Sécurité sociale ne rembourse jamais 100% de tes dépenses : la partie restante à ta charge s''appelle le « ticket modérateur ». C''est là qu''intervient la mutuelle (complémentaire santé) : elle complète la prise en charge pour les lunettes, soins dentaires, consultations spécialisées ou frais d''hôpital. Si tu es étudiant ou as des revenus modestes, tu peux avoir droit à la Complémentaire Santé Solidaire (CSS), une mutuelle 100% gratuite ou à moins de 1 € par jour attribuée par la CPAM.',
    'Vérifie que la télétransmission « NOEMIE » est activée entre ta Sécu et ta mutuelle pour être remboursé sans rien envoyer par la poste.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_3, 1, 'qcm', 'Rôle de la mutuelle',
    'À quoi sert une complémentaire santé (mutuelle) ?',
    '[
      {"letter": "A", "text": "Rembourser la part des dépenses médicales non couverte par la Sécurité sociale", "correct": true},
      {"letter": "B", "text": "Remplacer entièrement la carte Vitale auprès des professionnels"},
      {"letter": "C", "text": "Payer les amendes et infractions routières"}
    ]'::jsonb,
    'La Sécu rembourse une partie des soins, et la mutuelle prend en charge le reste à charge (ticket modérateur).'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_3, 2, 'matching', 'Notions de complémentaire',
    'Associe chaque terme de complémentaire santé à sa définition :',
    '[
      {"id": "1", "left": "Ticket modérateur", "right": "Part financière restant à ta charge après la Sécu"},
      {"id": "2", "left": "Mutuelle d''entreprise", "right": "Complémentaire collective financée à 50% par l''employeur"},
      {"id": "3", "left": "CSS (Santé Solidaire)", "right": "Mutuelle gratuite ou à 1€/j sous conditions de ressources"},
      {"id": "4", "left": "Télétransmission NOEMIE", "right": "Échange automatique de données entre la Sécu et ta mutuelle"}
    ]'::jsonb,
    'Parfait ! La Complémentaire Santé Solidaire (CSS) évite à des milliers de jeunes de renoncer à se soigner.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_3, 3, 'order', 'Remboursement mutuelle',
    'Remets dans le bon ordre chronologique les étapes pour être remboursé par sa mutuelle :',
    '[
      {"id": "1", "text": "Transmettre son attestation de droits Sécu et son RIB à sa mutuelle pour activer NOEMIE"},
      {"id": "2", "text": "Présenter sa Carte Vitale et sa carte de tiers-payant mutuelle en consultation"},
      {"id": "3", "text": "La CPAM télétransmet automatiquement le décompte de soins à la mutuelle"},
      {"id": "4", "text": "Recevoir le remboursement complémentaire directement sur son compte bancaire"}
    ]'::jsonb,
    'Grâce à la télétransmission, aucun formulaire papier n''est nécessaire pour être remboursé.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_san_3, 4, 'scenario', 'Cas pratique santé',
    'Aide Sarah à choisir la bonne démarche pour sa consultation médicale spécialisée.',
    '{
      "context": "Sarah a des douleurs dentaires persistantes. Le dentiste lui propose une couronne avec un devis de 500 €, dont 120 € remboursés par la Sécurité sociale. Elle ne sait pas si sa mutuelle va payer le reste.",
      "persona": {"name": "Sarah", "role": "Étudiante 19 ans"},
      "keyFacts": [
        {"label": "Coût soin", "value": "500 €"},
        {"label": "Prise en charge Sécu", "value": "120 €"},
        {"label": "Reste potentiel", "value": "380 €"}
      ],
      "options": [
        {
          "id": "s1",
          "text": "Demander un devis écrit au dentiste et l''envoyer à sa mutuelle avant de réaliser les soins pour connaître son reste à charge exact",
          "correct": true,
          "consequence": "Super réflexe ! Les mutuelles calculent la prise en charge sous 48h et le dentiste peut aussi proposer le panier « 100% Santé » sans aucun reste à charge."
        },
        {
          "id": "s2",
          "text": "Signer les soins immédiatement et attendre de voir sur son compte bancaire après",
          "correct": false,
          "consequence": "Risque financier : si ta mutuelle ne couvre pas les dépassements dentaires, tu devras payer les 380 € de ta poche."
        },
        {
          "id": "s3",
          "text": "Ne jamais soigner sa dent pour économiser de l''argent",
          "correct": false,
          "consequence": "Danger de santé : une infection dentaire non soignée peut entraîner de graves complications de santé."
        }
      ]
    }'::jsonb,
    'Toujours envoyer le devis de soins coûteux à sa mutuelle avant l''intervention pour éviter les mauvaises surprises financières.'
  );


  -- ==================================================================
  -- 3. VOITURE : Inscription ANTS -> Code de la route -> Permis & Assurance
  -- ==================================================================

  -- Unité 1 : Inscription ANTS & Numéro NEPH
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('voiture', 1, 'Unité 1 : Inscription ANTS & NEPH', 'La porte d''entrée officielle pour passer le permis', 'RicoBleuTravail', 1)
  RETURNING id INTO u_voi_1;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_voi_1, 'voiture', 1, 'S''inscrire sur l''ANTS et décrocher son numéro NEPH', 50, 'published')
  RETURNING id INTO l_voi_1;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_voi_1, 1,
    'L''ANTS et le fameux numéro NEPH',
    'En France, toutes les démarches de permis de conduire se font en ligne sur le site officiel de l''ANTS (Agence Nationale des Titres Sécurisés). Pour pouvoir passer l''examen du Code de la route ou du permis pratique (en auto-école ou en candidat libre), il faut obligatoirement obtenir son numéro NEPH (Numéro d''Enregistrement Préfectoral Harmonisé). Ce numéro à 12 chiffres est ton identifiant officiel unique à vie pour le permis. La demande se fait gratuitement sur ants.gouv.fr avec une pièce d''identité, un justificatif de domicile et une photo-signature numérique.',
    'Fais ta photo d''identité dans une cabine agréée ANTS : tu reçois un code e-photo à 22 chiffres qui transmet ta photo et signature directement au dossier en ligne.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_1, 1, 'qcm', 'Numéro NEPH',
    'Qu''est-ce que le numéro NEPH et à quoi sert-il ?',
    '[
      {"letter": "A", "text": "Le numéro officiel à 12 chiffres obligatoire pour s''inscrire aux examens du Code et du permis", "correct": true},
      {"letter": "B", "text": "Le numéro de série du moteur de la voiture de l''auto-école"},
      {"letter": "C", "text": "Un abonnement payant pour avoir des réductions sur le carburant"}
    ]'::jsonb,
    'Le numéro NEPH est l''identifiant unique délivré par la préfecture pour pouvoir passer les épreuves du permis.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_1, 2, 'matching', 'Organismes et documents permis',
    'Associe chaque organisme ou justificatif à son rôle :',
    '[
      {"id": "1", "left": "ANTS", "right": "Site officiel de l''État pour délivrer permis et cartes grises"},
      {"id": "2", "left": "Code e-photo", "right": "Code numérique intégrant photo et signature officielle"},
      {"id": "3", "left": "Attestation JDC", "right": "Justificatif de Journée Défense exigé avant 25 ans"},
      {"id": "4", "left": "Candidat libre", "right": "Possibilité de s''inscrire soi-même aux examens sans école"}
    ]'::jsonb,
    'Parfait ! Grâce à l''ANTS, toutes les formalités se font en ligne sans se déplacer en préfecture.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_1, 3, 'order', 'Demande NEPH',
    'Remets dans le bon ordre chronologique les étapes pour obtenir son numéro NEPH :',
    '[
      {"id": "1", "text": "Faire sa photo d''identité numérique agréée pour obtenir son code e-photo"},
      {"id": "2", "text": "Créer son compte sur ants.gouv.fr (ou se connecter via FranceConnect)"},
      {"id": "3", "text": "Remplir la demande d''inscription au permis de conduire avec ses justificatifs"},
      {"id": "4", "text": "Télécharger son attestation d''inscription contenant son numéro NEPH validé"}
    ]'::jsonb,
    'Compte en général entre 1 et 3 semaines pour que la préfecture valide ton numéro NEPH.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_1, 4, 'scam', 'Faux site permis ANTS',
    'Tu cherches à obtenir ton numéro NEPH et tombes sur ce site. Démarche officielle ou arnaque ?',
    '{
      "sender": "Service-Permis-Express (contact@neph-permis-france-urgence.org)",
      "channel": "email",
      "message": "OBTENTION NEPH EXPRESS 24H : Ne perdez pas des semaines avec l''administration. Validez votre dossier en ligne dès aujourd''hui pour 59,90 € et recevez votre numéro NEPH certifié immédiatement par e-mail.",
      "isScam": true,
      "redFlags": [
        "L''inscription au permis et la délivrance du numéro NEPH sur l''ANTS sont 100% gratuites",
        "Aucun intermédiaire privé ne peut accélérer les délais d''instruction préfectoraux",
        "Le site officiel de l''État se termine uniquement par le domaine « .gouv.fr »"
      ]
    }'::jsonb,
    'La création du numéro NEPH sur ants.gouv.fr est totalement gratuite. Ces sites privés surfacturent des démarches simples de l''État.'
  );

  -- Unité 2 : Réussir le Code de la route
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('voiture', 2, 'Unité 2 : Le Code de la Route', 'Épreuve théorique générale (ETG) et règles de circulation', 'RicoBleuTravail', 2)
  RETURNING id INTO u_voi_2;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_voi_2, 'voiture', 2, 'Préparer et valider l''examen du Code de la route', 50, 'published')
  RETURNING id INTO l_voi_2;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_voi_2, 1,
    'L''épreuve théorique du Code de la route (ETG)',
    'L''examen du Code de la route comporte 40 questions tirées au sort sur tablette tactile. Pour réussir, il faut obtenir au moins 35 bonnes réponses (soit 5 fautes autorisées au maximum). Le prix de l''examen est fixé par la loi à 30 € par passage dans un centre agréé (La Poste, SGS, Dekra, etc.). Une fois obtenu, ton Code reste valable pendant 5 ans pour passer l''épreuve pratique de conduite (avec jusqu''à 5 présentations autorisées).',
    'Le jour de l''examen, n''oublie JAMAIS ta pièce d''identité originale et en cours de validité : les photocopies sont systématiquement refusées !'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_2, 1, 'qcm', 'Barème du Code',
    'Combien de fautes au maximum peux-tu commettre pour décrocher ton examen du Code ?',
    '[
      {"letter": "A", "text": "5 fautes maximum (soit 35 bonnes réponses sur 40 questions)", "correct": true},
      {"letter": "B", "text": "10 fautes maximum (soit 30 bonnes réponses sur 40)"},
      {"letter": "C", "text": "Aucune faute tolérée, il faut un score parfait de 40/40"}
    ]'::jsonb,
    'Le seuil de réussite est fixé à 35 bonnes réponses sur 40 questions.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_2, 2, 'matching', 'Règles de l''examen du Code',
    'Associe chaque notion du Code à sa réalité réglementaire :',
    '[
      {"id": "1", "left": "Redevance d''examen", "right": "Tarif fixe légal de 30 € fixé par l''État"},
      {"id": "2", "left": "Validité du Code", "right": "5 ans pour réussir l''examen pratique du permis"},
      {"id": "3", "left": "Centres agréés", "right": "La Poste, Dekra, ObjectifCode pour passer sur tablette"},
      {"id": "4", "left": "ETG", "right": "Épreuve Théorique Générale du permis de conduire"}
    ]'::jsonb,
    'Super ! Tu peux t''inscrire à la session de ton choix en ligne 24h à l''avance avec ton NEPH.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_2, 3, 'order', 'Session examen du code',
    'Remets dans le bon ordre chronologique les étapes pour passer son examen du Code :',
    '[
      {"id": "1", "text": "S''entraîner sur les 10 thèmes officiels jusqu''à faire régulièrement moins de 5 fautes"},
      {"id": "2", "text": "Réserver son créneau d''examen dans un centre agréé avec son numéro NEPH (30 €)"},
      {"id": "3", "text": "Se présenter au centre avec sa pièce d''identité originale et sa convocation"},
      {"id": "4", "text": "Recevoir son résultat favorable officiel par e-mail sous 2 à 24 heures"}
    ]'::jsonb,
    'En conservant le mail de résultat favorable, tu pourras entamer tes heures de conduite pratique.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_2, 4, 'scenario', 'Cas pratique code',
    'Aide Thomas à réagir correctement à cette situation de circulation.',
    '{
      "context": "Thomas circule en ville sur une voie prioritaire à 50 km/h. Dans son rétroviseur, il aperçoit une ambulance du SAMU arrivant rapidement avec gyrophare bleu clignotant et sirène deux tons enclenchée.",
      "persona": {"name": "Thomas", "role": "Jeune conducteur en apprentissage"},
      "keyFacts": [
        {"label": "Vitesse", "value": "50 km/h"},
        {"label": "Priorité", "value": "Voie prioritaire"},
        {"label": "Signal", "value": "Sirène + Gyrophares"}
      ],
      "options": [
        {
          "id": "t1",
          "text": "Ralentir, serrer à droite en toute sécurité pour dégager la voie et lui céder le passage sans bloquer la circulation",
          "correct": true,
          "consequence": "Parfait ! Les véhicules d''intérêt général prioritaires en mission (SAMU, pompiers, police) ont priorité absolue dès lors que sirène et feux sont activés."
        },
        {
          "id": "t2",
          "text": "Accélérer pour rester devant elle puisque la voie est prioritaire",
          "correct": false,
          "consequence": "Infraction grave et danger mortel : vous bloquez une urgence vitale et risquez un accident."
        },
        {
          "id": "t3",
          "text": "Piler brusquement au milieu de la route sans regarder derrière soi",
          "correct": false,
          "consequence": "Danger de collision : un freinage brutal sans précaution peut causer un sur-accident."
        }
      ]
    }'::jsonb,
    'Faciliter le passage d''un véhicule de secours prioritaire en mission est un réflexe citoyen et une obligation du Code de la route.'
  );

  -- Unité 3 : Examen Pratique, Permis & Assurance
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('voiture', 3, 'Unité 3 : Permis Pratique & Assurance', 'Jeune permis probatoire, assurance au tiers et conduite sereine', 'RicoBleuTravail', 3)
  RETURNING id INTO u_voi_3;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_voi_3, 'voiture', 3, 'L''épreuve pratique, le permis probatoire & l''assurance', 50, 'published')
  RETURNING id INTO l_voi_3;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_voi_3, 1,
    'L''examen pratique et les réflexes du jeune conducteur',
    'L''épreuve pratique dure 32 minutes : il faut obtenir au moins 20 points sur 31 sans commettre de faute éliminatoire. Une fois reçu, tu obtiens un permis probatoire doté de 6 points (qui augmente chaque année sans infraction jusqu''à 12 points). Tu dois coller le disque « A » à l''arrière de ton véhicule pendant 3 ans (ou 2 ans si conduite accompagnée). Enfin, pour rouler, l''assurance automobile est une obligation légale absolue : au minimum l''assurance Responsabilité Civile (« au tiers ») qui indemnise les dommages causés aux autres.',
    'Conserve toujours dans la boîte à gants un constat amiable européen d''accident et vérifie que ton attestation d''assurance est valide.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_3, 1, 'qcm', 'Assurance obligatoire',
    'Quelle formule d''assurance automobile est légalement obligatoire pour pouvoir rouler sur la voie publique ?',
    '[
      {"letter": "A", "text": "L''assurance Responsabilité Civile (formule « au tiers »)", "correct": true},
      {"letter": "B", "text": "L''assurance tous risques avec véhicule de remplacement"},
      {"letter": "C", "text": "Aucune assurance n''est exigée les 6 premiers mois du jeune permis"}
    ]'::jsonb,
    'Conduire sans assurance au tiers est un délit puni de 3 750 € d''amende et de la confiscation du véhicule.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_3, 2, 'matching', 'Notions jeune conducteur',
    'Associe chaque notion du jeune conducteur à sa règle :',
    '[
      {"id": "1", "left": "Permis probatoire", "right": "Capital initial de 6 points augmentant sans infraction"},
      {"id": "2", "left": "Disque « A »", "right": "Macaron obligatoire collé à l''arrière du véhicule"},
      {"id": "3", "left": "Constat amiable", "right": "Document contradictoire officiel en cas d''accrochage"},
      {"id": "4", "left": "CEPC", "right": "Certificat provisoire valable 4 mois avec pièce d''identité"}
    ]'::jsonb,
    'Parfait ! Le CEPC téléchargé sur le site de la Sécurité routière permet de conduire dès le lendemain de la réussite.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_3, 3, 'order', 'Après le permis',
    'Remets dans le bon ordre chronologique les démarches dès l''obtention de l''examen pratique :',
    '[
      {"id": "1", "text": "Télécharger son Certificat d''Examen du Permis de Conduire (CEPC) avec mention favorable"},
      {"id": "2", "text": "Commander la fabrication de sa carte de permis définitive sur le site de l''ANTS"},
      {"id": "3", "text": "Souscrire une assurance auto (au moins au tiers) avant tout premier trajet au volant"},
      {"id": "4", "text": "Coller le disque A à l''arrière du véhicule et vérifier la présence du constat dans la boîte à gants"}
    ]'::jsonb,
    'Ne conduis jamais avant que le contrat d''assurance n''ait été officiellement validé par l''assureur.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_voi_3, 4, 'scenario', 'Cas pratique voiture',
    'Aide Chloé à bien réagir après un accrochage en voiture sur un parking.',
    '{
      "context": "En reculant sur un parking de supermarché, un autre conducteur heurte l''aile arrière de la voiture de Chloé. Les dégâts sont uniquement matériels. L''autre conducteur est très pressé et lui propose de signer un constat sans cocher les cases en lui disant : « On verra ça au téléphone plus tard ».",
      "persona": {"name": "Chloé", "role": "Conductrice permis probatoire"},
      "keyFacts": [
        {"label": "Dégâts", "value": "Ailes froissées"},
        {"label": "Blessé", "value": "Aucun (matériel pur)"},
        {"label": "Attitude tiers", "value": "Pressé et flou"}
      ],
      "options": [
        {
          "id": "c1",
          "text": "Refuser de signer un constat incomplet, remplir posément la partie commune, cocher les cases exactes, prendre des photos des véhicules et des plaques avant de signer",
          "correct": true,
          "consequence": "Excellente décision ! Un constat amiable signé ne peut plus être modifié. Ne signez jamais un constat vierge ou contradictoire sans cocher les cases exactes."
        },
        {
          "id": "c2",
          "text": "Signer le constat vierge pour aller plus vite et faire confiance à l''autre conducteur",
          "correct": false,
          "consequence": "Gros piège : l''autre conducteur pourra rajouter des torts à votre charge une fois rentré chez lui, et les assurances vous tiendront pour 100% responsable."
        },
        {
          "id": "c3",
          "text": "Partir sans donner ses coordonnées ni faire de constat",
          "correct": false,
          "consequence": "Délit pénal : partir sans échanger ses coordonnées constitue un délit de fuite passible de suspension de permis."
        }
      ]
    }'::jsonb,
    'Un constat amiable se remplit toujours sur place, calmement et avec précision. Chaque conducteur conserve son exemplaire sans modification.'
  );


  -- ==================================================================
  -- 4. ADMINISTRATION : Statut fiscal -> impots.gouv.fr -> Justificatifs & CAF
  -- ==================================================================

  -- Unité 1 : Statut fiscal & Obligations citoyennes
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('administration', 1, 'Unité 1 : Statut Fiscal & Citoyen', 'Rattachement parental, premier numéro fiscal et devoirs légaux', 'RicoEntreprise', 1)
  RETURNING id INTO u_adm_1;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_adm_1, 'administration', 1, 'Comprendre ses impôts et son statut fiscal personnel', 50, 'published')
  RETURNING id INTO l_adm_1;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_adm_1, 1,
    'C''est quoi les impôts et comment fonctionne ton foyer fiscal ?',
    'Les impôts financent les services publics (hôpitaux, universités, transports, routes). Dès tes 18 ans, une question clé se pose : rester rattaché au foyer fiscal de tes parents (possible jusqu''à 21 ans, ou 25 ans si tu es étudiant), ou déclarer tes impôts seul en créant ton propre foyer fiscal. Déclarer ses impôts chaque année est une obligation légale, même si tes revenus sont de 0 € ! Ta déclaration génère un avis d''impôt (ASDIR), le document indispensable demandé pour obtenir un logement, des bourses d''études ou des aides sociales.',
    'Même non imposable (0 € d''impôt à payer), faire sa déclaration est indispensable pour obtenir l''avis d''imposition qui ouvre l''accès aux aides.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_1, 1, 'qcm', 'Obligation déclarative',
    'Doit-on faire sa déclaration d''impôts si l''on ne gagne rien ou seulement de très petits revenus ?',
    '[
      {"letter": "A", "text": "Oui, déclarer est obligatoire et permet d''obtenir son avis d''imposition pour les aides", "correct": true},
      {"letter": "B", "text": "Non, la déclaration est interdite si l''on gagne moins de 15 000 € par an"},
      {"letter": "C", "text": "Seules les personnes de plus de 40 ans sont obligées de déclarer"}
    ]'::jsonb,
    'Déclarer ses revenus est obligatoire chaque année, même sans revenus, pour justifier de son niveau de ressources.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_1, 2, 'matching', 'Notions fiscales de base',
    'Associe chaque notion fiscale à sa définition :',
    '[
      {"id": "1", "left": "Foyer fiscal", "right": "Ensemble des personnes inscrites sur la même déclaration"},
      {"id": "2", "left": "Numéro fiscal", "right": "Identifiant unique à 13 chiffres pour toutes démarches"},
      {"id": "3", "left": "Avis d''impôt (ASDIR)", "right": "Justificatif officiel de revenus exigé pour le logement et aides"},
      {"id": "4", "left": "Rattachement fiscal", "right": "Choix de rester sur la déclaration des parents jusqu''à 25 ans"}
    ]'::jsonb,
    'Bravo ! L''avis de situation déclarative (ASDIR) est l''un des documents les plus demandés de ta vie adulte.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_1, 3, 'order', 'Choix fiscal',
    'Remets dans le bon ordre chronologique les étapes pour préparer sa situation fiscale :',
    '[
      {"id": "1", "text": "Vérifier son statut (étudiant de moins de 25 ans ou actif financièrement autonome)"},
      {"id": "2", "text": "Simuler avec ses parents l''intérêt financier du rattachement vs déclaration séparée"},
      {"id": "3", "text": "Demander son numéro fiscal individuel auprès des services des impôts si déclaration séparée"},
      {"id": "4", "text": "Rassembler l''ensemble de ses justificatifs de revenus de l''année civile passée"}
    ]'::jsonb,
    'Une simulation conjointe avec tes parents permet de choisir l''option la plus avantageuse pour toute la famille.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_1, 4, 'scam', 'Faux mail du Fisc',
    'Tu reçois cet e-mail aux couleurs de la Direction générale des Finances publiques. Arnaque ou vrai message ?',
    '{
      "sender": "Finances-Publiques (remboursement-impots@dgfip-portail-particulier.net)",
      "channel": "email",
      "message": "DIRECTION GÉNÉRALE DES FINANCES PUBLIQUES : Après révision de votre déclaration, vous bénéficiez d''un remboursement de trop-perçu fiscal de 342,80 €. Pour recevoir votre virement sous 48h, saisissez vos coordonnées de carte bancaire sur notre formulaire sécurisé.",
      "isScam": true,
      "redFlags": [
        "L''administration fiscale ne demande JAMAIS de numéro de carte bancaire pour un remboursement",
        "Les remboursements d''impôt se font uniquement par virement automatique sur le RIB enregistré",
        "L''adresse d''envoi n''est pas le domaine officiel de l''État « @dgfip.finances.gouv.fr »"
      ]
    }'::jsonb,
    'C''est une tentative d''escroquerie au faux remboursement. Le fisc rembourse directement sur votre compte bancaire sans jamais demander de carte bleue.'
  );

  -- Unité 2 : Compte impots.gouv.fr & Déclaration en Ligne
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('administration', 2, 'Unité 2 : impots.gouv.fr & Déclaration', 'Déclaration annuelle au printemps et prélèvement à la source', 'RicoEntreprise', 2)
  RETURNING id INTO u_adm_2;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_adm_2, 'administration', 2, 'Créer son espace en ligne & valider sa déclaration', 50, 'published')
  RETURNING id INTO l_adm_2;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_adm_2, 1,
    'La déclaration de revenus sur impots.gouv.fr',
    'Chaque année au printemps (entre avril et juin), la campagne de déclaration des revenus s''ouvre sur le site impots.gouv.fr (ou via FranceConnect). L''administration préremplit automatiquement tes salaires transmis par tes employeurs. Tu dois vérifier les montants, indiquer ton adresse au 1er janvier et corriger si besoin. Si tu es étudiant ou apprenti, bonne nouvelle : tes salaires bénéficient d''abattements fiscaux légaux (exonération jusqu''à environ 3 fois le Smic pour les jobs étudiants, et 1 Smic annuel pour l''apprentissage) !',
    'Garde tes avis d''impôt pendant au moins 3 ans : l''administration peut les vérifier pendant ce délai légal.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_2, 1, 'qcm', 'Période fiscale',
    'À quel moment de l''année a lieu la campagne obligatoire de déclaration des revenus en France ?',
    '[
      {"letter": "A", "text": "Au printemps (entre avril et juin chaque année)", "correct": true},
      {"letter": "B", "text": "Au milieu de l''hiver (fin décembre à minuit)"},
      {"letter": "C", "text": "Chaque mois le lendemain du versement du salaire"}
    ]'::jsonb,
    'La déclaration de revenus se déroule chaque printemps en ligne sur le portail officiel impots.gouv.fr.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_2, 2, 'matching', 'Outils de la déclaration',
    'Associe chaque notion de déclaration fiscale à son principe :',
    '[
      {"id": "1", "left": "Prélèvement à la source", "right": "Impôt prélevé directement chaque mois sur la paie"},
      {"id": "2", "left": "Déclaration automatique", "right": "Validation tacite si les données préremplies sont justes"},
      {"id": "3", "left": "Exonération apprenti", "right": "Salaires d''apprentissage non imposés jusqu''à 1 Smic annuel"},
      {"id": "4", "left": "FranceConnect", "right": "Connexion sécurisée unifiée avec ses identifiants Ameli ou Impôts"}
    ]'::jsonb,
    'Super ! Grâce à FranceConnect, un seul mot de passe suffit pour accéder à Ameli, aux Impôts et à l''ANTS.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_2, 3, 'order', 'Validation déclaration',
    'Remets dans le bon ordre chronologique les étapes pour valider sa déclaration sur impots.gouv.fr :',
    '[
      {"id": "1", "text": "Se connecter à son espace particulier avec son numéro fiscal et mot de passe"},
      {"id": "2", "text": "Vérifier l''adresse de son logement au 1er janvier et sa situation maritale"},
      {"id": "3", "text": "Contrôler les montants de salaires préremplis et appliquer les exonérations étudiantes"},
      {"id": "4", "text": "Signer électroniquement la déclaration et télécharger son avis de situation (ASDIR)"}
    ]'::jsonb,
    'Ton avis ASDIR est disponible immédiatement après la signature de ta déclaration en ligne.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_2, 4, 'scenario', 'Cas pratique impôts',
    'Aide Lucas à déclarer correctement ses revenus de job d''été.',
    '{
      "context": "Lucas, 20 ans, est étudiant à l''université. Pendant l''été, il a travaillé 2 mois en tant que préparateur de commandes et a gagné au total 2 600 € net. C''est son premier revenu de l''année. Il s''apprête à faire sa première déclaration en ligne.",
      "persona": {"name": "Lucas", "role": "Étudiant 20 ans"},
      "keyFacts": [
        {"label": "Statut", "value": "Étudiant"},
        {"label": "Revenu été", "value": "2 600 €"},
        {"label": "Plafond exonération", "value": "Env. 5 000 €"}
      ],
      "options": [
        {
          "id": "l1",
          "text": "Bénéficier de l''exonération fiscale des étudiants de moins de 26 ans : ne déclarer que la part dépassant le plafond légal (ici 0 € imposable)",
          "correct": true,
          "consequence": "Excellent réflexe ! Les revenus des étudiants de moins de 26 ans sont exonérés d''impôt dans la limite de 3 fois le Smic mensuel. Lucas ne paiera aucun impôt."
        },
        {
          "id": "l2",
          "text": "Cacher ses revenus et ne pas ouvrir d''espace sur impots.gouv.fr",
          "correct": false,
          "consequence": "Erreur : l''employeur transmet déjà les salaires au fisc. Ne pas déclarer vous expose à des pénalités et vous prive d''avis fiscal pour vos bourses."
        },
        {
          "id": "l3",
          "text": "Déclarer les 2 600 € en revenus classiques sans cocher le statut étudiant",
          "correct": false,
          "consequence": "Dommage : sans mentionner son statut d''étudiant, Lucas renonce à un abattement fiscal légal auquel il a pleinement droit."
        }
      ]
    }'::jsonb,
    'Les étudiants de moins de 26 ans bénéficient d''un abattement fiscal légal sur leurs jobs d''été et emplois pendant l''année scolaire.'
  );

  -- Unité 3 : Justificatifs de Revenus & Aides CAF
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('administration', 3, 'Unité 3 : Justificatifs & Aides CAF', 'Conservation des documents, numéro allocataire et aides au logement', 'RicoEntreprise', 3)
  RETURNING id INTO u_adm_3;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_adm_3, 'administration', 3, 'Conserver ses justificatifs et faire ses demandes CAF', 50, 'published')
  RETURNING id INTO l_adm_3;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_adm_3, 1,
    'Conserver ses documents et faire ses démarches CAF',
    'Règle d''or de la vie adulte : conserve tes bulletins de paie à vie (format papier ou coffre-fort numérique sécurisé). Ils sont indispensables pour faire valoir tes droits au chômage et pour calculer ta future retraite ! La CAF (Caisse d''Allocations Familiales) est l''organisme qui verse les aides sociales majeures : l''APL (Aide Personnalisée au Logement pour payer ton loyer) et la Prime d''activité si tu travailles. La CAF calcule tes droits en fonction de tes revenus : tu dois actualiser ta situation tous les 3 mois par une déclaration trimestrielle en ligne.',
    'Signale tout changement de situation (déménagement, embauche, rupture) dans le mois à la CAF pour éviter d''avoir à rembourser un trop-perçu.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_3, 1, 'qcm', 'Conservation fiches de paie',
    'Pendant combien de temps la loi conseille-t-elle de conserver ses fiches de paie ?',
    '[
      {"letter": "A", "text": "À vie (jusqu''à la liquidation et validation des droits à la retraite)", "correct": true},
      {"letter": "B", "text": "Seulement 6 mois après la fin du contrat"},
      {"letter": "C", "text": "On peut les jeter dès que le salaire est versé sur son compte"}
    ]'::jsonb,
    'Les fiches de paie doivent être conservées à vie pour prouver ses cotisations et valider ses trimestres de retraite.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_3, 2, 'matching', 'Aides et démarches CAF',
    'Associe chaque dispositif CAF à son rôle :',
    '[
      {"id": "1", "left": "APL", "right": "Aide Personnalisée au Logement pour réduire le montant du loyer"},
      {"id": "2", "left": "Prime d''activité", "right": "Complément financier pour les travailleurs à revenus modestes"},
      {"id": "3", "left": "Numéro allocataire", "right": "Identifiant personnel à 7 chiffres pour son dossier CAF"},
      {"id": "4", "left": "Déclaration trimestrielle", "right": "Actualisation obligatoire de ses ressources tous les 3 mois"}
    ]'::jsonb,
    'Excellent ! L''APL peut être versée directement au locataire ou déduite du loyer par le propriétaire.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_3, 3, 'order', 'Demande APL',
    'Remets dans le bon ordre chronologique les étapes pour faire sa demande d''APL :',
    '[
      {"id": "1", "text": "Faire une simulation gratuite sur caf.fr pour estimer le montant de son aide"},
      {"id": "2", "text": "Réunir son contrat de bail signé, l''attestation de loyer et son RIB"},
      {"id": "3", "text": "Créer ou ouvrir son compte sur caf.fr et soumettre sa demande d''aide au logement"},
      {"id": "4", "text": "Réaliser sa déclaration trimestrielle de ressources pour maintenir le versement de l''aide"}
    ]'::jsonb,
    'Fais ta demande d''APL dès le premier mois de ton emménagement : la CAF ne verse aucune aide rétroactive.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_adm_3, 4, 'scenario', 'Cas pratique CAF',
    'Aide Julie à gérer son changement de situation auprès de la CAF.',
    '{
      "context": "Julie touchait 210 € d''APL par mois en tant qu''étudiante sans revenu. Début octobre, elle décroche son premier CDI avec un salaire net de 1 700 € par mois. Elle se demande si elle doit prévenir la CAF immédiatement ou attendre la fin de l''année.",
      "persona": {"name": "Julie", "role": "Nouvelle jeune active"},
      "keyFacts": [
        {"label": "Ancien statut", "value": "Étudiante (210 € APL)"},
        {"label": "Nouveau statut", "value": "CDI 1 700 € net"},
        {"label": "Date début", "value": "Début octobre"}
      ],
      "options": [
        {
          "id": "j1",
          "text": "Déclarer immédiatement son nouveau statut professionnel dans son espace « Mon Compte » sur caf.fr",
          "correct": true,
          "consequence": "Règle d''or ! La CAF recalcule les droits en temps réel. Ne rien déclarer entraîne un « trop-perçu » : la CAF découvrira le salaire lors du croisement fiscal et exigera le remboursement intégral des sommes versées en trop."
        },
        {
          "id": "j2",
          "text": "Ne rien dire et continuer à encaisser les 210 € d''APL tant que la CAF ne demande rien",
          "correct": false,
          "consequence": "Très risqué : la dette s''accumule chaque mois. La CAF peut réclamer plus de 1 000 € d''un coup avec retenues sur salaire."
        },
        {
          "id": "j3",
          "text": "Résilier son compte bancaire pour que la CAF ne puisse rien reprendre",
          "correct": false,
          "consequence": "Inutile et dangereux : la dette reste légalement inscrite et fait l''objet d''un recouvrement par voie d''huissier."
        }
      ]
    }'::jsonb,
    'Toujours déclarer tout changement d''emploi ou de ressources à la CAF sous 30 jours pour éviter les dettes de trop-perçu.'
  );


  -- ==================================================================
  -- 5. LOGEMENT : Dossier de location -> Visale & Garant -> Bail & Entrée
  -- ==================================================================

  -- Unité 1 : Monter un Dossier Locataire en Béton
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('logement', 1, 'Unité 1 : Dossier Locataire en Béton', 'Pièces obligatoires, organisation et filigrane sécurisé', 'Riconstruction', 1)
  RETURNING id INTO u_log_1;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_log_1, 'logement', 1, 'Créer son dossier locataire & sécuriser ses documents', 50, 'published')
  RETURNING id INTO l_log_1;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_log_1, 1,
    'Un dossier locataire parfait et protégé contre la fraude',
    'Pour louer un appartement en France, la concurrence est souvent rude : avoir un dossier complet prêt dès la première visite est la clé pour décrocher un logement. La loi encadre strictement les pièces qu''un propriétaire peut exiger : pièce d''identité, justificatif de domicile actuel, contrat de travail ou attestation étudiante, et 3 derniers justificatifs de revenus. Pour protéger tes documents personnels contre les usurpations d''identité, utilise le service public gratuit DossierFacile.logement.gouv.fr qui ajoute un filigrane officiel infalsifiable sur chaque page.',
    'Un propriétaire n''a JAMAIS le droit de te demander un extrait de casier judiciaire, une photo de carte bancaire ou un relevé de compte détaillé !'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_1, 1, 'qcm', 'Service DossierFacile',
    'Quel service public officiel gratuit permet de valider et filigraner son dossier locataire en toute sécurité ?',
    '[
      {"letter": "A", "text": "DossierFacile (dossierfacile.logement.gouv.fr)", "correct": true},
      {"letter": "B", "text": "Leboncoin Immo VIP"},
      {"letter": "C", "text": "La plateforme PayMyRent"}
    ]'::jsonb,
    'DossierFacile est le service public gratuit de l''État pour certifier et filigraner les pièces locatives.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_1, 2, 'matching', 'Pièces du dossier locataire',
    'Associe chaque pièce du dossier locataire à son exigence légale :',
    '[
      {"id": "1", "left": "Pièce d''identité", "right": "CNI ou passeport en cours de validité"},
      {"id": "2", "left": "Justificatif de domicile", "right": "3 dernières quittances ou attestation d''hébergement"},
      {"id": "3", "left": "Justificatif de statut", "right": "Contrat de travail, certificat d''apprentissage ou de scolarité"},
      {"id": "4", "left": "Filigrane DossierFacile", "right": "Mention protégeant les pièces contre l''usurpation d''identité"}
    ]'::jsonb,
    'Parfait ! Transmettre un dossier filigrané empêche les escrocs d''utiliser tes pièces pour contracter des crédits.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_1, 3, 'order', 'Constitution dossier',
    'Remets dans le bon ordre chronologique la préparation de son dossier de candidature :',
    '[
      {"id": "1", "text": "Rassembler toutes ses pièces justificatives originales (identité, domicile, revenus)"},
      {"id": "2", "text": "Déposer ses documents sur DossierFacile pour vérification par les agents publics"},
      {"id": "3", "text": "Obtenir son lien de dossier sécurisé certifié par l''État"},
      {"id": "4", "text": "Transmettre le lien aux propriétaires dès la confirmation d''une visite de logement"}
    ]'::jsonb,
    'Un dossier complet transmis immédiatement après la visite multiplie par 3 tes chances d''être retenu.'
  );

  -- Exercice 4 (Détecteur d'arnaque)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_1, 4, 'scam', 'Fausse annonce location',
    'Tu cherches un studio et reçois cet e-mail suite à une annonce très avantageuse. Arnaque ou vrai bailleur ?',
    '{
      "sender": "Pierre-Bailleur (pierre.proprietaire75@gmail.com)",
      "channel": "email",
      "message": "Bonjour, suite aux nombreuses demandes pour le 2 pièces à 450 €/mois, étant muté à Londres, pour vous réserver la visite exclusive samedi, merci de déposer un mandat postal de 900 € de caution pour prouver votre solvabilité. Je vous rends les fonds lors de la visite si le logement ne convient pas.",
      "isScam": true,
      "redFlags": [
        "Un loyer très en dessous du prix du marché (appartement trop beau pour être vrai)",
        "Le propriétaire qui prétend être à l''étranger ou muté loin pour justifier de ne pas se déplacer",
        "Il est STRICTEMENT ILLÉGAL d''exiger de l''argent avant la visite et la signature du bail"
      ]
    }'::jsonb,
    'La loi française interdit formellement de verser le moindre centime avant la signature du contrat de bail et l''état des lieux. Ne versez JAMAIS d''argent pour réserver une visite.'
  );

  -- Unité 2 : Garanties, Visale & Caution
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('logement', 2, 'Unité 2 : Garanties & Visale', 'Sécuriser le bailleur : caution Visale gratuite et garants', 'Riconstruction', 2)
  RETURNING id INTO u_log_2;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_log_2, 'logement', 2, 'La caution Visale, les garants et le dépôt de garantie', 50, 'published')
  RETURNING id INTO l_log_2;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_log_2, 1,
    'Visale, garants physiques et dépôt de garantie',
    'La plupart des bailleurs exigent un garant (une personne qui s''engage à payer le loyer si tu ne peux plus). Si tes proches ne peuvent pas se porter garants, Action Logement propose la garantie Visale : une caution 100% gratuite accordée par l''État pour les jeunes de moins de 30 ans et étudiants ! Elle garantit au propriétaire le paiement des loyers impayés sans franchise. À ne pas confondre avec le « dépôt de garantie » (la caution versée à l''entrée) : son montant est plafonné par la loi à 1 mois de loyer hors charges en location vide (2 mois en meublé).',
    'Demande ton visa Visale en ligne sur visale.fr AVANT de commencer tes recherches pour le joindre directement à tes candidatures.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_2, 1, 'qcm', 'Garantie Visale',
    'Qu''est-ce que la garantie Visale proposée par Action Logement ?',
    '[
      {"letter": "A", "text": "Une caution gratuite de l''État garantissant les loyers impayés pour les jeunes de moins de 30 ans", "correct": true},
      {"letter": "B", "text": "Un prêt bancaire payant avec intérêts pour payer les déménageurs"},
      {"letter": "C", "text": "Une assurance qui rembourse le loyer si tu décides de partir sans prévenir"}
    ]'::jsonb,
    'La garantie Visale est un dispositif public gratuit qui remplace le garant physique pour rassurer les bailleurs.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_2, 2, 'matching', 'Notions de garanties',
    'Associe chaque notion locative à sa fonction exacte :',
    '[
      {"id": "1", "left": "Garantie Visale", "right": "Caution publique gratuite garantie par Action Logement"},
      {"id": "2", "left": "Garant physique", "right": "Proche signant un acte de cautionnement solidaire"},
      {"id": "3", "left": "Dépôt de garantie", "right": "Somme versée à l''entrée, restituée en fin de bail"},
      {"id": "4", "left": "Plafond légal dépôt", "right": "Maximum 1 mois de loyer nu ou 2 mois en meublé"}
    ]'::jsonb,
    'Bravo ! Le dépôt de garantie doit être restitué sous 1 à 2 mois maximum après l''état des lieux de sortie.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_2, 3, 'order', 'Démarche Visale',
    'Remets dans le bon ordre chronologique les étapes pour obtenir la garantie Visale :',
    '[
      {"id": "1", "text": "Créer son espace personnel sur le site officiel visale.fr"},
      {"id": "2", "text": "Téléverser sa pièce d''identité et son justificatif d''activité ou de statut étudiant"},
      {"id": "3", "text": "Recevoir son visa certifié sous 48h précisant le plafond de loyer garanti"},
      {"id": "4", "text": "Fournir son visa au propriétaire pour qu''il valide son contrat de cautionnement en ligne"}
    ]'::jsonb,
    'Visale est gratuite pour le locataire comme pour le propriétaire et garantit les impayés jusqu''à 36 mensualités.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_2, 4, 'scenario', 'Cas pratique garanties',
    'Aide Paul à convaincre son futur propriétaire d''accepter la garantie Visale.',
    '{
      "context": "Paul, 22 ans, apprenti, a trouvé un logement parfait. Le propriétaire hésite car il ne connaît pas la garantie Visale et demande un garant physique gagnant 3 fois le montant du loyer.",
      "persona": {"name": "Paul", "role": "Apprenti 22 ans"},
      "keyFacts": [
        {"label": "Loyer", "value": "520 €"},
        {"label": "Statut", "value": "Apprenti éligible Visale"},
        {"label": "Garant physique", "value": "Aucun proche disponible"}
      ],
      "options": [
        {
          "id": "p1",
          "text": "Lui expliquer calmement qu''Action Logement indemnise le bailleur sans aucune franchise ni délai d''attente en cas d''impayé, et lui transmettre la brochure officielle Visale pour les propriétaires",
          "correct": true,
          "consequence": "Très efficace ! Visale est bien plus sécurisante pour un bailleur qu''un garant physique car elle évite toute procédure judiciaire longue et coûteuse."
        },
        {
          "id": "p2",
          "text": "Faire fabriquer de fausses fiches de paie au nom d''un proche pour créer un faux garant",
          "correct": false,
          "consequence": "Délit de faux et usage de faux : lourdement puni par la loi (jusqu''à 3 ans de prison) et résiliation immédiate du bail."
        },
        {
          "id": "p3",
          "text": "Proposer au propriétaire de lui payer 6 mois de loyer d''avance en liquide",
          "correct": false,
          "consequence": "Illégal et dangereux : la loi interdit d''exiger plus que le dépôt de garantie légal et le liquide ne laisse aucune preuve de paiement."
        }
      ]
    }'::jsonb,
    'La garantie Visale est un gage absolu de sécurité pour les propriétaires une fois son fonctionnement expliqué.'
  );

  -- Unité 3 : Bail, État des Lieux & Emménagement
  INSERT INTO public.units (category_id, unit_number, title, subtitle, mascot_name, order_index)
  VALUES ('logement', 3, 'Unité 3 : Bail, État des Lieux & Entrée', 'Contrat de location, inventaire d''entrée et assurance habitation', 'Riconstruction', 3)
  RETURNING id INTO u_log_3;

  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward, status)
  VALUES (u_log_3, 'logement', 3, 'La signature du bail, l''état des lieux & l''assurance', 50, 'published')
  RETURNING id INTO l_log_3;

  -- Écran 1 (Compréhension)
  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (
    l_log_3, 1,
    'La signature du bail et l''état des lieux d''entrée',
    'Le bail de location est le contrat officiel qui fixe la durée, le loyer et les devoirs du locataire et du propriétaire. Ne verse JAMAIS le dépôt de garantie ni le premier loyer avant de signer le bail ! L''état des lieux d''entrée est capital : il décrit précisément l''état de chaque pièce et équipement. Prends ton temps, vérifie les robinets, fenêtres et prises, et note chaque rayure ou trace d''humidité. Enfin, tu as l''obligation légale de souscrire une assurance habitation avant d''entrer dans les lieux pour couvrir les risques d''incendie et de dégâts des eaux.',
    'Prends des photos datées de chaque pièce et détail lors de l''état des lieux : elles font foi si le propriétaire conteste lors de ton départ.'
  );

  -- Exercice 1 (QCM doux)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_3, 1, 'qcm', 'Assurance habitation',
    'Quand devez-vous obligatoirement souscrire votre assurance habitation ?',
    '[
      {"letter": "A", "text": "Avant la remise des clés, pour remettre l''attestation au bailleur le jour de l''état des lieux", "correct": true},
      {"letter": "B", "text": "Un an après l''emménagement si aucun dégât n''est survenu"},
      {"letter": "C", "text": "L''assurance habitation n''est obligatoire que pour les propriétaires"}
    ]'::jsonb,
    'L''assurance habitation est obligatoire pour tout locataire dès le premier jour de la remise des clés.'
  );

  -- Exercice 2 (Association de paires)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_3, 2, 'matching', 'Formalités d''emménagement',
    'Associe chaque document de location à sa portée juridique :',
    '[
      {"id": "1", "left": "Bail de location", "right": "Contrat fixant les règles, la durée et le montant du loyer"},
      {"id": "2", "left": "État des lieux d''entrée", "right": "Description contradictoire minutieuse de l''état du logement"},
      {"id": "3", "left": "Quittance de loyer", "right": "Reçu gratuit attestant du paiement intégral du loyer"},
      {"id": "4", "left": "Assurance habitation", "right": "Couverture obligatoire des risques locatifs (dégât des eaux)"}
    ]'::jsonb,
    'Parfait ! La quittance de loyer est gratuite et sert de justificatif de domicile officiel pour toutes tes démarches.'
  );

  -- Exercice 3 (Remise en ordre chronologique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_3, 3, 'order', 'Jour de l''emménagement',
    'Remets dans le bon ordre chronologique les étapes du jour de l''emménagement :',
    '[
      {"id": "1", "text": "Relire attentivement et signer le contrat de bail de location en double exemplaire"},
      {"id": "2", "text": "Réaliser l''état des lieux d''entrée en plein jour en testant tous les équipements"},
      {"id": "3", "text": "Remettre l''attestation d''assurance habitation et régler le dépôt de garantie"},
      {"id": "4", "text": "Récupérer l''ensemble des clés et relever les compteurs d''électricité et d''eau"}
    ]'::jsonb,
    'Relever les chiffres des compteurs d''énergie le jour même évite de payer la consommation de l''ancien occupant.'
  );

  -- Exercice 4 (Cas pratique)
  INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
  VALUES (
    l_log_3, 4, 'scenario', 'Cas pratique état des lieux',
    'Aide Léa à gérer cette situation délicate lors de son état des lieux d''entrée.',
    '{
      "context": "Pendant l''état des lieux d''entrée, Léa remarque une infiltration d''eau et des cloques sur le mur de la salle de bain. Le propriétaire lui dit avec le sourire : « Ne vous inquiétez pas, ce n''est rien du tout, pas besoin de le noter sur le papier, on se fait confiance ! »",
      "persona": {"name": "Léa", "role": "Nouvelle locataire"},
      "keyFacts": [
        {"label": "Constat", "value": "Traces d''humidité salle de bain"},
        {"label": "Propriétaire", "value": "Refuse de le mentionner par écrit"}
      ],
      "options": [
        {
          "id": "l1",
          "text": "Insister poliment mais fermement pour que la trace d''humidité soit expressément inscrite sur le document et prendre une photo avec son téléphone",
          "correct": true,
          "consequence": "Super réflexe ! Tout dégât non mentionné sur l''état des lieux d''entrée est légalement considéré comme causé par le locataire. Sans cette mention, le bailleur aurait pu retenir son dépôt de garantie lors de son départ."
        },
        {
          "id": "l2",
          "text": "Lui faire confiance et signer l''état des lieux sans rien écrire",
          "correct": false,
          "consequence": "Piège coûteux : à votre départ, le propriétaire pourra affirmer que vous avez causé cette moisissure et déduire les travaux de remise en état sur votre caution."
        },
        {
          "id": "l3",
          "text": "Repartir en courant et annuler son bail",
          "correct": false,
          "consequence": "Réaction excessive : il suffit simplement d''inscrire scrupuleusement la dégradation sur le document officiel pour être 100% protégé."
        }
      ]
    }'::jsonb,
    'L''état des lieux est un document contradictoire : chaque défaut doit être écrit noir sur blanc pour vous protéger.'
  );

END $$;

-- ====================================================================
-- 4. FONCTION & TRIGGER : Validation automatique selon l'onboarding
-- En fonction des réponses fournies par l'utilisateur lors de l'onboarding,
-- on valide automatiquement les unités et leçons déjà maîtrisées.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.apply_onboarding_progress(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_progress_id UUID;
  v_bank RECORD;
  v_social RECORD;
  v_driver RECORD;
  v_tax RECORD;
  v_housing RECORD;
  v_lesson_id UUID;
BEGIN
  -- Récupérer l'identifiant de progression de l'utilisateur
  SELECT id INTO v_progress_id FROM public.progress WHERE user_id = p_user_id;
  IF v_progress_id IS NULL THEN
    RETURN;
  END IF;

  -- ------------------------------------------------------------------
  -- 1. SANTÉ
  -- ------------------------------------------------------------------
  SELECT * INTO v_social FROM public.social_security WHERE progress_id = v_progress_id;
  IF FOUND THEN
    -- Compte Ameli déjà créé -> Valide Unité 1 Santé
    IF v_social.ameli_account_created = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'sante' AND order_index = 1;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Carte Vitale déjà demandée / en possession -> Valide Unité 2 Santé
    IF v_social.vitale_card_requested = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'sante' AND order_index = 2;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Mutuelle complémentaire déjà active -> Valide Unité 3 Santé
    IF v_social.has_mutuelle = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'sante' AND order_index = 3;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- 2. FINANCE
  -- ------------------------------------------------------------------
  SELECT * INTO v_bank FROM public.bank_account WHERE progress_id = v_progress_id;
  IF FOUND THEN
    -- A les pièces d'identité et justificatifs de domicile -> Maîtrise l'ouverture de compte (Unité 1 Finance)
    IF (v_bank.has_identity_doc = true AND v_bank.has_proof_of_address = true) THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'finance' AND order_index = 1;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Conserve ses fiches de paie et justificatifs de revenus -> Maîtrise son budget & revenus (Unité 2 Finance)
    IF v_bank.has_proof_of_income = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'finance' AND order_index = 2;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- 3. VOITURE
  -- ------------------------------------------------------------------
  SELECT * INTO v_driver FROM public.driver_licence WHERE progress_id = v_progress_id;
  IF FOUND THEN
    -- Compte ANTS créé -> Valide Unité 1 Voiture
    IF v_driver.ants_account_created = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'voiture' AND order_index = 1;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Code de la route déjà réussi -> Valide Unité 2 Voiture
    IF v_driver.code_passed = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'voiture' AND order_index = 2;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Examen pratique déjà réussi -> Valide Unité 3 Voiture
    IF v_driver.practical_exam_passed = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'voiture' AND order_index = 3;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- 4. ADMINISTRATION
  -- ------------------------------------------------------------------
  SELECT * INTO v_tax FROM public.tax_return WHERE progress_id = v_progress_id;
  IF FOUND THEN
    -- Connaît son statut fiscal -> Valide Unité 1 Administration
    IF v_tax.must_declare = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'administration' AND order_index = 1;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Compte impots.gouv.fr déjà actif -> Valide Unité 2 Administration
    IF v_tax.impots_account_created = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'administration' AND order_index = 2;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- Fiches de paie récupérées pour l'année -> Valide Unité 3 Administration
    IF v_tax.income_collected = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'administration' AND order_index = 3;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- 5. LOGEMENT
  -- ------------------------------------------------------------------
  SELECT * INTO v_housing FROM public.housing WHERE progress_id = v_progress_id;
  IF FOUND THEN
    -- Dossier locataire déjà prêt -> Valide Unité 1 Logement
    IF v_housing.has_tenant_file = true THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'logement' AND order_index = 1;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;

    -- A un garant ou utilise la garantie Visale -> Valide Unité 2 Logement
    IF (v_housing.has_guarantor = true OR v_housing.uses_visale = true) THEN
      SELECT id INTO v_lesson_id FROM public.lessons WHERE category_id = 'logement' AND order_index = 2;
      IF v_lesson_id IS NOT NULL THEN
        INSERT INTO public.user_lesson_progress (user_id, lesson_id, status, score, completed_at)
        VALUES (p_user_id, v_lesson_id, 'completed', 100, now())
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET status = 'completed', score = 100;
      END IF;
    END IF;
  END IF;

  -- Mettre à jour l'XP global de l'utilisateur (50 XP par leçon validée)
  UPDATE public.progress
  SET xp = (
    SELECT COALESCE(COUNT(*) * 50, 0)
    FROM public.user_lesson_progress
    WHERE user_id = p_user_id AND status = 'completed'
  )
  WHERE user_id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur automatique lorsque l'onboarding est complété sur la table users
CREATE OR REPLACE FUNCTION public.handle_onboarding_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_onboarding_completed = true THEN
    PERFORM public.apply_onboarding_progress(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_onboarding_completed ON public.users;
CREATE TRIGGER trigger_onboarding_completed
AFTER UPDATE OF is_onboarding_completed ON public.users
FOR EACH ROW
WHEN (NEW.is_onboarding_completed = true)
EXECUTE FUNCTION public.handle_onboarding_completed();

-- Exécuter la validation pour les utilisateurs ayant déjà complété l'onboarding
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.users WHERE is_onboarding_completed = true LOOP
    PERFORM public.apply_onboarding_progress(r.id);
  END LOOP;
END $$;
