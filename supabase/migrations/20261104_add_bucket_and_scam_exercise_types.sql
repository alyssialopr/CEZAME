-- ====================================================================
-- MIGRATION: Ajout des types d'exercices 'bucket' (Tri en bac) et 'scam' (Détecteur d'arnaque)
-- ====================================================================

-- 1. Mise à jour de la contrainte CHECK sur lesson_questions.type
DO $$
DECLARE
  c_name TEXT;
BEGIN
  -- Trouver la contrainte CHECK existante sur la colonne 'type'
  SELECT con.conname INTO c_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
  WHERE con.conrelid = 'public.lesson_questions'::regclass
    AND att.attname = 'type'
    AND con.contype = 'c';

  IF c_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.lesson_questions DROP CONSTRAINT ' || quote_ident(c_name);
  END IF;

  -- Recréer la contrainte avec les 6 types d'exercices
  ALTER TABLE public.lesson_questions
  ADD CONSTRAINT lesson_questions_type_check
  CHECK (type IN ('qcm', 'order', 'matching', 'document', 'bucket', 'scam'));
END $$;

-- 2. Insertion d'exercices variés (Tri en bac & Détecteur d'arnaque)

DO $$
DECLARE
  l_finance_id UUID;
  l_sante_id UUID;
  l_logement_id UUID;
  l_admin_id UUID;
BEGIN
  -- Récupération des IDs de leçons
  SELECT id INTO l_finance_id FROM public.lessons WHERE category_id = 'finance' AND order_index = 1;
  SELECT id INTO l_sante_id FROM public.lessons WHERE category_id = 'sante' AND order_index = 1;
  SELECT id INTO l_logement_id FROM public.lessons WHERE category_id = 'logement' AND order_index = 1;
  SELECT id INTO l_admin_id FROM public.lessons WHERE category_id = 'administration' AND order_index = 1;

  -- FINANCE : Tri en bac (Règle 50/30/20)
  IF l_finance_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      12,
      'bucket',
      'La règle 50/30/20',
      'Classe chaque dépense dans sa catégorie budgétaire correspondante :',
      '{
        "buckets": [
          {"id": "b1", "label": "Besoins (50%)", "color": "#3B82F6"},
          {"id": "b2", "label": "Envies (30%)", "color": "#8B5CF6"},
          {"id": "b3", "label": "Épargne (20%)", "color": "#10B981"}
        ],
        "items": [
          {"id": "1", "text": "Loyer et électricité", "bucketId": "b1"},
          {"id": "2", "text": "Sorties resto & cinéma", "bucketId": "b2"},
          {"id": "3", "text": "Virement sur Livret A", "bucketId": "b3"},
          {"id": "4", "text": "Courses alimentaires", "bucketId": "b1"}
        ]
      }'::jsonb,
      '50% pour les besoins essentiels, 30% pour les plaisirs et loisirs, et 20% pour construire ton épargne de sécurité !'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;

    -- FINANCE : Détecteur d'arnaque (Faux SMS bancaire)
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      13,
      'scam',
      'Sécurité bancaire',
      'Tu reçois ce SMS d''alerte bancaire. D''après toi, arnaque ou authentique ?',
      '{
        "sender": "Alerte-Banque (+33 7 45 12 98 23)",
        "channel": "sms",
        "message": "ALERTE SÉCURITÉ : Un paiement suspect de 489,00 € a été initié. Si vous n''êtes pas à l''origine de cette opération, annulez-la immédiatement sur https://espace-securite-banque-annulation.com",
        "isScam": true,
        "redFlags": [
          "Une banque ne demande JAMAIS d''annuler une opération via un lien par SMS",
          "Le message provient d''un numéro de portable individuel (07)",
          "L''adresse URL mène vers un faux site pirate non sécurisé"
        ]
      }'::jsonb,
      'C''est l''arnaque au faux conseiller / faux débit. Les banques ne vous demandent JAMAIS de cliquer sur un lien pour annuler une fraude. Ouvrez toujours vous-même votre application bancaire officielle.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- SANTÉ : Détecteur d'arnaque (Faux SMS Carte Vitale)
  IF l_sante_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_sante_id,
      12,
      'scam',
      'Arnaque Carte Vitale',
      'Tu reçois ce message sur ton téléphone. S''agit-il d''un message authentique ou d''une arnaque ?',
      '{
        "sender": "Assurance-Maladie (+33 6 88 19 02 43)",
        "channel": "sms",
        "message": "Assurance Maladie : Votre nouvelle carte Vitale est prête. Veuillez confirmer votre adresse et vous acquitter des frais d''envoi (2,60 €) : https://ameli-portail-renouvellement.fr",
        "isScam": true,
        "redFlags": [
          "La carte Vitale est 100% gratuite (l''Assurance maladie ne facture jamais d''envoi)",
          "L''Assurance maladie n''envoie pas de SMS depuis un numéro mobile en 06/07",
          "L''adresse officielle est uniquement ameli.fr"
        ]
      }'::jsonb,
      'La carte Vitale est toujours 100% gratuite. Tout SMS vous demandant de payer des frais d''envoi est une tentative d''escroquerie (phishing).'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- LOGEMENT : Tri en bac (Charges : Locataire vs Propriétaire)
  IF l_logement_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      10,
      'bucket',
      'Entretien et réparations',
      'Qui doit payer ? Classe chaque réparation dans le bon bac :',
      '{
        "buckets": [
          {"id": "b1", "label": "Locataire", "color": "#3B82F6"},
          {"id": "b2", "label": "Propriétaire", "color": "#8B5CF6"}
        ],
        "items": [
          {"id": "1", "text": "Remplacement du chauffe-eau vétuste", "bucketId": "b2"},
          {"id": "2", "text": "Remplacement d''une ampoule grillée", "bucketId": "b1"},
          {"id": "3", "text": "Réfection de la toiture de l''immeuble", "bucketId": "b2"},
          {"id": "4", "text": "Entretien annuel de la chaudière", "bucketId": "b1"}
        ]
      }'::jsonb,
      'Le locataire paie l''entretien courant et les petites réparations d''usage. Le propriétaire a la charge de la vétusté et des gros travaux sur l''immeuble et les équipements.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;

    -- LOGEMENT : Détecteur d'arnaque (Fausse annonce immobilière avec mandat)
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      11,
      'scam',
      'Arnaque à la location',
      'Tu cherches un appartement et reçois ce mail d''un propriétaire. Arnaque ou authentique ?',
      '{
        "sender": "jean-pierre.bailleur@gmail.com",
        "channel": "email",
        "message": "Bonjour, étant actuellement muté à l''étranger, pour réserver la visite de l''appartement de 45m² à 400€/mois, merci de déposer un mandat postal de 800€ à titre de garantie avant la visite pour prouver votre solvabilité.",
        "isScam": true,
        "redFlags": [
          "Un loyer anormalement bas par rapport au marché",
          "Le prétexte du propriétaire muté à l''étranger qui ne peut pas se déplacer",
          "Il est STRICTEMENT ILLÉGAL d''exiger de l''argent avant la signature du bail et la visite"
        ]
      }'::jsonb,
      'Ne versez JAMAIS d''argent (virement, mandat cash, recharge) avant d''avoir visité le logement et signé un bail en bonne et due forme.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- ADMINISTRATION : Détecteur d'arnaque (Faux SMS Amende ANTAI)
  IF l_admin_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_admin_id,
      9,
      'scam',
      'Fausse amende ANTAI',
      'Tu reçois cette notification SMS concernant une amende. D''après toi, arnaque ou authentique ?',
      '{
        "sender": "Info-ANTAI (+33 7 69 41 85 10)",
        "channel": "sms",
        "message": "ANTAI : Vous avez un retard de paiement pour une infraction de stationnement de 35,00 €. Dossier n°48291. Réglez sous 24h avant majoration : https://antai-gouv-contravention-dossier.org",
        "isScam": true,
        "redFlags": [
          "L''ANTAI n''envoie JAMAIS de SMS pour des amendes sans courrier préalable",
          "L''urgence menaçante avec délai de 24h",
          "Le site officiel des amendes est uniquement 'amendes.gouv.fr'"
        ]
      }'::jsonb,
      'L''ANTAI ne contacte jamais par SMS pour réclamer de l''argent. Le seul site officiel pour payer des amendes est amendes.gouv.fr.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

END $$;
