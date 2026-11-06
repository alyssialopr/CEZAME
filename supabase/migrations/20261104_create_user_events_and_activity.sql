-- ====================================================================
-- MIGRATION: Table des Événements Utilisateurs (Journal d'Activité & Analytics)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,       -- 'screen_view', 'click', 'lesson', 'quiz', 'auth', 'system'
    event_name TEXT NOT NULL,       -- 'screen_view', 'start_lesson', 'complete_lesson', 'answer_question', 'button_click'
    screen_name TEXT,              -- 'HomeScreen', 'Categories', 'LessonScreen', 'ScoreScreen'
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour des requêtes analytiques et de filtrage ultra-rapides
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON public.user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON public.user_events(session_id);

-- Activer Row Level Security (RLS)
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- 1. Les utilisateurs connectés ou anonymes peuvent insérer leurs événements
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_events' AND policyname = 'Allow insert for authenticated and anonymous users'
    ) THEN
        CREATE POLICY "Allow insert for authenticated and anonymous users" 
        ON public.user_events 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- 2. Les utilisateurs peuvent lire leurs propres événements (si besoin)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_events' AND policyname = 'Users can view own events'
    ) THEN
        CREATE POLICY "Users can view own events" 
        ON public.user_events 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Les administrateurs (ou le service role via bypass RLS) ont un accès complet en lecture
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_events' AND policyname = 'Admins can view all events'
    ) THEN
        CREATE POLICY "Admins can view all events" 
        ON public.user_events 
        FOR ALL 
        USING (public.is_admin(auth.uid()));
    END IF;
END $$;
