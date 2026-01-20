-- Fix: Remove password column requirement since Supabase Auth handles passwords

-- Update existing users to have a placeholder password
UPDATE public.users SET password = 'managed_by_supabase_auth' WHERE password IS NULL;

-- Drop and recreate users table without password column
BEGIN;

-- Save user data
CREATE TEMP TABLE users_backup AS SELECT * FROM public.users;

-- Drop constraints and table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
DROP TABLE IF EXISTS public.users;

-- Recreate without password column
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization_id UUID,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore data
INSERT INTO public.users (id, email, full_name, organization_id, role, status, created_at, updated_at)
SELECT id, email, full_name, organization_id, role, status, created_at, updated_at FROM users_backup;

-- Re-add foreign key constraint
ALTER TABLE public.users ADD CONSTRAINT users_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Re-add trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

SELECT 'Password column removed successfully' as status;
