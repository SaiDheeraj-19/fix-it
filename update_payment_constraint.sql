-- Allow 'Cash' and 'Card' in payment_mode check constraint
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_mode_check') THEN 
        ALTER TABLE orders DROP CONSTRAINT orders_payment_mode_check; 
    END IF; 
END $$;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_mode_check 
CHECK (payment_mode IN ('UPI', 'COD', 'Cash', 'Card'));
