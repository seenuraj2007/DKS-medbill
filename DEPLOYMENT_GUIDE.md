# DKS StockAlert Deployment Guide for Vercel

This guide walks you through deploying DKS StockAlert to production using Vercel.

---

## Prerequisites

Before deploying, ensure you have:

- [ ] A GitHub repository with the DKS StockAlert code
- [ ] A Vercel account (free tier is sufficient)
- [ ] A Supabase project with the database schema set up
- [ ] Row Level Security (RLS) policies applied (see `RLS_SETUP_GUIDE.md`)
- [ ] All environment variables ready

---

## Step 1: Prepare Your Supabase Project

### 1.1 Create or open your Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Wait for the database to be ready (usually 1-2 minutes)

### 1.2 Run the database migrations

Follow the `RLS_SETUP_GUIDE.md` to:

1. Run all migration files in order:
   - `001_initial_schema.sql`
   - `002_subscription_schema.sql`
   - `003_additional_tables.sql`
   - `004_rls_policies_drop_first.sql`
   - `005_ecommerce_integrations.sql`

2. Verify RLS is working

### 1.3 Get your Supabase credentials

1. Go to **Settings** → **API**
2. Copy the following values (you'll need them for Vercel):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

⚠️ **IMPORTANT**: Never commit the `service_role` key to git or use it in client-side code!

---

## Step 2: Configure Environment Variables

### 2.1 Local Environment (`.env.local`)

Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# CSRF Protection
CSRF_SECRET=your-secret-key-min-32-chars

# Cron Secret (for trial reminders)
CRON_SECRET=your-secure-random-string

# File Upload (optional, for image hosting)
NEXT_PUBLIC_UPLOAD_URL=https://your-upload-url.com
UPLOAD_ACCESS_KEY=your-access-key
UPLOAD_SECRET_KEY=your-secret-key
```

### 2.2 Production Environment (Vercel)

These will be configured in Step 4.

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for first deployment)

1. **Connect to Vercel**
   - Go to [https://vercel.com/login](https://vercel.com/login)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**

   **Project Settings:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Add Environment Variables**
   
   Click "Environment Variables" and add the following:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

    # App Configuration
    NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

    # CSRF Protection
   CSRF_SECRET=your-secret-key-min-32-chars

   # Cron Secret
   CRON_SECRET=your-secure-random-string

   # Node Environment
   NODE_ENV=production
   ```

   ⚠️ **IMPORTANT**: Do not use `APP_URL` in production. Use `NEXT_PUBLIC_APP_URL` instead.

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your app will be live at `https://your-app-name.vercel.app`

---

### Option B: Deploy via Vercel CLI (For advanced users)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add CSRF_SECRET
   vercel env add CRON_SECRET
   vercel env add NODE_ENV
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add a custom domain

1. In Vercel, go to your project settings
2. Click "Domains"
3. Add your domain (e.g., `stock.yourdomain.com`)
4. Follow the DNS configuration instructions

### 4.2 Update environment variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:

```bash
NEXT_PUBLIC_APP_URL=https://stock.yourdomain.com
```

Update in Vercel:
```bash
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
```

---

## Step 5: Configure Cron Jobs

DKS StockAlert uses Vercel Cron Jobs for automated tasks:

### 5.1 Create `vercel.json`

Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This schedules the trial reminder email to run daily at 9 AM UTC.

### 5.2 Deploy cron configuration

Commit and push the `vercel.json` file:

```bash
git add vercel.json
git commit -m "Add cron job configuration"
git push
```

Vercel will automatically detect and configure the cron job.

---

## Step 6: Post-Deployment Checklist

### 6.1 Verify the deployment

1. **Access your app**
   - Open `https://your-app-name.vercel.app`
   - Verify the landing page loads

2. **Test sign-up flow**
   - Create a new test account
   - Verify login works

3. **Test product creation**
   - Log in
   - Create a test product
   - Verify it appears in the product list

4. **Test RLS (data isolation)**
   - Create two test accounts
   - Create products with account A
   - Log out and log in as account B
   - Verify account B cannot see account A's products

### 6.2 Health check

Visit `/api/health` endpoint:

```
https://your-app-name.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

### 6.3 Enable monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics in project settings
   - Add the Analytics SDK (optional)

2. **Error Tracking** (Recommended)
   - Set up Sentry or similar service
   - Configure environment variables

3. **Uptime Monitoring**
   - Use Uptime Robot or similar
   - Monitor your health endpoint

---

## Troubleshooting

### Issue: Build fails with "Module not found"

**Solution:**
1. Check dependencies are installed
2. Ensure `node_modules` is in `.gitignore`
3. Try adding `.npmrc` file:

```ini
engine-strict=true
```

### Issue: Environment variables not working

**Solution:**
1. Ensure all env vars are set in Vercel Dashboard
2. Restart the deployment
3. Verify var names match exactly (case-sensitive)
4. Check `NEXT_PUBLIC_` prefix for client-side vars

### Issue: Database connection errors

**Solution:**
1. Verify Supabase project is active (not paused)
2. Check Supabase API credentials
3. Ensure RLS policies don't block queries
4. Check Supabase logs for errors

### Issue: Cron jobs not running

**Solution:**
1. Verify `vercel.json` exists and is formatted correctly
2. Ensure `CRON_SECRET` is set
3. Check Vercel cron logs
4. Verify cron endpoint returns 200 status

---

## Security Best Practices

1. **Never commit secrets**: Use `.env.local` for local development
2. **Use service role key sparingly**: Only in server-side routes
3. **Enable RLS**: Ensure all tables have RLS policies
4. **HTTPS only**: Vercel SSL is automatic
5. **Monitor logs**: Regularly check Vercel and Supabase logs
6. **Update dependencies**: Run `npm audit` regularly
7. **Backup data**: Enable Supabase automated backups

---

## Monitoring & Maintenance

### Daily
- Monitor error rate via Vercel logs
- Check application uptime

### Weekly
- Review user feedback
- Check database usage limits
- Review new user signups

### Monthly
- Check Supabase billing limits
- Review performance metrics
- Update dependencies with `npm update`

---

## Cost Estimates

### Free Tier
- **Vercel**: Free (100GB bandwidth, 6,000 minutes/month)
- **Supabase**: Free (500MB database, 2GB file storage, 2GB bandwidth)

### Estimated Monthly Costs
- Small business: $0-$20/month
- Medium business: $20-$50/month
- Large business: $50+/month

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

---

## Support

If you encounter issues:

1. Check Vercel logs: Dashboard → Logs
2. Check Supabase logs: Dashboard → Logs
3. Review error messages carefully
4. Consult the troubleshooting section above
5. Check GitHub issues for similar problems

---

**Last Updated:** January 2026  
**Version:** 2.0 (DKS StockAlert)
