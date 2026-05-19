/*
  SUPABASE DATABASE SCHEMA & RLS RULES
  
  Copy and paste this SQL into your Supabase SQL Editor to set up the database.
*/

-- 1. Create Profiles table (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  line_id text,
  address text,
  role text default 'user' check (role in ('admin', 'user')),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text check (category in ('fiberglass', 'plastic', 'rowboat', 'accessory')),
  price numeric not null default 0,
  description text,
  image_url text,
  status text default 'available' check (status in ('available', 'preorder', 'outofstock')),
  specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  user_name text,
  user_phone text,
  user_line_id text,
  items jsonb not null,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'contacting', 'producing', 'shipped', 'cancelled')),
  shipping_address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Set up Row Level Security (RLS)

-- Profiles RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );

-- Products RLS
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on public.products for select using ( true );
create policy "Only admins can modify products." on public.products for all 
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Orders RLS
alter table public.orders enable row level security;
create policy "Users can view their own orders." on public.orders for select 
  using ( auth.uid() = user_id or (select role from public.profiles where id = auth.uid()) = 'admin' );
create policy "Users can create their own orders." on public.orders for insert 
  with check ( auth.uid() = user_id or user_id is null ); -- Allow guest orders if necessary
create policy "Only admins can update orders." on public.orders for update 
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- 5. Storage Buckets (Create via Supabase UI: 'product-images')
-- Policy for product-images:
-- Select: Public
-- Insert/Update/Delete: Authenticated + Admin role
