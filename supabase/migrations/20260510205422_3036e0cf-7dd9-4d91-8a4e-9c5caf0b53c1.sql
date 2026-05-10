ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_part_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_part_check CHECK (part = ANY (ARRAY[1, 2, 3, 4]));