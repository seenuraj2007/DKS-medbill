# Row Level Security (RLS) Setup Guide

This guide walks you through setting up Row Level Security (RLS) policies for your DKS StockAlert application. RLS ensures users can only access their own data.

## 🚨 CRITICAL FOR PRODUCTION

Without proper RLS policies, any authenticated user could potentially access other users' data. You MUST complete this setup before launching to production.

---

## Prerequisites

- A Supabase project with the dksstockalert database schema already created
- Access to the Supabase Dashboard (SQL Editor)
- Database administrator privileges

---

## Step-by-Step Setup

### Option 1: Using the Supabase Dashboard (Recommended)

1. **Open your Supabase project**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the RLS migration file**
   - Copy the entire contents of `supabase/migrations/004_rls_policies_drop_first.sql`
   - Paste it into the SQL Editor
   - Click "Run"
   - Wait for confirmation that all policies have been applied

---

### Option 2: Using the Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

---

### Option 3: Using psql command line

```bash
# Connect to your Supabase database
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres

# Copy and paste the contents of the migration file
\i supabase/migrations/004_rls_policies_drop_first.sql
```

---

## What the RLS Policies Do

The RLS policies in this migration file:

1. **Enable Row Level Security** on all tables
2. **Restrict data access** based on `user_id`
3. **Allow organization-level access** for team members
4. **Prevent data leakage** between users

### Key Policies

| Table | Read | Create | Update | Delete | Notes |
|-------|------|--------|--------|--------|-------|
| `users` | Own data only | - | Own data + owners update roles | - | Admin controls role changes |
| `products` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `locations` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `suppliers` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `customers` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `sales` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `alerts` | Own data only | - | Own data | - | Read & update status only |
| `stock_transfers` | Own data only | Own data | Own data | Own data | Full CRUD for owner |
| `audit_logs` | All logs | - | - | - | Read-only for all users |
| `subscriptions` | Own data only | - | - | - | Read-only for users |

---

## Verification

After running the migration, verify that RLS is working correctly:

### Test 1: Check RLS is Enabled

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'products', 'locations', 'suppliers', 
    'customers', 'sales', 'alerts', 'stock_transfers'
  )
ORDER BY tablename;
```

**Expected Result:** All tables should show `rowsecurity = true`

### Test 2: Check Policies Exist

```sql
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'products', 'locations', 'suppliers', 
    'customers', 'sales', 'alerts', 'stock_transfers'
  )
ORDER BY tablename, policyname;
```

**Expected Result:** All policies from the migration should be listed

### Test 3: Test Data Isolation (Manual)

1. Create two test users
2. Create a product as user A
3. Log in as user B
4. Try to access user A's product

**Expected Result:** User B should NOT see user A's products

---

## Common Issues & Troubleshooting

### Issue 1: Migration fails with "relation does not exist"

**Cause:** Database schema hasn't been created yet

**Solution:** Run the initial schema migrations first:
```sql
-- Run in this order:
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_subscription_schema.sql
\i supabase/migrations/003_additional_tables.sql
\i supabase/migrations/004_rls_policies_drop_first.sql
```

### Issue 2: Users can't access their own data

**Cause:** RLS is blocking all access

**Solution:** Check that the policies are correctly set:
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';
```

### Issue 3: Team members can't see organization data

**Cause:** Organization-based access not working

**Solution:** Ensure users have correct `organization_id`:
```sql
SELECT id, email, full_name, organization_id, role
FROM users;
```

### Issue 4: "Policies exist" error when running migration

**Cause:** Policies already exist

**Solution:** The migration file handles this - it drops existing policies first. Just run it again.

---

## Environment Variables

After setting up RLS, ensure these environment variables are set in your application:

```bash
# Next.js / Node.js
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code! It should only be used in server-side routes.

---

## Security Best Practices

1. **Always use RLS**: Never disable RLS in production
2. **Test thoroughly**: Use multiple test accounts to verify data isolation
3. **Audit regularly**: Check who has access to what
4. **Use service role key sparingly**: Only for admin operations
5. **Keep policies updated**: Add new policies when you add new tables or columns

---

## Maintenance

### Adding New Tables

When adding new tables, you must create RLS policies for them:

```sql
-- Example for a new table
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data" ON new_table
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own data" ON new_table
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own data" ON new_table
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own data" ON new_table
  FOR DELETE
  USING (user_id = auth.uid());
```

### Updating Existing Policies

If you need to modify a policy:

```sql
-- Drop the old policy
DROP POLICY IF EXISTS "Users can update their own products" ON products;

-- Create a new policy
CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Temporarily Disabling RLS (USE WITH CAUTION!)

Only disable RLS in development/staging, never in production:

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Don't forget to re-enable it!
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

---

## Support

If you encounter issues:

1. Check the Supabase logs in the Dashboard
2. Review the error messages carefully
3. Consult the Supabase documentation: https://supabase.com/docs/guides/auth/row-level-security
4. Search existing issues in GitHub

---

## Checklist

Before launching to production:

- [ ] Run all migration files in order
- [ ] Verify RLS is enabled on all tables
- [ ] Test data isolation with multiple users
- [ ] Verify organization-based access works
- [ ] Ensure environment variables are set
- [ ] Test in staging environment first
- [ ] Document any custom policies
- [ ] Train your team on RLS implications

---

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

---

**Last Updated:** January 2026  
**Version:** 2.0 (DKS StockAlert)
