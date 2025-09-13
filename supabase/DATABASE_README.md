# Supabase Database Setup for RestockPing Backend

This folder contains the complete database structure and initial seed data for the RestockPing Backend project.

## 📁 Folder Structure

```
supabase/
└── db/
    ├── 001_initial_setup.sql    # Main database schema
    └── seeders/
        ├── 001_locations.sql    # Office locations
        ├── 002_users.sql        # User accounts
        ├── 003_labels.sql       # Department labels
        ├── 004_requests.sql     # Service requests
        ├── 005_team_pins.sql    # Team access pins
        ├── 006_optins.sql       # Phone subscriptions
        └── 007_sends.sql        # Message tracking
```

## 🚀 Quick Setup

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the files in this order:**

   ```sql
   -- 1. Run the main setup
   -- Copy and paste contents of 001_initial_setup.sql
   
   -- 2. Run seeders in order
   -- Copy and paste contents of 001_locations.sql
   -- Copy and paste contents of 002_users.sql
   -- Copy and paste contents of 003_labels.sql
   -- Copy and paste contents of 004_requests.sql
   -- Copy and paste contents of 005_team_pins.sql
   -- Copy and paste contents of 006_optins.sql
   -- Copy and paste contents of 007_sends.sql
   ```

### Option 2: Supabase CLI

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   npx supabase login
   ```

3. **Link your project:**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Run migrations:**
   ```bash
   npm run db:create-function 
   ```
 
    ##### 1. Create the `exec_sql` function (one-time setup)

      Supabase does not allow executing raw SQL directly via the API, so we need to define a helper function.

   1. Go to your **[Supabase Project Dashboard](https://app.supabase.com/)**  
   2. Click **SQL Editor** in the left sidebar  
   3. Create a **New Query** and paste the following SQL:

   ```sql
   CREATE OR REPLACE FUNCTION exec_sql(sql text)
   RETURNS void AS $$
   BEGIN
     EXECUTE sql;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
   4. Click "Run" to execute
   5. Then run: npm run db:setup 

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `locations` | Office locations | name, slug, timezone |
| `users` | User accounts | email, name, role |
| `labels` | Department labels | code, name, synonyms |
| `requests` | Service requests | text, status, location_id |
| `team_pins` | Team access pins | pin_hash, active |
| `optins` | Phone subscriptions | phone_e164, status |
| `sends` | Message tracking | count_sent, sent_at |

### Relationships

- **locations** → **labels** (one-to-many)
- **locations** → **requests** (one-to-many)
- **locations** → **team_pins** (one-to-many)
- **labels** → **optins** (one-to-many)
- **users** → **sends** (one-to-many)

## 🔧 Customization

### Adding New Locations

```sql
INSERT INTO locations (name, slug, timezone) VALUES 
    ('Tokyo Office', 'tokyo_office', 'Asia/Tokyo');
```

### Adding New Users

```sql
INSERT INTO users (email, name, role) VALUES 
    ('admin@company.com', 'Admin User', 'owner');
```

### Adding New Labels

```sql
INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'IT', 'Information Technology', 'IT Dept,Tech', TRUE 
FROM locations WHERE slug='ny_office';
```

## 📊 Sample Data

After running all seeders, you'll have:

- **8 locations**: NY, London, San Francisco, Tokyo, Berlin, Sydney, Toronto, Paris
- **12 users**: 4 owners & 8 team members across different departments
- **10 labels**: HR, Engineering, Design, IT, Marketing, Finance, Legal, Operations, QA, Product
- **12 requests**: Various service requests with different statuses (open, mapped, closed)
- **10 team pins**: Access pins for different offices (some active, some inactive)
- **12 optins**: Phone subscriptions with different statuses (active, alerted, unsub)
- **15 sends**: Message tracking records across different users and departments

## 🧪 Testing the Setup

### Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check Sample Data

```sql
-- View all locations
SELECT * FROM locations;

-- View all users
SELECT * FROM users;

-- View labels with location names
SELECT l.name as label_name, loc.name as location_name 
FROM labels l 
JOIN locations loc ON l.location_id = loc.id;
```

### Test Relationships

```sql
-- View requests with location and label info
SELECT 
    r.text,
    l.name as location_name,
    lb.name as label_name,
    r.status
FROM requests r
JOIN locations l ON r.location_id = l.id
LEFT JOIN labels lb ON r.matched_label_id = lb.id;
```

## 🚨 Troubleshooting

### Common Issues

1. **"Table already exists"** → Tables use `IF NOT EXISTS`, so this is safe
2. **"Enum type already exists"** → Enums use `IF NOT EXISTS`, so this is safe
3. **"Foreign key constraint"** → Make sure to run seeders in order
4. **"Unique constraint violation"** → Clear existing data first if needed

### Reset Database (Development Only)

```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## 🔐 Security Notes

- **Never run these scripts in production** without reviewing
- **Backup your database** before running migrations
- **Test in development** environment first
- **Review all SQL** before execution

## 📚 Next Steps

After setting up the database:

1. **Update your `.env` file** with Supabase credentials
2. **Test the connection** using `/test-supabase` endpoint
3. **Create your API routes** using the new table structure
4. **Add authentication** and row-level security policies

## 🆘 Need Help?

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review SQL syntax in your database client
- Test queries in Supabase SQL Editor first
- Check the project README for API setup instructions,
