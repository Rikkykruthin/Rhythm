-- Run this in Supabase SQL editor

-- 1. Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  name text not null,
  phone text not null,
  email text not null,
  qty int not null check (qty between 1 and 10),
  total_amount int not null,
  razorpay_payment_id text,
  status text not null default 'paid' check (status in ('paid','used','cancelled')),
  scanned boolean default false,
  scanned_at timestamptz,
  created_at timestamptz not null default now(),
  user_id uuid -- Add this column for user association
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes
create index if not exists bookings_ticket_id_idx on public.bookings(ticket_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON public.users(phone);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);

-- 4. Enable RLS (Row Level Security)
alter table public.bookings enable row level security;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (allow all for now, can be secured later)
CREATE POLICY bookings_select_all ON public.bookings FOR SELECT USING (true);
CREATE POLICY users_select_all ON public.users FOR SELECT USING (true);

