-- ============================================
-- Drop existing RLS policies (run first if they exist)
-- ============================================

DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Owners can update user roles" ON users;
DROP POLICY IF EXISTS "Organization members can read organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read their own products" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Users can read their own locations" ON locations;
DROP POLICY IF EXISTS "Users can create locations" ON locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON locations;
DROP POLICY IF EXISTS "Users can read their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can create suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can read product stock" ON product_stock;
DROP POLICY IF EXISTS "Users can update product stock" ON product_stock;
DROP POLICY IF EXISTS "Users can read stock history" ON stock_history;
DROP POLICY IF EXISTS "Users can insert stock history" ON stock_history;
DROP POLICY IF EXISTS "Users can read their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can read their own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can create purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can update their own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can delete their own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can read purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can insert purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can read their own stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Users can create stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Users can update their own stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Users can delete their own stock transfers" ON stock_transfers;
DROP POLICY IF EXISTS "Users can read stock transfer items" ON stock_transfer_items;
DROP POLICY IF EXISTS "Users can read their own customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
DROP POLICY IF EXISTS "Users can read their own sales" ON sales;
DROP POLICY IF EXISTS "Users can create sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
DROP POLICY IF EXISTS "Users can read sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can read subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Everyone can read subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can read their own password reset tokens" ON password_reset_tokens;

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS Table
-- ============================================

CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Owners can update user roles"
  ON users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner' AND organization_id = users.organization_id
    )
  );

-- ============================================
-- ORGANIZATIONS Table
-- ============================================

CREATE POLICY "Organization members can read organizations"
  ON organizations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = organizations.id
    )
  );

CREATE POLICY "Owners can update organizations"
  ON organizations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = organizations.owner_id
    )
  );

-- ============================================
-- PRODUCTS Table
-- ============================================

CREATE POLICY "Users can read their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- LOCATIONS Table
-- ============================================

CREATE POLICY "Users can read their own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SUPPLIERS Table
-- ============================================

CREATE POLICY "Users can read their own suppliers"
  ON suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PRODUCT_STOCK Table
-- ============================================

CREATE POLICY "Users can read product stock"
  ON product_stock FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_stock.product_id
    )
  );

CREATE POLICY "Users can update product stock"
  ON product_stock FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_stock.product_id
    )
  );

-- ============================================
-- STOCK_HISTORY Table
-- ============================================

CREATE POLICY "Users can read stock history"
  ON stock_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = stock_history.product_id
    )
  );

CREATE POLICY "Users can insert stock history"
  ON stock_history FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = stock_history.product_id
    )
  );

-- ============================================
-- ALERTS Table
-- ============================================

CREATE POLICY "Users can read their own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- PURCHASE_ORDERS Table
-- ============================================

CREATE POLICY "Users can read their own purchase orders"
  ON purchase_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchase orders"
  ON purchase_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders"
  ON purchase_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders"
  ON purchase_orders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PURCHASE_ORDER_ITEMS Table
-- ============================================

CREATE POLICY "Users can read purchase order items"
  ON purchase_order_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id
    )
  );

CREATE POLICY "Users can insert purchase order items"
  ON purchase_order_items FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id
    )
  );

-- ============================================
-- STOCK_TRANSFERS Table
-- ============================================

CREATE POLICY "Users can read their own stock transfers"
  ON stock_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create stock transfers"
  ON stock_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock transfers"
  ON stock_transfers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock transfers"
  ON stock_transfers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STOCK_TRANSFER_ITEMS Table
-- ============================================

CREATE POLICY "Users can read stock transfer items"
  ON stock_transfer_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM stock_transfers WHERE id = stock_transfer_items.stock_transfer_id
    )
  );

-- ============================================
-- CUSTOMERS Table
-- ============================================

CREATE POLICY "Users can read their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SALES Table
-- ============================================

CREATE POLICY "Users can read their own sales"
  ON sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON sales FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SALE_ITEMS Table
-- ============================================

CREATE POLICY "Users can read sale items"
  ON sale_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM sales WHERE id = sale_items.sale_id
    )
  );

-- ============================================
-- AUDIT_LOGS Table
-- ============================================

CREATE POLICY "Users can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = audit_logs.organization_id
    )
  );

-- ============================================
-- SUBSCRIPTIONS Table
-- ============================================

CREATE POLICY "Users can read subscriptions"
  ON subscriptions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE organization_id = subscriptions.organization_id
    )
  );

-- ============================================
-- SUBSCRIPTION_PLANS Table
-- ============================================

CREATE POLICY "Everyone can read subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- ============================================
-- PASSWORD_RESET_TOKENS Table
-- ============================================

CREATE POLICY "Users can read their own password reset tokens"
  ON password_reset_tokens FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = password_reset_tokens.user_id
    )
  );

-- ============================================
-- Done!
-- ============================================
SELECT 'RLS policies created successfully!' as status;
