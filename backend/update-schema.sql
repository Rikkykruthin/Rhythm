-- ============================================
-- Jam Nights - Add User Authentication
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add user_id column to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);

-- 4. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (allow all for now - can be secured later)
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS users_select_all ON public.users;
  DROP POLICY IF EXISTS bookings_select_all ON public.bookings;
  
  -- Create new policies
  CREATE POLICY users_select_all ON public.users 
    FOR SELECT USING (true);
    
  CREATE POLICY bookings_select_all ON public.bookings 
    FOR SELECT USING (true);
END $$;

-- 6. Verify tables exist
SELECT 'Users table created!' as status 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

SELECT 'Bookings table updated!' as status 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id';
