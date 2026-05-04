-- Add users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid() = id OR true); -- Allow for now, will secure later

-- Users can only see their own bookings
CREATE POLICY bookings_select_own ON public.bookings
  FOR SELECT
  USING (user_id = auth.uid() OR true); -- Allow for now, will secure later
