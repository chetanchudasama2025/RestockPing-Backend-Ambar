# 🚀 Vercel + Supabase Automatic Migration Setup

This guide explains how to set up automatic database migrations that will run when you merge PRs to your main branch, specifically designed for Vercel deployment.

## 📋 Prerequisites

1. **Vercel Project**: Your project is deployed on Vercel
2. **Supabase Project**: You have a Supabase project set up
3. **GitHub Repository**: Your code is in a GitHub repository
4. **Vercel Environment Variables**: Already configured in Vercel dashboard

## 🔧 Setup Steps

### 1. Verify Vercel Environment Variables

Make sure these are set in your Vercel dashboard (Settings → Environment Variables):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `JWT_SECRET`: Your JWT secret

### 2. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets (same values as Vercel):

- `SUPABASE_URL`: Your Supabase project URL (same as Vercel)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (same as Vercel)
- `VERCEL_TOKEN`: Your Vercel deployment token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

### 3. Get Vercel Tokens

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to Settings → Tokens
3. Create a new token
4. Copy the token and add it to GitHub Secrets as `VERCEL_TOKEN`

### 4. Get Vercel Project Info

1. Go to your Vercel project dashboard
2. Go to Settings → General
3. Copy the "Project ID" and "Organization ID"
4. Add them to GitHub Secrets

## 📁 Files Created

### Updated Migration Script
- `scripts/vercel-migrate.js` (enhanced existing script)
  - **Preserves all existing functionality** (database setup, seeders, cleanup)
  - **Adds user names migration** (missing users, team_pins user_name column)
  - **Fixes foreign key constraints** automatically
  - **Uses Vercel environment variables** (no additional setup needed)

### GitHub Actions Workflow
- `.github/workflows/supabase-migration.yml`
  - Runs automatically on PR merge
  - Uses existing `npm run db:migrate` command
  - Deploys to Vercel after migration
  - Uses same environment variables as Vercel

### Manual Migration API
- `api/migrate.ts`
  - Manual migration endpoint for testing
  - Uses Vercel environment variables
  - Can be called directly from browser

## 🚀 How It Works

1. **When you merge a PR** to main/master branch
2. **GitHub Actions triggers** the migration workflow
3. **Supabase CLI runs** the migration script
4. **Database is updated** automatically in production
5. **User names feature** starts working immediately

## 🧪 Testing the Migration

### Option 1: Manual Migration via API
You can trigger the migration manually by calling the API endpoint:

```bash
# Replace YOUR_SECRET_KEY with a secret you set
curl "https://your-vercel-app.vercel.app/api/migrate?secret=YOUR_SECRET_KEY"
```

### Option 2: Local Testing
Before pushing to production, test the migration locally:

```bash
# Set environment variables (same as Vercel)
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
export NODE_ENV="production"

# Run the migration script (same command used in production)
npm run db:migrate
```

### Option 3: Vercel CLI Testing
Test with Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with Vercel
vercel dev

# Test the migration endpoint
curl "http://localhost:3000/api/migrate?secret=migrate-2025"
```

## 📊 What the Migration Does

### ✅ Fixes Issues
- **Foreign Key Error**: Fixes `sends_sender_user_id_fkey` constraint
- **User Names**: Adds `user_name` column to `team_pins`
- **Missing Users**: Adds users referenced in `sends` table
- **Permissions**: Fixes table access permissions

### ✅ Adds Features
- **Real User Names**: Audit logs show "Marie Dubois" instead of "Team Member (98392a05)"
- **Test Data**: Adds sample users, subscribers, and send records
- **Performance**: Creates indexes for better query performance
- **Helper Functions**: Creates `get_user_name()` function

### ✅ Expected Results
After migration, your audit logs will show:
```json
{
  "user": "Marie Dubois",
  "action": "Sent alert",
  "details": "Sent 3 subscribers to Drones & UAVs"
}
```

Instead of:
```json
{
  "user": "Team Member (98392a05)",
  "action": "Sent alert",
  "details": "Sent 3 subscribers to Drones & UAVs"
}
```

## 🔍 Monitoring

After the migration runs, you can:

1. **Check GitHub Actions**: Go to Actions tab to see migration status
2. **Test API**: Call `/api/team/logs` to verify user names are working
3. **Check Database**: Go to Supabase dashboard to see the changes

## 🚨 Troubleshooting

### Migration Fails
- Check GitHub Actions logs for error details
- Verify all secrets are set correctly
- Make sure Supabase project is accessible

### User Names Still Not Working
- Check if migration ran successfully
- Verify `team_pins` table has `user_name` column
- Check if users exist in `users` table

### Permission Errors
- Verify `SUPABASE_ACCESS_TOKEN` has proper permissions
- Check if database password is correct
- Ensure project reference is correct

## 📝 Next Steps

1. **Set up the secrets** in GitHub
2. **Test locally** with `supabase start`
3. **Create a PR** and merge it
4. **Verify** the migration runs successfully
5. **Test** the user names feature in production

## 🎉 Success!

Once set up, every time you merge a PR, your database will be automatically updated with the latest changes. The user names feature will work immediately in production! 🚀
