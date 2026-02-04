ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_email_pattern;

-- Correct escaping: use a single backslash before the dot in the regex
ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_email_pattern
  CHECK (char_length(email) <= 255 AND email ~ '^[0-9]{13}@ofppt-edu\.ma$');