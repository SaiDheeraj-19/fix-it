-- Run this in Supabase SQL Editor to enable Image Uploads

-- 1. Create the 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Allow public read access to the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 3. Allow public upload access (Required since admin login is client-side)
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'images' );
