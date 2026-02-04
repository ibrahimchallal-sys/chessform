-- 1) Tighten RLS on user_roles so only admins can manage roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Admins manage user roles'
  ) THEN
    CREATE POLICY "Admins manage user roles"
      ON public.user_roles
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Note: initial admin assignments can be done via the Supabase SQL editor using the service role,
-- which bypasses RLS, then future changes go through this policy.

-- 2) Update email pattern on registrations to require 13 digits and ofppt-edu.ma
ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_email_pattern;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_email_pattern
  CHECK (char_length(email) <= 255 AND email ~ '^[0-9]{13}@ofppt-edu\\.ma$');