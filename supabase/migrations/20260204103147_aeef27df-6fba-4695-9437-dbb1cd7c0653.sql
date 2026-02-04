-- 1) Roles enum (guarded creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- 2) user_roles table for admin/role management
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Allow authenticated users to see their own roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can read own roles'
  ) THEN
    CREATE POLICY "Users can read own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) has_role helper function for RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 4) registrations table with server-side validation
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  group_code text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  constraint registrations_full_name_length
    check (char_length(full_name) between 3 and 100),
  constraint registrations_email_pattern
    check (char_length(email) <= 255 and email ~ '^[0-9]{10}@offpt-edu\\.ma$'),
  constraint registrations_phone_pattern
    check (phone ~ '^(?:\\+212|0)([ \\-]?\\d){9}$'),
  constraint registrations_group_valid
    check (group_code in (
      'DD101','DD102','DD103','DD104','DD105','DD106','DD107',
      'DEVOWS201','DEVOWS202','DEVOWS203','DEVOWS204',
      'ID101','ID102','ID103','ID104',
      'IDOSR201','IDOSR202','IDOSR203','IDOSR204'
    ))
);

alter table public.registrations enable row level security;

-- Anyone (including anonymous) can insert registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'registrations'
      AND policyname = 'Anyone can insert registrations'
  ) THEN
    CREATE POLICY "Anyone can insert registrations"
      ON public.registrations
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Only admins can view all registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'registrations'
      AND policyname = 'Admins can view all registrations'
  ) THEN
    CREATE POLICY "Admins can view all registrations"
      ON public.registrations
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Only admins can delete registrations (optional, for future use)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'registrations'
      AND policyname = 'Admins can delete registrations'
  ) THEN
    CREATE POLICY "Admins can delete registrations"
      ON public.registrations
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;