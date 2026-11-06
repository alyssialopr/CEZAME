-- ====================================================================
-- MIGRATION: Ajout du type d'exercice 'document' (Décryptage de document)
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

  -- Recréer la contrainte avec les 4 types d'exercices
  ALTER TABLE public.lesson_questions
  ADD CONSTRAINT lesson_questions_type_check
  CHECK (type IN ('qcm', 'order', 'matching', 'document'));
END $$;

-- 2. Insertion d'exercices de Décryptage de Document dans les leçons existantes

DO $$
DECLARE
  l_sante_id UUID;
  l_finance_id UUID;
  l_logement_id UUID;
BEGIN
  -- Récupérer l'ID de la leçon 1 Santé
  SELECT id INTO l_sante_id FROM public.lessons WHERE category_id = 'sante' AND order_index = 1;
  
  -- Récupérer l'ID de la leçon 1 Finance
  SELECT id INTO l_finance_id FROM public.lessons WHERE category_id = 'finance' AND order_index = 1;

  -- Récupérer l'ID de la leçon 1 Logement
  SELECT id INTO l_logement_id FROM public.lessons WHERE category_id = 'logement' AND order_index = 1;

  -- FINANCE : Décryptage d'une Fiche de Paie
  IF l_finance_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      11,
      'document',
      'Bulletin de paie',
      'Sur cette fiche de paie, quelle ligne indique la somme qui arrive réellement sur ton compte bancaire ?',
      '[
        {"id": "1", "label": "Salaire brut", "value": "2 150,00 €"},
        {"id": "2", "label": "Cotisations salariales", "value": "- 473,00 €"},
        {"id": "3", "label": "Net imposable", "value": "1 720,00 €"},
        {"id": "4", "label": "Net payé en euros (virement)", "value": "1 677,00 €", "correct": true}
      ]'::jsonb,
      'Le "Net payé en euros" est le montant viré sur ton compte bancaire, une fois les cotisations sociales et l''impôt à la source déduits !'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- SANTÉ : Décryptage d'une Ordonnance Médicale
  IF l_sante_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_sante_id,
      11,
      'document',
      'Ordonnance médicale',
      'Sur cette ordonnance, quelle mention indique la durée maximale pour aller chercher tes médicaments en pharmacie ?',
      '[
        {"id": "1", "label": "Prescripteur", "value": "Dr. Martin — Généraliste"},
        {"id": "2", "label": "Délai 1ère délivrance", "value": "Valable 3 mois max", "correct": true},
        {"id": "3", "label": "Traitement", "value": "Amoxicilline 500mg (6 jours)"},
        {"id": "4", "label": "Posologie", "value": "1 gélule matin et soir"}
      ]'::jsonb,
      'Une ordonnance pour des médicaments doit obligatoirement être présentée en pharmacie dans un délai de 3 mois suivant sa prescription pour la première délivrance.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- LOGEMENT : Décryptage d'un Contrat de Bail (Clause Abusive)
  IF l_logement_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      9,
      'document',
      'Contrat de bail',
      'Touche la clause illégale (abusive) figurant sur ce contrat de bail :',
      '[
        {"id": "1", "label": "Loyer mensuel HC", "value": "580,00 €"},
        {"id": "2", "label": "Charges locatives", "value": "65,00 € (provisions)"},
        {"id": "3", "label": "Mode de règlement", "value": "Prélèvement automatique imposé", "correct": true},
        {"id": "4", "label": "Dépôt de garantie", "value": "580,00 € (1 mois HC)"}
      ]'::jsonb,
      'La loi interdit formellement à un propriétaire d''imposer le prélèvement automatique comme mode de paiement unique. Le locataire reste totalement libre de payer par virement ou par chèque.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

END $$;
