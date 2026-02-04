-- Remove pattern/format enforcement from DB (validation will be client-side only)
ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_full_name_length,
  DROP CONSTRAINT IF EXISTS registrations_email_pattern,
  DROP CONSTRAINT IF EXISTS registrations_phone_pattern,
  DROP CONSTRAINT IF EXISTS registrations_group_valid;