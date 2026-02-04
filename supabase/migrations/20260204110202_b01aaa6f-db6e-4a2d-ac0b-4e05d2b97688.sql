-- Update registrations access: require authentication to read (no roles)

-- Drop old admin-only policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='registrations' AND policyname='Admins can view all registrations'
  ) THEN
    DROP POLICY "Admins can view all registrations" ON public.registrations;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='registrations' AND policyname='Admins can delete registrations'
  ) THEN
    DROP POLICY "Admins can delete registrations" ON public.registrations;
  END IF;
END $$;

-- Authenticated users can view registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='registrations' AND policyname='Authenticated can view registrations'
  ) THEN
    CREATE POLICY "Authenticated can view registrations"
      ON public.registrations
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Authenticated users can delete registrations (used by Clear all)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='registrations' AND policyname='Authenticated can delete registrations'
  ) THEN
    CREATE POLICY "Authenticated can delete registrations"
      ON public.registrations
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;