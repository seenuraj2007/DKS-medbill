# Supabase Migration Guide

This guide will help you migrate the DKS StockAlert application from SQLite to Supabase.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase
3. Get your project URL and anon key from Project Settings > API

## Migration Steps

### 1. Set Environment Variables

Add the following to your `.env` file (or create one if it doesn't exist):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Database Migrations

Go to your Supabase Dashboard > SQL Editor and run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates the main database schema
2. `supabase/migrations/002_subscription_schema.sql` - Creates subscription tables and default plans

### 3. Update the user table for Supabase Auth

Since Supabase manages authentication, you need to sync the auth.users table with your custom users table:

```sql
-- Create function to sync Supabase auth users with custom users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Update Authentication API Routes

The auth routes need to be updated to use Supabase Auth. Here's what needs to change:

- Login: Use `supabase.auth.signInWithPassword()`
- Signup: Use `supabase.auth.signUp()`
- Logout: Use `supabase.auth.signOut()`
- Password Reset: Use `supabase.auth.resetPasswordForEmail()`

### 5. Test the Application

Start the development server and test:
- User registration and login
- Creating products
- Managing inventory
- Any other features you use

## Data Migration (Optional)

If you have existing data in SQLite that you want to migrate to Supabase:

1. Export your SQLite data
2. Transform the data to match Supabase schema
3. Use Supabase's bulk insert or API to import the data

## Important Notes

- The migration changes the database from SQLite to PostgreSQL (Supabase)
- User IDs are now UUIDs instead of integers
- Auto-incrementing IDs are replaced with UUIDs
- Boolean values are now native PostgreSQL booleans instead of 0/1
- Arrays are supported natively (e.g., for features column)

## Rollback

If you need to rollback to SQLite:

1. Restore the backed-up files:
   - `src/lib/db.sqlite.ts.bak` → `src/lib/db.ts`
   - `src/lib/auth.ts.bak` → `src/lib/auth.ts`
   - `src/lib/subscription.ts.bak` → `src/lib/subscription.ts`

2. Remove the Supabase dependencies:
   ```bash
   npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

3. Update API routes back to use SQLite queries

## Support

If you encounter any issues during migration:
1. Check Supabase logs in the dashboard
2. Review the migration SQL files
3. Make sure all environment variables are set correctly
4. Verify table structures match the migration files
