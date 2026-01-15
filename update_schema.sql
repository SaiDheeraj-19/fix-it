-- Run this query in your Supabase SQL Editor to fix the missing columns issue

-- Add is_sold_out column for tracking inventory status
alter table products 
add column if not exists is_sold_out boolean default false;

-- Add is_hidden column for soft-deleting/hiding products
alter table products 
add column if not exists is_hidden boolean default false;

-- Add a comment to documented what we did
comment on column products.is_sold_out is 'If true, customers cannot add to cart';
comment on column products.is_hidden is 'If true, product is hidden from store but kept in db';
