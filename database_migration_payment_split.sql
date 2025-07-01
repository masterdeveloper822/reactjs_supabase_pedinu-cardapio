-- Migration: Add Payment Split System
-- Date: 2024-01-XX
-- Description: Adds payment split functionality with Mercado Pago integration

-- 1. Add payment-related fields to business_settings table
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS mercadopago_public_key TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_access_token TEXT;

-- 2. Create payments table for tracking all transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    preference_id TEXT NOT NULL UNIQUE,
    payment_id TEXT,
    business_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    business_amount DECIMAL(10,2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    payment_method TEXT NOT NULL,
    items JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_business_user_id ON payments(business_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_preference_id ON payments(preference_id);

-- 4. Create RLS policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Business users can only see their own payments
CREATE POLICY "Business users can view their own payments" ON payments
    FOR SELECT USING (business_user_id = auth.uid());

-- Business users can insert their own payments
CREATE POLICY "Business users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (business_user_id = auth.uid());

-- Business users can update their own payments
CREATE POLICY "Business users can update their own payments" ON payments
    FOR UPDATE USING (business_user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admins can update all payments
CREATE POLICY "Admins can update all payments" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create function to validate payment amounts
CREATE OR REPLACE FUNCTION validate_payment_amounts()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure business_amount + platform_fee = amount
    IF NEW.business_amount + NEW.platform_fee != NEW.amount THEN
        RAISE EXCEPTION 'Payment amounts do not match: business_amount + platform_fee must equal amount';
    END IF;
    
    -- Ensure amounts are positive
    IF NEW.amount <= 0 OR NEW.platform_fee < 0 OR NEW.business_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amounts must be positive';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for payment amount validation
CREATE TRIGGER validate_payment_amounts_trigger
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_amounts();

-- 9. Create view for payment statistics
CREATE OR REPLACE VIEW payment_stats AS
SELECT 
    business_user_id,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN status IN ('rejected', 'cancelled') THEN 1 END) as failed_payments,
    SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN status = 'approved' THEN platform_fee ELSE 0 END) as total_platform_fees,
    SUM(CASE WHEN status = 'approved' THEN business_amount ELSE 0 END) as total_business_revenue,
    AVG(CASE WHEN status = 'approved' THEN amount ELSE NULL END) as average_order_value
FROM payments
GROUP BY business_user_id;

-- 10. RLS policies for the view are inherited from the underlying 'payments' table,
-- so direct policies on the view are not needed and not supported by PostgreSQL.

-- 11. Add comments for documentation
COMMENT ON TABLE payments IS 'Tracks all payment transactions with automatic split between business and platform';
COMMENT ON COLUMN payments.platform_fee IS 'Amount retained by the platform (percentage of total amount)';
COMMENT ON COLUMN payments.business_amount IS 'Amount that goes directly to the business account';
COMMENT ON COLUMN payments.preference_id IS 'Mercado Pago preference ID for the payment';
COMMENT ON COLUMN payments.payment_id IS 'Mercado Pago payment ID (set after payment is processed)';

-- 12. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT SELECT ON payment_stats TO authenticated;

-- End of migration 