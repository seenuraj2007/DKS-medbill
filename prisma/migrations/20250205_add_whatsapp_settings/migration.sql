-- Migration: Add WhatsApp and Product Settings tables
-- Created: 2026-02-05
-- Fixed: Works with existing database structure

-- Create WhatsApp Settings table (without foreign key for flexibility)
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    phone_number TEXT,
    notify_low_stock BOOLEAN NOT NULL DEFAULT true,
    notify_out_of_stock BOOLEAN NOT NULL DEFAULT true,
    notify_purchase_orders BOOLEAN NOT NULL DEFAULT true,
    notify_daily_summary BOOLEAN NOT NULL DEFAULT false,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Product Settings table (without foreign key for flexibility)
CREATE TABLE IF NOT EXISTS product_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL UNIQUE,
    default_reorder_point INTEGER NOT NULL DEFAULT 10,
    default_unit TEXT NOT NULL DEFAULT 'PCS',
    enable_barcodes BOOLEAN NOT NULL DEFAULT true,
    track_expiry_dates BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_tenant_id ON whatsapp_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_settings_tenant_id ON product_settings(tenant_id);

-- Add comments
COMMENT ON TABLE whatsapp_settings IS 'Stores WhatsApp notification settings for each organization';
COMMENT ON TABLE product_settings IS 'Stores default product settings for each organization';

-- Verify tables were created
SELECT 'whatsapp_settings table created' as status WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'whatsapp_settings'
);

SELECT 'product_settings table created' as status WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'product_settings'
);
