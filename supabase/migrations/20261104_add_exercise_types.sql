-- ====================================================================
-- MIGRATION: Ajout des types d'exercices variés (QCM, Remettre dans l'ordre, Association)
-- ====================================================================

-- 1. Ajout de la colonne 'type' dans lesson_questions si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lesson_questions'
      AND column_name = 'type'
  ) THEN
    ALTER TABLE public.lesson_questions
    ADD COLUMN type TEXT NOT NULL DEFAULT 'qcm'
    CHECK (type IN ('qcm', 'order', 'matching'));
  END IF;
END $$;

-- 2. Insertion d'exercices variés dans les leçons existantes

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

  -- SANTÉ : Ajout d'une question "Remettre dans l'ordre" (Chronologie soins)
  IF l_sante_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_sante_id,
      9,
      'order',
      'Le parcours de soins',
      'Remets dans le bon ordre les étapes pour te soigner et être remboursé :',
      '[
        {"id": "1", "text": "Prendre RDV avec ton médecin traitant déclaré"},
        {"id": "2", "text": "Présenter ta carte Vitale en consultation"},
        {"id": "3", "text": "Régler la consultation ou bénéficier du tiers-payant"},
        {"id": "4", "text": "Remboursement automatique Sécu puis Mutuelle"}
      ]'::jsonb,
      'En déclarant ton médecin traitant et en présentant ta carte Vitale, la télétransmission est automatique et le remboursement est maximal.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;

    -- SANTÉ : Ajout d'une question "Bonne association" (Matching rôles)
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_sante_id,
      10,
      'matching',
      'Les bons réflexes',
      'Associe chaque document ou organisme à son rôle exact :',
      '[
        {"id": "1", "left": "Carte Vitale", "right": "Télétransmission des soins"},
        {"id": "2", "left": "Mutuelle", "right": "Complète le remboursement Sécu"},
        {"id": "3", "left": "Ameli.fr", "right": "Télécharger ses attestations"},
        {"id": "4", "left": "Le 15", "right": "Numéro du SAMU (urgences)"}
      ]'::jsonb,
      'Parfait ! Tu maîtrises les acteurs clés de ta santé au quotidien.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- FINANCE : Ajout d'une question "Remettre dans l'ordre" (Opposition carte)
  IF l_finance_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      9,
      'order',
      'Opposition carte bancaire',
      'Tu ne retrouves plus ta carte bancaire. Remets dans le bon ordre tes réflexes :',
      '[
        {"id": "1", "text": "Vérifier immédiatement les derniers paiements sur ton appli"},
        {"id": "2", "text": "Faire opposition d''urgence depuis l''appli ou au 0892 705 705"},
        {"id": "3", "text": "Contacter ta banque pour commander une nouvelle carte"},
        {"id": "4", "text": "Déposer plainte en commissariat s''il s''agit d''un vol"}
      ]'::jsonb,
      'L''opposition immédiate bloque la carte en quelques secondes et évite tout débit frauduleux.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;

    -- FINANCE : Ajout d'une question "Bonne association" (Notions bancaires)
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      10,
      'matching',
      'Vocabulaire bancaire',
      'Associe chaque terme financier à sa définition :',
      '[
        {"id": "1", "left": "RIB", "right": "Identifiant pour virements et salaires"},
        {"id": "2", "left": "Agios", "right": "Frais prélevés en cas de découvert"},
        {"id": "3", "left": "Livret A", "right": "Épargne disponible sans impôt"},
        {"id": "4", "left": "Prélèvement", "right": "Paiement récurrent qu''on peut révoquer"}
      ]'::jsonb,
      'Excellent ! Ce vocabulaire est indispensable pour gérer ton compte sans mauvaises surprises.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- LOGEMENT : Ajout d'une question "Remettre dans l'ordre" (Emménagement)
  IF l_logement_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      9,
      'order',
      'La recherche d''appartement',
      'Remets dans le bon ordre les étapes pour louer un appartement :',
      '[
        {"id": "1", "text": "Constituer son dossier locataire (DossierFacile)"},
        {"id": "2", "text": "Visiter le logement"},
        {"id": "3", "text": "Signer le contrat de bail"},
        {"id": "4", "text": "Réaliser l''état des lieux d''entrée et remise des clés"}
      ]'::jsonb,
      'Rappel d''or : Ne verse JAMAIS un centime avant la signature du bail et l''état des lieux d''entrée !'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;

    -- LOGEMENT : Ajout d'une question "Bonne association" (Papiers logement)
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      10,
      'matching',
      'Papiers du logement',
      'Associe chaque document à sa fonction :',
      '[
        {"id": "1", "left": "Garantie Visale", "right": "Caution gratuite Action Logement"},
        {"id": "2", "left": "Dépôt de garantie", "right": "Caution rendue en fin de bail"},
        {"id": "3", "left": "Quittance de loyer", "right": "Preuve de paiement et justificatif"},
        {"id": "4", "left": "État des lieux", "right": "Constat écrit de l''état du logement"}
      ]'::jsonb,
      'Bravo ! Tu as toutes les clés en main pour constituer un dossier en béton.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

END $$;
