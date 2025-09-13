const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting local database seeding...');
    
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables!');
      console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
      process.exit(1);
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First, try to create the exec_sql function if it doesn't exist
    console.log('🔧 Setting up exec_sql function for seeding...');
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
      
      if (functionError) {
        console.log('⚠️  Could not create exec_sql function automatically');
        console.log('📝 Trying alternative approach...');
      } else {
        console.log('✅ exec_sql function created successfully!');
      }
    } catch (funcError) {
      console.log('⚠️  Function creation failed, continuing with alternative approach...');
    }

    // Define the order of seeder files
    const seederFiles = [
      '001_locations.sql',
      '002_users.sql',
      '003_labels.sql',
      '004_requests.sql',
      '005_team_pins.sql',
      '006_optins.sql',
      '007_sends.sql',
      '008_additional_data.sql'
    ];

    const seedersDir = path.join(__dirname, '../supabase/db/seeders');

    console.log('📋 Seeding database with sample data...');

    for (const seederFile of seederFiles) {
      try {
        const seederPath = path.join(seedersDir, seederFile);
        const seederSQL = fs.readFileSync(seederPath, 'utf8');
        
        console.log(`🌱 Running seeder: ${seederFile}`);
        
        // Execute the seeder SQL
        const { error } = await supabase.rpc('exec_sql', { sql: seederSQL });
        
        if (error) {
          console.log(`⚠️  Seeder ${seederFile} failed:`, error.message);
          console.log(`📝 This might be expected if data already exists`);
        } else {
          console.log(`✅ ${seederFile} completed successfully`);
        }
        
      } catch (fileError) {
        console.error(`❌ Error reading seeder file ${seederFile}:`, fileError.message);
      }
    }

    console.log('🎉 Database seeding completed!');
    console.log('📝 Note: Some seeders may need to be run manually in Supabase SQL Editor');
    console.log('📁 Check the supabase/db/seeders/ folder for all seeder files');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.log('📋 Please run the seeders manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Run each seeder file in order (001_locations.sql → 008_additional_data.sql)');
  }
}

// Run the seeding
seedDatabase();
