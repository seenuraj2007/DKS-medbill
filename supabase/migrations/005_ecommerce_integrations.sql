-- ============================================
-- E-commerce Integrations Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Integrations table to store connection settings
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('shopify', 'woocommerce')),
  store_name VARCHAR(255) NOT NULL,
  store_url VARCHAR(500) NOT NULL,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_products BOOLEAN DEFAULT true,
  sync_orders BOOLEAN DEFAULT true,
  sync_inventory BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),
  last_sync_error TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, store_url)
);

-- Sync logs for tracking sync history
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('products', 'orders', 'inventory')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External product mappings (links local products to external)
CREATE TABLE IF NOT EXISTS product_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  external_variant_id VARCHAR(255),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, integration_id)
);

-- External order mappings
CREATE TABLE IF NOT EXISTS order_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  local_order_id UUID,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  external_order_id VARCHAR(255) NOT NULL,
  external_order_number VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, external_order_id)
);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own integrations"
  ON integrations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sync logs"
  ON integration_sync_logs FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM integrations WHERE id = integration_sync_logs.integration_id)
  );

CREATE POLICY "Users can manage their own product mappings"
  ON product_mappings FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM integrations WHERE id = product_mappings.integration_id)
  );

CREATE POLICY "Users can manage their own order mappings"
  ON order_mappings FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM integrations WHERE id = order_mappings.integration_id)
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX idx_product_mappings_product_id ON product_mappings(product_id);
CREATE INDEX idx_product_mappings_integration_id ON product_mappings(integration_id);
CREATE INDEX idx_order_mappings_integration_id ON order_mappings(integration_id);

SELECT 'E-commerce integrations schema created successfully!' as status;
