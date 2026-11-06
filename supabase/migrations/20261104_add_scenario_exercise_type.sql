-- ====================================================================
-- MIGRATION: Ajout du type d'exercice 'scenario' (Cas pratique / Mise en situation)
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

  -- Recréer la contrainte avec les 7 types d'exercices
  ALTER TABLE public.lesson_questions
  ADD CONSTRAINT lesson_questions_type_check
  CHECK (type IN ('qcm', 'order', 'matching', 'document', 'bucket', 'scam', 'scenario'));
END $$;

-- 2. Insertion d'exercices de Cas Pratique (Mise en situation interactive)

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

  -- FINANCE : Cas pratique (Gestion d'imprévu en fin de mois)
  IF l_finance_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_finance_id,
      14,
      'scenario',
      'Cas pratique budget',
      'Aide Maxime à résoudre son imprévu financier de fin de mois.',
      '{
        "context": "Maxime, 21 ans, est étudiant et apprenti. Il lui reste 35 € sur son compte en banque alors que sa paie tombe dans 10 jours. Sa machine à laver vient de lâcher et une facture d''électricité de 55 € arrive dans 3 jours.",
        "persona": {
          "name": "Maxime",
          "role": "Apprenti 21 ans"
        },
        "keyFacts": [
          {"label": "Solde compte", "value": "35 €"},
          {"label": "Facture énergie", "value": "55 €"},
          {"label": "Délai paie", "value": "10 jours"}
        ],
        "options": [
          {
            "id": "opt1",
            "text": "Demander un report d''échéance au fournisseur et utiliser une laverie le temps d''être payé",
            "correct": true,
            "consequence": "Super réflexe ! Les fournisseurs d''énergie décalent facilement un prélèvement sans frais si on prévient avant, et la laverie dépanne à moindre coût."
          },
          {
            "id": "opt2",
            "text": "Laisser le prélèvement passer et acheter une machine neuve à crédit en magasin",
            "correct": false,
            "consequence": "Attention : le prélèvement sera rejeté avec environ 20 € de frais bancaires d''agios, et le crédit aggravera le budget du mois prochain."
          },
          {
            "id": "opt3",
            "text": "Souscrire un mini-prêt express à 20% d''intérêts sur Internet",
            "correct": false,
            "consequence": "Piège coûteux : les taux de ces crédits rapides sont disproportionnés et créent un engrenage de dettes."
          }
        ]
      }'::jsonb,
      'Anticiper et communiquer avec ses créanciers avant la date d''échéance évite les frais de rejet et l''endettement.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- SANTÉ : Cas pratique (Consultation médicale sans médecin traitant)
  IF l_sante_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_sante_id,
      13,
      'scenario',
      'Cas pratique santé',
      'Aide Sarah à choisir la bonne démarche pour sa consultation médicale.',
      '{
        "context": "Sarah a une forte fièvre et une toux persistante depuis 48h. Elle vient d''emménager dans une nouvelle ville pour ses études et n''a pas encore de médecin traitant déclaré ici.",
        "persona": {
          "name": "Sarah",
          "role": "Étudiante 19 ans"
        },
        "keyFacts": [
          {"label": "Symptôme", "value": "Fièvre 39°C"},
          {"label": "Statut", "value": "Nouveau déménagement"}
        ],
        "options": [
          {
            "id": "s1",
            "text": "Prendre RDV chez un généraliste de secteur 1 proche et lui demander d''être son médecin traitant déclaré",
            "correct": true,
            "consequence": "La démarche idéale ! Le médecin peut télétransmettre la déclaration directement avec la carte Vitale, garantissant 70% de remboursement Sécu."
          },
          {
            "id": "s2",
            "text": "Aller directement aux urgences de l''hôpital public pour une consultation rapide",
            "correct": false,
            "consequence": "Mauvais réflexe : les urgences sont réservées aux détresses vitales. Tu risques d''attendre 6 à 8 heures et d''encombrer le service."
          },
          {
            "id": "s3",
            "text": "Attendre plusieurs semaines de rentrer chez ses parents sans consulter",
            "correct": false,
            "consequence": "Dangereux pour la santé : une forte fièvre persistante nécessite un avis médical rapide pour éviter une surinfection."
          }
        ]
      }'::jsonb,
      'Déclarer un nouveau médecin traitant lors d''une consultation de proximité permet d''être soigné rapidement et remboursé au maximum.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- LOGEMENT : Cas pratique (Dossier de candidature & protection d'identité)
  IF l_logement_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_logement_id,
      12,
      'scenario',
      'Cas pratique logement',
      'Aide Chloé à sécuriser sa candidature pour son premier studio.',
      '{
        "context": "Chloé a repéré une annonce séduisante. Le propriétaire lui demande d''envoyer par e-mail son dossier complet (CNI, avis d''imposition de ses parents, fiches de paie, RIB) avant même de confirmer la visite.",
        "persona": {
          "name": "Chloé",
          "role": "Étudiante en recherche"
        },
        "keyFacts": [
          {"label": "Demande", "value": "Dossier complet par mail"},
          {"label": "Étape", "value": "Avant la visite"}
        ],
        "options": [
          {
            "id": "c1",
            "text": "Utiliser le service public gratuit DossierFacile pour filigraner tous ses documents avec la mention ''Location uniquement''",
            "correct": true,
            "consequence": "Parfait ! Le filigrane officiel empêche les escrocs d''utiliser tes pièces pour contracter des crédits ou ouvrir des lignes téléphoniques à ton nom."
          },
          {
            "id": "c2",
            "text": "Envoyer tous les scans originaux haute résolution sans protection",
            "correct": false,
            "consequence": "Gros danger : les documents non filigranés sont la cible numéro un des réseaux d''usurpation d''identité sur les sites de petites annonces."
          },
          {
            "id": "c3",
            "text": "Ajouter en plus son code confidentiel bancaire pour prouver sa solvabilité",
            "correct": false,
            "consequence": "Erreur fatale : un propriétaire n''a JAMAIS le droit de demander de code bancaire ni d''extrait de compte détaillé."
          }
        ]
      }'::jsonb,
      'Toujours protéger ses justificatifs personnels avec DossierFacile ou un filigrane indélébile avant de les transmettre.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

  -- ADMINISTRATION : Cas pratique (Changement de situation CAF)
  IF l_admin_id IS NOT NULL THEN
    INSERT INTO public.lesson_questions (lesson_id, order_index, type, category, prompt, options, explanation)
    VALUES (
      l_admin_id,
      10,
      'scenario',
      'Cas pratique démarches',
      'Aide Thomas à gérer son changement de statut auprès de la CAF.',
      '{
        "context": "Thomas touchait 180 € d''APL en tant qu''étudiant. Il vient de signer son premier CDI début septembre avec un salaire net de 1 650 €. Il se demande s''il doit faire une démarche ou attendre la révision automatique annuelle.",
        "persona": {
          "name": "Thomas",
          "role": "Nouveau jeune actif"
        },
        "keyFacts": [
          {"label": "Ancien statut", "value": "Étudiant (180 € APL)"},
          {"label": "Nouveau statut", "value": "CDI 1 650 € net"}
        ],
        "options": [
          {
            "id": "t1",
            "text": "Déclarer immédiatement son nouveau statut professionnel dans l''espace ''Mon Compte'' sur caf.fr",
            "correct": true,
            "consequence": "La règle d''or ! Déclarer sous 30 jours évite le trop-perçu. Si la CAF continue de verser par erreur, elle réclamera le remboursement intégral plusieurs mois après."
          },
          {
            "id": "t2",
            "text": "Ne rien dire et continuer à encaisser les APL tant que la CAF ne demande rien",
            "correct": false,
            "consequence": "Gros piège financier : les données fiscales et de paie sont automatiquement croisées. Tu devras rembourser des centaines d''euros d''un coup."
          },
          {
            "id": "t3",
            "text": "Fermer son compte bancaire pour que la CAF ne puisse plus prélever",
            "correct": false,
            "consequence": "Totalement inefficace : la dette reste enregistrée et sera recouvrée par mise en demeure ou retenue sur salaire."
          }
        ]
      }'::jsonb,
      'Tout changement de situation (emploi, déménagement, vie de couple) doit être signalé à la CAF dans le mois pour éviter les dettes de trop-perçu.'
    )
    ON CONFLICT (lesson_id, order_index) DO UPDATE
    SET type = EXCLUDED.type, category = EXCLUDED.category, prompt = EXCLUDED.prompt, options = EXCLUDED.options, explanation = EXCLUDED.explanation;
  END IF;

END $$;
