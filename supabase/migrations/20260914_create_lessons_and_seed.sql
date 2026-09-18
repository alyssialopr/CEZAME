-- ====================================================================
-- MIGRATION: Création des tables de Leçons et Données Initiales (Seed)
-- ====================================================================

-- 1. Table des Unités
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT NOT NULL,
    unit_number INT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (category_id, unit_number)
);

-- 2. Table des Leçons
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    order_index INT NOT NULL,
    title TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (category_id, order_index)
);

-- 3. Fiches de cours (écrans théoriques)
CREATE TABLE IF NOT EXISTS public.lesson_screens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tip TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lesson_id, order_index)
);

-- 4. Questions du Quiz
CREATE TABLE IF NOT EXISTS public.lesson_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    options JSONB NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lesson_id, order_index)
);

-- 5. Progression de l'utilisateur par leçon
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('locked', 'unlocked', 'completed')),
    score INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

-- RLS (Row Level Security)
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for units') THEN
    CREATE POLICY "Public read for units" ON public.units FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for lessons') THEN
    CREATE POLICY "Public read for lessons" ON public.lessons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for lesson_screens') THEN
    CREATE POLICY "Public read for lesson_screens" ON public.lesson_screens FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for lesson_questions') THEN
    CREATE POLICY "Public read for lesson_questions" ON public.lesson_questions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User progress view own') THEN
    CREATE POLICY "User progress view own" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'User progress insert/update own') THEN
    CREATE POLICY "User progress insert/update own" ON public.user_lesson_progress FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ====================================================================
-- SEED DATA: Données initiales pour chaque catégorie
-- ====================================================================

DO $$
DECLARE
  u_sante_1 UUID;
  u_sante_2 UUID;
  l_sante_1 UUID;
BEGIN
  -- Unité 1 pour Santé
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('sante', 1, 'Unité 1', 'Prendre soin de toi', 1)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_sante_1;

  -- Unité 2 pour Santé
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('sante', 2, 'Unité 2', 'Approfondissement', 2)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_sante_2;

  -- Leçon 1 (active avec contenu)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_sante_1, 'sante', 1, 'Se soigner sans galérer', 50)
  ON CONFLICT (category_id, order_index) DO UPDATE SET title = EXCLUDED.title, unit_id = EXCLUDED.unit_id
  RETURNING id INTO l_sante_1;

  -- Nettoyage des écrans et questions précédents pour ré-exécution sans duplication
  DELETE FROM public.lesson_screens WHERE lesson_id = l_sante_1;
  DELETE FROM public.lesson_questions WHERE lesson_id = l_sante_1;

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_sante_1, 1, 'La Sécu et ta carte Vitale', 'En France, l''Assurance maladie (la « Sécu ») rembourse une partie de tes frais de santé. Ta carte Vitale contient tes droits : tu la présentes à chaque rendez-vous et le remboursement est automatique. Elle est 100 % gratuite — on ne te demandera jamais de payer pour l''obtenir.', 'Bon réflexe : un SMS te demande de payer ta carte Vitale ? C''est une arnaque, toujours.');

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_sante_1, 2, 'Le médecin traitant', 'Tu dois déclarer un médecin traitant : c''est ton médecin de référence. Sans lui, tu sors du « parcours de soins » et la Sécu te rembourse beaucoup moins. La déclaration se fait chez le médecin ou sur ameli.fr, en 2 minutes.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_sante_1, 3, 'Les documents à connaître', 'Attestation de droits : prouve ton rattachement à l''Assurance maladie (téléchargeable sur ameli.fr). Ordonnance : rédigée par un médecin, valable en général 3 mois pour des médicaments. Mutuelle : complémentaire qui rembourse ce que la Sécu ne couvre pas.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_sante_1, 4, 'Les bons réflexes', 'Urgence vitale : appelle le 15 (SAMU). Carte Vitale perdue : déclare la perte sur ameli.fr et commandes-en une nouvelle. Vacances en Europe : demande la carte européenne d''assurance maladie, gratuite, sur Ameli, au moins 15 jours avant le départ.', 'Bon réflexe : le tiers payant = tu n''avances pas les frais. Demande s''il est possible.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 1, 'Le médecin traitant', 'Tu n''as pas déclaré de médecin traitant. Que se passe-t-il ?', '[{"letter":"A","text":"Tu es moins bien remboursé","correct":true},{"letter":"B","text":"On refuse de te soigner"},{"letter":"C","text":"Rien, ça ne change rien"}]'::jsonb, 'Hors parcours de soins, la Sécu rembourse beaucoup moins. Déclarer un médecin traitant prend 2 minutes.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 2, 'La Sécu et ta carte Vitale', 'Commander sa carte Vitale, ça coûte :', '[{"letter":"A","text":"Rien, elle est gratuite","correct":true},{"letter":"B","text":"Environ 25 €"},{"letter":"C","text":"C''est payant après 25 ans"}]'::jsonb, 'Elle est toujours gratuite. Les SMS qui demandent de payer sont des arnaques.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 3, 'Les bons réflexes', 'Urgence vitale : quel numéro tu composes ?', '[{"letter":"A","text":"Le 15 (SAMU)","correct":true},{"letter":"B","text":"Le 3646 (Ameli)"},{"letter":"C","text":"Ton médecin traitant"}]'::jsonb, 'Le 15, c''est le SAMU, 24h/24. Le 3646 sert pour les questions administratives Ameli.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 4, 'Les documents à connaître', 'Une mutuelle (complémentaire santé) sert à :', '[{"letter":"A","text":"Rembourser ce que la Sécu ne couvre pas","correct":true},{"letter":"B","text":"Remplacer la carte Vitale"},{"letter":"C","text":"Choisir ton médecin à ta place"}]'::jsonb, 'La Sécu ne rembourse qu''une partie. La mutuelle complète, par exemple pour les lunettes ou le dentaire.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 5, 'Les bons réflexes', 'Tu as perdu ta carte Vitale. Ton premier réflexe :', '[{"letter":"A","text":"Déclarer la perte sur ameli.fr","correct":true},{"letter":"B","text":"Porter plainte au commissariat"},{"letter":"C","text":"Attendre, une nouvelle arrive toute seule"}]'::jsonb, 'Tout se fait sur ameli.fr — déclaration de perte puis commande d''une nouvelle carte.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 6, 'Les bons réflexes', 'Le tiers payant, c''est :', '[{"letter":"A","text":"Ne pas avancer les frais chez le médecin","correct":true},{"letter":"B","text":"Payer en trois fois"},{"letter":"C","text":"Une carte pour une troisième personne"}]'::jsonb, 'Avec le tiers payant, la Sécu (et parfois la mutuelle) paie directement — tu ne sors rien de ta poche.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 7, 'Les documents à connaître', 'Une ordonnance pour des médicaments est en général valable :', '[{"letter":"A","text":"3 mois","correct":true},{"letter":"B","text":"1 semaine"},{"letter":"C","text":"Sans limite de durée"}]'::jsonb, 'En général 3 mois pour la première délivrance. Passé ce délai, il faut retourner voir le médecin.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_sante_1, 8, 'Les bons réflexes', 'Tu pars en vacances dans l''Union européenne. Côté santé :', '[{"letter":"A","text":"Tu demandes la carte européenne gratuite sur Ameli","correct":true},{"letter":"B","text":"Ta carte Vitale marche partout en Europe"},{"letter":"C","text":"Tu dois payer une assurance à l''aéroport"}]'::jsonb, 'La carte Vitale ne marche qu''en France. La carte européenne d''assurance maladie est gratuite — demande-la 15 jours avant.');

  -- Leçon 2 (débloquée après leçon 1)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_sante_1, 'sante', 2, 'Étape 2 : Mettre en pratique', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 3
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_sante_1, 'sante', 3, 'Étape 3 : Niveau supérieur', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 4 dans Unité 2
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_sante_2, 'sante', 4, 'Étape 4 : Maîtrise complète', 100)
  ON CONFLICT (category_id, order_index) DO NOTHING;

END
$$;

DO $$
DECLARE
  u_finance_1 UUID;
  u_finance_2 UUID;
  l_finance_1 UUID;
BEGIN
  -- Unité 1 pour Finance
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('finance', 1, 'Unité 1', 'Maîtriser ses finances', 1)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_finance_1;

  -- Unité 2 pour Finance
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('finance', 2, 'Unité 2', 'Approfondissement', 2)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_finance_2;

  -- Leçon 1 (active avec contenu)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_finance_1, 'finance', 1, 'Gérer ton argent au quotidien', 50)
  ON CONFLICT (category_id, order_index) DO UPDATE SET title = EXCLUDED.title, unit_id = EXCLUDED.unit_id
  RETURNING id INTO l_finance_1;

  -- Nettoyage des écrans et questions précédents pour ré-exécution sans duplication
  DELETE FROM public.lesson_screens WHERE lesson_id = l_finance_1;
  DELETE FROM public.lesson_questions WHERE lesson_id = l_finance_1;

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_finance_1, 1, 'Ton compte au quotidien', 'Ton compte courant sert à recevoir de l''argent et payer tes dépenses. Le RIB est sa « carte d''identité » : tu le donnes pour recevoir un virement (salaire, CAF) ou autoriser un prélèvement (abonnement, loyer). Un prélèvement peut toujours être annulé depuis ta banque.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_finance_1, 2, 'Le découvert et les agios', 'Être à découvert = avoir un solde négatif. Si ta banque l''autorise, ce n''est pas gratuit : elle prélève des agios (des frais). Sans autorisation, les frais explosent et des paiements peuvent être rejetés. Le découvert n''est pas de l''argent en plus, c''est une dette.', 'Bon réflexe : active les notifications de solde de ton appli bancaire — tu vois le découvert arriver.');

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_finance_1, 3, 'Épargner, même un peu', 'Le Livret A est l''épargne de base : sans risque, sans frais, et l''argent reste disponible à tout moment. Une méthode simple pour ton budget : la règle 50/30/20 — environ 50 % pour les besoins (loyer, courses), 30 % pour les envies, 20 % pour l''épargne.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_finance_1, 4, 'Les réflexes qui sauvent', 'Carte perdue ou volée : fais opposition immédiatement depuis l''appli ou par téléphone — chaque minute compte. Avant de choisir une banque, compare les frais réels : cotisation de carte, tenue de compte, frais à l''étranger. Ils varient beaucoup d''une banque à l''autre.', NULL);

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 1, 'Le découvert et les agios', 'Le découvert autorisé, c''est :', '[{"letter":"A","text":"Un solde négatif toléré, mais avec des frais","correct":true},{"letter":"B","text":"De l''argent gratuit prêté par la banque"},{"letter":"C","text":"Interdit avant 25 ans"}]'::jsonb, 'La banque tolère le négatif mais facture des agios. C''est une dette, pas un bonus.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 2, 'Ton compte au quotidien', 'On te demande ton RIB. C''est pour :', '[{"letter":"A","text":"Recevoir un virement ou mettre en place un prélèvement","correct":true},{"letter":"B","text":"Payer en magasin"},{"letter":"C","text":"Prouver ton identité"}]'::jsonb, 'Le RIB identifie ton compte — indispensable pour le salaire, la CAF ou un abonnement.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 3, 'Le découvert et les agios', 'Les agios, c''est :', '[{"letter":"A","text":"Des frais quand ton compte est à découvert","correct":true},{"letter":"B","text":"Des intérêts que la banque te verse"},{"letter":"C","text":"Une prime de bienvenue"}]'::jsonb, 'Plus tu restes à découvert longtemps, plus les agios s''accumulent.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 4, 'Les réflexes qui sauvent', 'Tu perds ta carte bancaire. Tu fais quoi en premier ?', '[{"letter":"A","text":"Opposition immédiate (appli ou téléphone)","correct":true},{"letter":"B","text":"Tu attends de voir si quelqu''un l''utilise"},{"letter":"C","text":"Tu changes de banque"}]'::jsonb, 'L''opposition bloque la carte instantanément. Attendre, c''est risquer de payer les achats d''un voleur.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 5, 'Épargner, même un peu', 'Le Livret A, c''est :', '[{"letter":"A","text":"Une épargne disponible à tout moment, sans risque","correct":true},{"letter":"B","text":"Un compte bloqué pendant 5 ans"},{"letter":"C","text":"Un placement réservé aux mineurs"}]'::jsonb, 'Tu peux retirer quand tu veux, sans frais. C''est la première brique d''épargne idéale.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 6, 'Ton compte au quotidien', 'Un prélèvement automatique, c''est :', '[{"letter":"A","text":"Une autorisation donnée à un organisme de prélever ton compte","correct":true},{"letter":"B","text":"Impossible à annuler une fois activé"},{"letter":"C","text":"Réservé au paiement des impôts"}]'::jsonb, 'Tu peux le révoquer à tout moment depuis ta banque, par exemple pour stopper un abonnement.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 7, 'Les réflexes qui sauvent', 'Les frais bancaires (carte, tenue de compte) :', '[{"letter":"A","text":"Varient selon les banques, il faut comparer","correct":true},{"letter":"B","text":"Sont fixés par l''État, identiques partout"},{"letter":"C","text":"Sont interdits par la loi"}]'::jsonb, 'D''une banque à l''autre, la même carte peut coûter 0 € ou plus de 100 € par an.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_finance_1, 8, 'Épargner, même un peu', 'La règle 50/30/20 pour gérer son budget, c''est :', '[{"letter":"A","text":"Besoins / envies / épargne","correct":true},{"letter":"B","text":"Loyer / courses / sorties"},{"letter":"C","text":"Un taux d''intérêt bancaire"}]'::jsonb, '50 % besoins, 30 % envies, 20 % épargne — un repère simple, à adapter à ta situation.');

  -- Leçon 2 (débloquée après leçon 1)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_finance_1, 'finance', 2, 'Étape 2 : Mettre en pratique', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 3
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_finance_1, 'finance', 3, 'Étape 3 : Niveau supérieur', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 4 dans Unité 2
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_finance_2, 'finance', 4, 'Étape 4 : Maîtrise complète', 100)
  ON CONFLICT (category_id, order_index) DO NOTHING;

END
$$;

DO $$
DECLARE
  u_administration_1 UUID;
  u_administration_2 UUID;
  l_administration_1 UUID;
BEGIN
  -- Unité 1 pour Administration
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('administration', 1, 'Unité 1', 'Simplifier tes démarches', 1)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_administration_1;

  -- Unité 2 pour Administration
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('administration', 2, 'Unité 2', 'Approfondissement', 2)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_administration_2;

  -- Leçon 1 (active avec contenu)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_administration_1, 'administration', 1, 'Impôts et CAF sans stress', 50)
  ON CONFLICT (category_id, order_index) DO UPDATE SET title = EXCLUDED.title, unit_id = EXCLUDED.unit_id
  RETURNING id INTO l_administration_1;

  -- Nettoyage des écrans et questions précédents pour ré-exécution sans duplication
  DELETE FROM public.lesson_screens WHERE lesson_id = l_administration_1;
  DELETE FROM public.lesson_questions WHERE lesson_id = l_administration_1;

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_administration_1, 1, 'C''est quoi les impôts ?', 'Les impôts financent les services publics : école, routes, hôpitaux. Dès 18 ans, tu as le choix : rester rattaché à la déclaration de tes parents, ou déclarer seul tes revenus. Déclarer est obligatoire même si, au final, tu ne paies rien.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_administration_1, 2, 'La déclaration en pratique', 'Tout se passe sur impots.gouv.fr, chaque printemps. Tu indiques tes revenus de l''année précédente ; l''administration calcule et t''envoie un avis d''imposition. Ce document sert ensuite de justificatif pour plein de démarches : logement, bourses, aides.', 'Bon réflexe : garde tes avis d''imposition au moins 3 ans.');

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_administration_1, 3, 'La CAF et les aides', 'La CAF verse des aides selon ta situation : pour les jeunes, c''est surtout l''aide au logement (APL). Ton dossier a un numéro allocataire — note-le. Pour toute demande, prépare un justificatif de domicile et tes revenus.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_administration_1, 4, 'Les pièges à éviter', 'Piège n°1 : oublier de déclarer un changement de situation (déménagement, emploi) à la CAF. Elle continue de verser, puis réclame le trop-perçu — parfois des centaines d''euros à rembourser. Piège n°2 : oublier la déclaration d''impôts. Si tu es perdu, les espaces France services t''aident gratuitement.', 'Bon réflexe : un changement de situation ? Déclare-le à la CAF dans le mois.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 1, 'C''est quoi les impôts ?', 'À 18 ans, pour les impôts, tu peux :', '[{"letter":"A","text":"Rester rattaché à tes parents ou déclarer seul","correct":true},{"letter":"B","text":"Être obligé de déclarer seul immédiatement"},{"letter":"C","text":"Ne rien faire jusqu''à 25 ans"}]'::jsonb, 'Le rattachement au foyer parental reste possible plusieurs années, souvent avantageux pour les étudiants.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 2, 'La déclaration en pratique', 'La déclaration de revenus se fait principalement :', '[{"letter":"A","text":"En ligne sur impots.gouv.fr","correct":true},{"letter":"B","text":"À la mairie"},{"letter":"C","text":"À la CAF"}]'::jsonb, 'impots.gouv.fr est le site officiel. La déclaration en ligne est la règle.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 3, 'C''est quoi les impôts ?', 'Déclarer ses revenus est obligatoire :', '[{"letter":"A","text":"Même si au final tu ne paies aucun impôt","correct":true},{"letter":"B","text":"Seulement au-dessus de 30 000 € par an"},{"letter":"C","text":"Seulement si tu es propriétaire"}]'::jsonb, 'Déclarer ≠ payer. Et l''avis d''imposition obtenu sert de justificatif pour plein de démarches.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 4, 'La CAF et les aides', 'Pour une demande d''aide à la CAF, on te demande souvent :', '[{"letter":"A","text":"Justificatif de domicile et revenus","correct":true},{"letter":"B","text":"Ton permis de conduire"},{"letter":"C","text":"Ton carnet de santé"}]'::jsonb, 'Les aides dépendent de ta situation et de tes ressources — il faut les prouver.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 5, 'Les pièges à éviter', 'Tu déménages ou tu trouves un emploi. Côté CAF :', '[{"letter":"A","text":"Tu déclares vite le changement pour éviter un trop-perçu","correct":true},{"letter":"B","text":"Tu attends la fin de l''année"},{"letter":"C","text":"Rien, la CAF est prévenue automatiquement"}]'::jsonb, 'Le trop-perçu, c''est de l''argent versé en trop… que la CAF te réclame ensuite. Le piège n°1 des jeunes allocataires.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 6, 'Les pièges à éviter', 'Un courrier recommandé avec accusé de réception sert à :', '[{"letter":"A","text":"Prouver l''envoi et la réception","correct":true},{"letter":"B","text":"Faire arriver la lettre plus vite"},{"letter":"C","text":"Éviter de payer le timbre"}]'::jsonb, 'Indispensable pour les démarches à valeur juridique — résilier un bail, contester une décision…');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 7, 'Les pièges à éviter', 'Tu es perdu dans une démarche en ligne. Qui peut t''aider gratuitement ?', '[{"letter":"A","text":"Un espace France services","correct":true},{"letter":"B","text":"Uniquement un avocat payant"},{"letter":"C","text":"Personne, tu dois te débrouiller"}]'::jsonb, 'Il y en a partout en France — des agents t''accompagnent gratuitement pour la CAF, les impôts, Ameli…');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_administration_1, 8, 'La déclaration en pratique', 'Tes avis d''imposition, tu les gardes :', '[{"letter":"A","text":"Au moins 3 ans","correct":true},{"letter":"B","text":"Tu peux les jeter tout de suite"},{"letter":"C","text":"6 mois maximum"}]'::jsonb, 'L''administration peut te les demander plusieurs années après. Et ils servent de justificatif de revenus.');

  -- Leçon 2 (débloquée après leçon 1)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_administration_1, 'administration', 2, 'Étape 2 : Mettre en pratique', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 3
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_administration_1, 'administration', 3, 'Étape 3 : Niveau supérieur', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 4 dans Unité 2
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_administration_2, 'administration', 4, 'Étape 4 : Maîtrise complète', 100)
  ON CONFLICT (category_id, order_index) DO NOTHING;

END
$$;

DO $$
DECLARE
  u_voiture_1 UUID;
  u_voiture_2 UUID;
  l_voiture_1 UUID;
BEGIN
  -- Unité 1 pour Voiture
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('voiture', 1, 'Unité 1', 'Rouler sereinement', 1)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_voiture_1;

  -- Unité 2 pour Voiture
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('voiture', 2, 'Unité 2', 'Approfondissement', 2)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_voiture_2;

  -- Leçon 1 (active avec contenu)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_voiture_1, 'voiture', 1, 'Rouler en règle', 50)
  ON CONFLICT (category_id, order_index) DO UPDATE SET title = EXCLUDED.title, unit_id = EXCLUDED.unit_id
  RETURNING id INTO l_voiture_1;

  -- Nettoyage des écrans et questions précédents pour ré-exécution sans duplication
  DELETE FROM public.lesson_screens WHERE lesson_id = l_voiture_1;
  DELETE FROM public.lesson_questions WHERE lesson_id = l_voiture_1;

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_voiture_1, 1, 'Le permis probatoire', 'Jeune permis, tu démarres avec 6 points (pas 12). Tu gagnes les autres au fil des années sans infraction. Les règles sont aussi plus strictes : la limite d''alcool est de 0,2 g/L, soit zéro verre en pratique.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_voiture_1, 2, 'L''assurance auto', 'Assurer sa voiture est obligatoire. Le minimum légal est l''assurance « au tiers » : elle couvre les dégâts que TU causes aux autres. La « tous risques » couvre aussi ta propre voiture. La franchise, c''est la somme qui reste à ta charge après un sinistre. Le bonus-malus fait monter ou baisser ta cotisation selon tes accidents responsables.', 'Bon réflexe : rouler sans assurance est un délit — grosse amende et véhicule immobilisable.');

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_voiture_1, 3, 'Les documents du véhicule', 'Carte grise (certificat d''immatriculation) : la « carte d''identité » de la voiture. Si tu achètes une occasion, tu as 1 mois pour la mettre à ton nom, en ligne sur le site de l''ANTS. Contrôle technique : premier passage à 4 ans, puis tous les 2 ans.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_voiture_1, 4, 'Ce qu''il faut retenir', 'Pour rouler en règle, trois choses à jour : permis valide, assurance active, carte grise à ton nom avec contrôle technique OK. Un seul manquant, et tu risques amende, immobilisation, et zéro couverture en cas d''accident.', NULL);

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 1, 'Le permis probatoire', 'Jeune permis (période probatoire) : tu démarres avec :', '[{"letter":"A","text":"6 points","correct":true},{"letter":"B","text":"12 points"},{"letter":"C","text":"0 point"}]'::jsonb, 'Le capital complet de 12 points s''acquiert progressivement, si tu ne commets pas d''infraction.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 2, 'Le permis probatoire', 'Alcool au volant en permis probatoire : la limite est :', '[{"letter":"A","text":"0,2 g/L, soit zéro verre en pratique","correct":true},{"letter":"B","text":"0,5 g/L comme tout le monde"},{"letter":"C","text":"Il n''y a pas de limite précise"}]'::jsonb, '0,2 g/L est atteint dès le premier verre — en probatoire, c''est zéro alcool.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 3, 'L''assurance auto', 'L''assurance minimum obligatoire pour rouler, c''est :', '[{"letter":"A","text":"L''assurance « au tiers » (responsabilité civile)","correct":true},{"letter":"B","text":"L''assurance tous risques"},{"letter":"C","text":"Aucune si la voiture est ancienne"}]'::jsonb, 'Le tiers couvre les dégâts causés aux autres. La tous risques est un plus, pas une obligation.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 4, 'Les documents du véhicule', 'Tu achètes une voiture d''occasion. La carte grise à ton nom :', '[{"letter":"A","text":"Sous 1 mois, en ligne (ANTS)","correct":true},{"letter":"B","text":"Sous 1 an"},{"letter":"C","text":"Ce n''est pas obligatoire"}]'::jsonb, 'Passé 1 mois, tu risques une amende. La démarche se fait entièrement en ligne.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 5, 'Les documents du véhicule', 'Le premier contrôle technique d''une voiture neuve, c''est :', '[{"letter":"A","text":"À 4 ans, puis tous les 2 ans","correct":true},{"letter":"B","text":"Tous les ans dès l''achat"},{"letter":"C","text":"Jamais si elle est bien entretenue"}]'::jsonb, '4 ans après la première mise en circulation, puis tous les 2 ans, quel que soit l''entretien.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 6, 'L''assurance auto', 'Le bonus-malus, c''est :', '[{"letter":"A","text":"Ta cotisation baisse ou monte selon tes accidents responsables","correct":true},{"letter":"B","text":"Un jeu-concours de l''assureur"},{"letter":"C","text":"Une amende de la préfecture"}]'::jsonb, 'Chaque année sans accident responsable fait baisser ta cotisation ; un accident la fait grimper.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 7, 'L''assurance auto', 'La franchise de ton assurance auto, c''est :', '[{"letter":"A","text":"La somme qui reste à ta charge après un sinistre","correct":true},{"letter":"B","text":"Le prix mensuel de l''assurance"},{"letter":"C","text":"Une réduction jeune conducteur"}]'::jsonb, 'Réparation à 800 €, franchise de 300 € → l''assurance paie 500 €, toi 300 €.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_voiture_1, 8, 'L''assurance auto', 'Rouler sans assurance, c''est :', '[{"letter":"A","text":"Un délit : grosse amende, véhicule immobilisable","correct":true},{"letter":"B","text":"Un simple avertissement"},{"letter":"C","text":"Toléré les 6 premiers mois"}]'::jsonb, 'Et en cas d''accident responsable, tu rembourses TOUS les dégâts de ta poche, parfois à vie.');

  -- Leçon 2 (débloquée après leçon 1)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_voiture_1, 'voiture', 2, 'Étape 2 : Mettre en pratique', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 3
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_voiture_1, 'voiture', 3, 'Étape 3 : Niveau supérieur', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 4 dans Unité 2
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_voiture_2, 'voiture', 4, 'Étape 4 : Maîtrise complète', 100)
  ON CONFLICT (category_id, order_index) DO NOTHING;

END
$$;

DO $$
DECLARE
  u_logement_1 UUID;
  u_logement_2 UUID;
  l_logement_1 UUID;
BEGIN
  -- Unité 1 pour Logement
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('logement', 1, 'Unité 1', 'Trouver ton toit', 1)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_logement_1;

  -- Unité 2 pour Logement
  INSERT INTO public.units (category_id, unit_number, title, subtitle, order_index)
  VALUES ('logement', 2, 'Unité 2', 'Approfondissement', 2)
  ON CONFLICT (category_id, unit_number) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
  RETURNING id INTO u_logement_2;

  -- Leçon 1 (active avec contenu)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_logement_1, 'logement', 1, 'Ton premier appart', 50)
  ON CONFLICT (category_id, order_index) DO UPDATE SET title = EXCLUDED.title, unit_id = EXCLUDED.unit_id
  RETURNING id INTO l_logement_1;

  -- Nettoyage des écrans et questions précédents pour ré-exécution sans duplication
  DELETE FROM public.lesson_screens WHERE lesson_id = l_logement_1;
  DELETE FROM public.lesson_questions WHERE lesson_id = l_logement_1;

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_logement_1, 1, 'Le bail, ton contrat', 'Le bail est le contrat entre toi (locataire) et le propriétaire. Il fixe le loyer, les charges, la durée. Lis-le avant de signer : c''est lui qui fait foi en cas de désaccord. Le propriétaire te demandera aussi une attestation d''assurance habitation — elle est obligatoire pour le locataire.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_logement_1, 2, 'Dépôt de garantie et état des lieux', 'Le dépôt de garantie (max 1 mois de loyer hors charges pour un logement vide) est rendu à ton départ… si le logement est en bon état. D''où l''importance de l''état des lieux d''entrée : note TOUT défaut, photos à l''appui. C''est lui qu''on compare à la sortie.', 'Bon réflexe : photographie chaque pièce le jour de l''entrée, avec la date.');

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_logement_1, 3, 'Les aides et le garant', 'L''APL, versée par la CAF, peut réduire ton loyer : fais la simulation sur caf.fr avant même de signer. Le propriétaire demande souvent un garant — quelqu''un qui paiera si tu ne peux plus. Pas de garant ? La garantie Visale (Action Logement) est gratuite pour les jeunes.', NULL);

  INSERT INTO public.lesson_screens (lesson_id, order_index, title, body, tip)
  VALUES (l_logement_1, 4, 'Pendant et après la location', 'Chaque mois, tu peux demander une quittance de loyer gratuite : c''est ta preuve de paiement (utile comme justificatif de domicile). Pour partir : préavis par recommandé — 1 mois en zone tendue (grandes villes), 3 mois ailleurs pour un logement vide.', NULL);

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 1, 'Dépôt de garantie et état des lieux', 'Le dépôt de garantie pour une location vide, c''est au maximum :', '[{"letter":"A","text":"1 mois de loyer hors charges","correct":true},{"letter":"B","text":"3 mois de loyer"},{"letter":"C","text":"Le montant que veut le propriétaire"}]'::jsonb, 'C''est la loi — 1 mois hors charges pour un logement vide (2 mois pour un meublé).');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 2, 'Pendant et après la location', 'En zone tendue (grandes villes), ton préavis de départ est de :', '[{"letter":"A","text":"1 mois","correct":true},{"letter":"B","text":"3 mois dans tous les cas"},{"letter":"C","text":"6 mois"}]'::jsonb, '1 mois en zone tendue, 3 mois ailleurs (logement vide). À envoyer en recommandé avec AR.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 3, 'Dépôt de garantie et état des lieux', 'L''état des lieux d''entrée sert surtout à :', '[{"letter":"A","text":"Comparer avec la sortie pour récupérer ton dépôt de garantie","correct":true},{"letter":"B","text":"Fixer le montant du loyer"},{"letter":"C","text":"Choisir la décoration"}]'::jsonb, 'Tout défaut non noté à l''entrée peut t''être facturé à la sortie. Sois minutieux, prends des photos.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 4, 'Le bail, ton contrat', 'L''assurance habitation quand tu es locataire :', '[{"letter":"A","text":"Obligatoire, à présenter à la signature du bail","correct":true},{"letter":"B","text":"Facultative"},{"letter":"C","text":"Payée par le propriétaire"}]'::jsonb, 'Sans attestation d''assurance, le propriétaire peut refuser de te remettre les clés.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 5, 'Pendant et après la location', 'La quittance de loyer :', '[{"letter":"A","text":"Est gratuite, sur simple demande au propriétaire","correct":true},{"letter":"B","text":"Coûte quelques euros par mois"},{"letter":"C","text":"Est délivrée par la CAF"}]'::jsonb, 'Le propriétaire ne peut pas la facturer. Elle sert aussi de justificatif de domicile.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 6, 'Les aides et le garant', 'Pour savoir si tu as droit aux APL :', '[{"letter":"A","text":"Tu fais une simulation sur caf.fr","correct":true},{"letter":"B","text":"Tu attends un courrier automatique"},{"letter":"C","text":"Tu demandes au propriétaire"}]'::jsonb, 'La simulation est gratuite et rapide — fais-la AVANT de signer pour connaître ton vrai budget.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 7, 'Les aides et le garant', 'Un garant, c''est :', '[{"letter":"A","text":"Quelqu''un qui s''engage à payer si tu ne peux plus","correct":true},{"letter":"B","text":"L''agent immobilier"},{"letter":"C","text":"Un assureur obligatoire"}]'::jsonb, 'Souvent un parent. Il signe un « acte de cautionnement » — engagement sérieux, pas symbolique.');

  INSERT INTO public.lesson_questions (lesson_id, order_index, category, prompt, options, explanation)
  VALUES (l_logement_1, 8, 'Les aides et le garant', 'Personne ne peut se porter garant pour toi. Une solution :', '[{"letter":"A","text":"La garantie Visale, gratuite pour les jeunes","correct":true},{"letter":"B","text":"Impossible de louer sans garant"},{"letter":"C","text":"Payer 6 mois de loyer d''avance (c''est la règle)"}]'::jsonb, 'Visale (Action Logement) se porte garant gratuitement pour les moins de 31 ans. Demande sur visale.fr.');

  -- Leçon 2 (débloquée après leçon 1)
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_logement_1, 'logement', 2, 'Étape 2 : Mettre en pratique', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 3
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_logement_1, 'logement', 3, 'Étape 3 : Niveau supérieur', 50)
  ON CONFLICT (category_id, order_index) DO NOTHING;

  -- Leçon 4 dans Unité 2
  INSERT INTO public.lessons (unit_id, category_id, order_index, title, xp_reward)
  VALUES (u_logement_2, 'logement', 4, 'Étape 4 : Maîtrise complète', 100)
  ON CONFLICT (category_id, order_index) DO NOTHING;

END
$$;
