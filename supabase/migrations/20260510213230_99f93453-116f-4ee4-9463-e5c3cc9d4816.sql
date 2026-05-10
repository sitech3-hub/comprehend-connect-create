-- 1) Make user_email / user_name nullable so trigger can populate them
ALTER TABLE public.submissions ALTER COLUMN user_email DROP NOT NULL;

-- 2) Trigger function: force user_email / user_name from auth.users
CREATE OR REPLACE FUNCTION public.submissions_fill_user_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  SELECT u.email,
         COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name')
    INTO v_email, v_name
  FROM auth.users u
  WHERE u.id = NEW.user_id;

  NEW.user_email := COALESCE(v_email, '');
  NEW.user_name  := v_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_fill_user_identity_trg ON public.submissions;
CREATE TRIGGER submissions_fill_user_identity_trg
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.submissions_fill_user_identity();

-- 3) Backfill teacher roles for any existing matching users
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'teacher'::app_role
FROM auth.users u
WHERE u.email IN ('hongjinwoo@simin.hs.kr', 'sitech3@simin.hs.kr')
ON CONFLICT DO NOTHING;