-- Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  monthly_price REAL NOT NULL DEFAULT 0,
  yearly_price REAL NOT NULL DEFAULT 0,
  max_team_members INTEGER NOT NULL DEFAULT 1,
  max_products INTEGER NOT NULL DEFAULT 10,
  max_locations INTEGER NOT NULL DEFAULT 1,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  organization_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  trial_end_date TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider TEXT,
  payment_provider_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, monthly_price, yearly_price, max_team_members, max_products, max_locations, features, is_active) VALUES
('free', 'Free', 'Perfect for personal use', 0, 0, 1, 10, 1, ARRAY['Basic inventory tracking', '1 location', '10 products', 'Email support'], true),
('starter', 'Starter', 'Great for small businesses', 9, 90, 3, 100, 5, ARRAY['All features in Free', 'Up to 3 team members', 'Up to 100 products', 'Up to 5 locations', 'Priority email support'], true),
('pro', 'Professional', 'For growing businesses', 29, 290, 10, 1000, 20, ARRAY['All features in Starter', 'Up to 10 team members', 'Up to 1000 products', 'Up to 20 locations', 'Stock transfers', 'Purchase orders', 'Bulk operations', 'Priority support'], true),
('enterprise', 'Enterprise', 'Custom solutions for large organizations', 99, 990, -1, -1, -1, ARRAY['All features in Pro', 'Unlimited team members', 'Unlimited products', 'Unlimited locations', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'Custom branding'], true)
ON CONFLICT (name) DO NOTHING;

-- Trigger to update subscription_plans updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update organizations updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
