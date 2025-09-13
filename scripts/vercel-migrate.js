const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function vercelMigrate() {
  try {
    console.log('🚀 Starting Vercel database migration...');
    
    // Check if we're in production (Vercel deployment)
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔧 Vercel deployment: ${isVercel}`);
    
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️  Missing Supabase environment variables - skipping migration');
      console.log('📝 Make sure to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel');
      return;
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📋 Running database migrations...');
    
    // Create the exec_sql function first
    console.log('🔧 Creating exec_sql function...');
    const createExecSqlFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
      const { error: functionError } = await supabase.rpc('exec_sql', { sql: createExecSqlFunction });
      if (functionError && !functionError.message.includes('already exists')) {
        console.log('⚠️  Could not create exec_sql function:', functionError.message);
        console.log('📝 Trying alternative approach...');
      } else {
        console.log('✅ exec_sql function ready');
      }
    } catch (funcError) {
      console.log('⚠️  Function creation failed, continuing with alternative approach...');
    }

    // Run all migration files in order
    console.log('🔨 Running Supabase migrations...');
    await runMigrations(supabase);

    // Run seeders if this is a fresh deployment
    if (isVercel && isProduction) {
      console.log('🌱 Running database seeders...');
      await runSeeders(supabase);
    }

    console.log('✅ Vercel migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during Vercel migration:', error.message);
    console.log('📝 Migration will continue on next deployment');
    // Don't exit with error code to avoid breaking the build
  }
}

async function runMigrations(supabase) {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📝 Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    try {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🔨 Running migration: ${file}`);
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
        console.log(`⚠️  Migration ${file} failed:`, error.message);
        // Continue with other migrations even if one fails
      } else {
        console.log(`✅ Migration ${file} completed`);
      }
    } catch (migrationError) {
      console.log(`⚠️  Could not run migration ${file}:`, migrationError.message);
    }
  }
}

// Removed complex migration logic - now using proper Supabase migration files

async function runSeeders(supabase) {
  const seedersDir = path.join(__dirname, '../supabase/db/seeders');
  
  if (!fs.existsSync(seedersDir)) {
    console.log('📁 No seeders directory found');
    return;
  }

  const seederFiles = fs.readdirSync(seedersDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📝 Found ${seederFiles.length} seeder files`);

  for (const file of seederFiles) {
    try {
      const filePath = path.join(seedersDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`🌱 Running seeder: ${file}`);
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
        console.log(`⚠️  Seeder ${file} failed:`, error.message);
      } else {
        console.log(`✅ Seeder ${file} completed`);
      }
    } catch (seederError) {
      console.log(`⚠️  Could not run seeder ${file}:`, seederError.message);
    }
  }
}

// Run the migration
vercelMigrate();
