-- ==============================================================================
-- SAIT ASK US ANYTHING — DATABASE INITIALIZATION SCRIPT (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Execute this script in your Supabase Project's SQL Editor (Dashboard > SQL Editor)
-- This sets up the schema, security policies, indexes, and Realtime replication.
-- ==============================================================================

-- 1. Create table for anonymous questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL CHECK (char_length(trim(question)) > 0 AND char_length(question) <= 500),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index for fast sorting and filtering
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions (status);

-- 3. Create singleton table for shared projector session state
CREATE TABLE IF NOT EXISTS public.session_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    current_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Seed initial singleton row if not present
INSERT INTO public.session_state (id, current_question_id, updated_at)
VALUES (1, NULL, now())
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_state ENABLE ROW LEVEL SECURITY;

-- Anonymous students can insert questions (with length restrictions enforced by table check)
DROP POLICY IF EXISTS "Allow anonymous question insert" ON public.questions;
CREATE POLICY "Allow anonymous question insert"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (char_length(trim(question)) > 0 AND char_length(question) <= 500);

-- Public can read pending and answered questions (hidden questions are withheld from public)
DROP POLICY IF EXISTS "Allow public read visible questions" ON public.questions;
CREATE POLICY "Allow public read visible questions"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (status IN ('pending', 'answered'));

-- Public can read session state (so the live projector can see the current question)
DROP POLICY IF EXISTS "Allow public read session state" ON public.session_state;
CREATE POLICY "Allow public read session state"
ON public.session_state
FOR SELECT
TO anon, authenticated
USING (true);

-- Note: All administrative actions (updating question status, hiding, deleting,
-- updating session state, resetting) are handled server-side via Supabase Service Role Key,
-- which bypasses RLS securely after server-side PIN authentication.

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
-- This allows browser clients (/display and /admin) to receive instant change events
-- without polling.
BEGIN;
  -- Add questions table to supabase_realtime publication
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'questions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
    END IF;
  END
  $$;

  -- Add session_state table to supabase_realtime publication
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'session_state'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.session_state;
    END IF;
  END
  $$;
COMMIT;
