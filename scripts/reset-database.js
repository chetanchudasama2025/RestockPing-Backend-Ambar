const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function resetDatabase() {
  try {
    console.log('🔄 Starting local database reset...');
    
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

    console.log('🗑️  Resetting database (clearing all data)...');
    
    // Define tables to clean in reverse dependency order
    const tablesToClean = [
      'sends',        // References: location_id, label_id, sender_user_id
      'optins',       // References: location_id, label_id, request_id
      'requests',     // References: location_id, matched_label_id
      'team_pins',    // References: location_id
      'labels',       // References: location_id
      'users',        // No dependencies
      'locations'     // No dependencies (base table)
    ];

    for (const table of tablesToClean) {
      try {
        console.log(`🧹 Cleaning table: ${table}`);
        
        const { error } = await supabase
          .from(table)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          console.log(`⚠️  Could not clean table ${table}:`, error.message);
        } else {
          console.log(`✅ Cleaned table: ${table}`);
        }
      } catch (cleanError) {
        console.log(`⚠️  Error cleaning table ${table}:`, cleanError.message);
      }
    }

    console.log('✅ Database reset completed!');
    console.log('📝 All data has been cleared from the database');
    console.log('🌱 You can now run: npm run db:seed to add fresh data');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    console.log('📋 Please reset the database manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Run the contents of supabase/db/012_delete_all_tables.sql');
  }
}

// Run the reset
resetDatabase();
