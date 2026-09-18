-- ====================================================================
-- MIGRATION: Schéma Backoffice (Catégories dynamiques, RBAC, Audit, Brouillons)
-- ====================================================================

-- 1. Table des Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    subtitle TEXT,
    color TEXT NOT NULL DEFAULT '#8FA6FF',
    border_color TEXT NOT NULL DEFAULT '#607FE8',
    icon_name TEXT NOT NULL DEFAULT 'FileText',
    mascot_name TEXT NOT NULL DEFAULT 'RicoEntreprise',
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Assurer la présence des colonnes mascot_name si les tables existent déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'mascot_name'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN mascot_name TEXT NOT NULL DEFAULT 'RicoEntreprise';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'units' 
        AND column_name = 'mascot_name'
    ) THEN
        ALTER TABLE public.units ADD COLUMN mascot_name TEXT DEFAULT NULL;
    END IF;
END $$;

-- Insertion / mise à jour des 5 catégories par défaut avec leurs mascottes contextuelles
INSERT INTO public.categories (id, label, subtitle, color, border_color, icon_name, mascot_name, order_index)
VALUES
    ('sante', 'Santé', 'Prendre soin de toi', '#B4EE83', '#91C85A', 'Plus', 'RicoDocteur', 1),
    ('finance', 'Finance', 'Maîtriser ses finances', '#FDE694', '#DBBA3E', 'Euro', 'RicoEntrepriseDroit', 2),
    ('administration', 'Administration', 'Simplifier tes démarches', '#8FA6FF', '#607FE8', 'FileText', 'RicoEntreprise', 3),
    ('voiture', 'Voiture', 'Rouler sereinement', '#AC84FF', '#8854E8', 'Car', 'RicoBleuTravail', 4),
    ('logement', 'Logement', 'Trouver ton toit', '#FFB55F', '#E88D23', 'Home', 'Riconstruction', 5)
ON CONFLICT (id) DO UPDATE 
SET label = EXCLUDED.label,
    subtitle = EXCLUDED.subtitle,
    color = EXCLUDED.color,
    border_color = EXCLUDED.border_color,
    icon_name = EXCLUDED.icon_name,
    mascot_name = EXCLUDED.mascot_name,
    order_index = EXCLUDED.order_index;

-- 2. Ajout du statut Brouillon / Publié sur les Leçons (si pas déjà présent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'lessons' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.lessons 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'published' 
        CHECK (status IN ('draft', 'published'));
    END IF;
END $$;

-- 3. Table des Rôles Administrateurs (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table des Journaux d'Audit (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Fonctions Helper pour vérifier les rôles depuis Postgres / RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = user_uid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles 
        WHERE user_id = user_uid AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Politiques RLS (Row Level Security)

-- Activation RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Catégories : lecture publique, écriture réservée aux admins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for categories') THEN
    CREATE POLICY "Public read for categories" ON public.categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage categories') THEN
    CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));
  END IF;

  -- Gestion admin pour units, lessons, screens, questions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage units') THEN
    CREATE POLICY "Admins manage units" ON public.units FOR ALL USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage lessons') THEN
    CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage screens') THEN
    CREATE POLICY "Admins manage screens" ON public.lesson_screens FOR ALL USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage questions') THEN
    CREATE POLICY "Admins manage questions" ON public.lesson_questions FOR ALL USING (public.is_admin(auth.uid()));
  END IF;

  -- Admin roles : lecture par les admins ou par le propriétaire de la ligne
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own admin_role') THEN
    CREATE POLICY "Users view own admin_role" ON public.admin_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins manage admin_roles') THEN
    CREATE POLICY "Superadmins manage admin_roles" ON public.admin_roles FOR ALL USING (public.is_superadmin(auth.uid()));
  END IF;

  -- Audit logs : lecture et écriture par les admins
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view audit_logs') THEN
    CREATE POLICY "Admins view audit_logs" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins insert audit_logs') THEN
    CREATE POLICY "Admins insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 7. Procédure utilitaire pour promouvoir un email en superadmin
CREATE OR REPLACE FUNCTION public.make_superadmin_by_email(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
    found_uid UUID;
BEGIN
    SELECT id INTO found_uid FROM auth.users WHERE email = target_email LIMIT 1;
    IF found_uid IS NULL THEN
        RETURN 'Erreur : Utilisateur avec cet email non trouvé dans auth.users';
    END IF;

    INSERT INTO public.admin_roles (user_id, role)
    VALUES (found_uid, 'superadmin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

    RETURN 'Succès : L''utilisateur ' || target_email || ' est maintenant superadmin.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
