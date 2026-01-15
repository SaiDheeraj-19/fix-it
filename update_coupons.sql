-- Add limit columns to coupons table
alter table coupons 
add column if not exists max_uses integer default null,
add column if not exists times_used integer default 0;

-- Add coupon_code to orders if tracking is needed (optional but good for history)
alter table orders
add column if not exists coupon_code text;
