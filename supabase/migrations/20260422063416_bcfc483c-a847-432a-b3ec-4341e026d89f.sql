-- Table to store a single global completion-criteria configuration
CREATE TABLE public.completion_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  min_reflection_words INTEGER NOT NULL DEFAULT 10 CHECK (min_reflection_words >= 0),
  min_vocab_answers INTEGER NOT NULL DEFAULT 5 CHECK (min_vocab_answers >= 0),
  min_grammar_answers INTEGER NOT NULL DEFAULT 3 CHECK (min_grammar_answers >= 0),
  require_inquiry BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.completion_criteria ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can read the criteria (students need it to see their progress)
CREATE POLICY "Authenticated can read criteria"
ON public.completion_criteria
FOR SELECT
TO authenticated
USING (true);

-- Only teachers may insert/update the criteria
CREATE POLICY "Teachers can insert criteria"
ON public.completion_criteria
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update criteria"
ON public.completion_criteria
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'))
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE TRIGGER touch_completion_criteria_updated_at
BEFORE UPDATE ON public.completion_criteria
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed the singleton row with defaults
INSERT INTO public.completion_criteria (singleton) VALUES (true);