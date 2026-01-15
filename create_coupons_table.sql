
-- Create Coupons table if it doesn't exist
create table if not exists coupons (
  code text primary key,
  discount_percentage numeric not null,
  is_active boolean default true,
  max_uses integer default null,
  times_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add coupon_code to orders table
alter table orders 
add column if not exists coupon_code text;

-- Enable Row Level Security (RLS)
alter table coupons enable row level security;

-- Create minimal policies to allow the app to function
-- (In a real production app, restrict writes to authenticated admins)

-- Allow everyone to read coupons (needed for checkout validation)
create policy "Enable read access for all users" 
on coupons for select 
using (true);

-- Allow everyone to insert/update/delete (needed for Admin Dashboard + Usage increment)
-- Since your Admin Check is client-side, we must allow public write access to the DB for this to work via the Anon Key.
create policy "Enable insert for all users" 
on coupons for insert 
with check (true);

create policy "Enable update for all users" 
on coupons for update 
using (true);

create policy "Enable delete for all users" 
on coupons for delete 
using (true);
