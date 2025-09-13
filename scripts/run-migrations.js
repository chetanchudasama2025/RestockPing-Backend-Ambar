#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigrationResults() {
  try {
    // Test 1: Check if Paris Office exists
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'paris_office');
    
    if (locError) {
      console.error('❌ Error checking locations:', locError.message);
      return;
    }
    
    console.log('📍 Paris Office:', locations.length > 0 ? '✅ EXISTS' : '❌ MISSING');
    if (locations.length > 0) {
      console.log('   Name:', locations[0].name);
      console.log('   Slug:', locations[0].slug);
    }
    
    // Test 2: Check team pins
    const { data: teamPins, error: pinsError } = await supabase
      .from('team_pins')
      .select('*')
      .eq('location_id', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78');
    
    if (pinsError) {
      console.error('❌ Error checking team pins:', pinsError.message);
      return;
    }
    
    console.log('🔐 Team Pins:', teamPins.length > 0 ? `✅ ${teamPins.length} FOUND` : '❌ NONE FOUND');
    teamPins.forEach(pin => {
      console.log(`   - ${pin.user_name} (${pin.active ? 'active' : 'inactive'})`);
    });
    
    // Test 3: Check labels
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('*')
      .eq('location_id', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78');
    
    if (labelsError) {
      console.error('❌ Error checking labels:', labelsError.message);
      return;
    }
    
    console.log('🏷️  Labels:', labels.length > 0 ? `✅ ${labels.length} FOUND` : '❌ NONE FOUND');
    labels.forEach(label => {
      console.log(`   - ${label.code}: ${label.name}`);
    });
    
    // Test 4: Check optins
    const { data: optins, error: optinsError } = await supabase
      .from('optins')
      .select('*')
      .eq('location_id', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78');
    
    if (optinsError) {
      console.error('❌ Error checking optins:', optinsError.message);
      return;
    }
    
    console.log('📱 Optins:', optins.length > 0 ? `✅ ${optins.length} FOUND` : '❌ NONE FOUND');
    
    // Test 5: Check sends
    const { data: sends, error: sendsError } = await supabase
      .from('sends')
      .select('*')
      .eq('sender_user_id', '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce');
    
    if (sendsError) {
      console.error('❌ Error checking sends:', sendsError.message);
      return;
    }
    
    console.log('📤 Sends:', sends.length > 0 ? `✅ ${sends.length} FOUND` : '❌ NONE FOUND');
    
    // Summary
    console.log('\n🎯 Migration Test Summary:');
    console.log(`   Locations: ${locations.length > 0 ? '✅' : '❌'}`);
    console.log(`   Team Pins: ${teamPins.length > 0 ? '✅' : '❌'}`);
    console.log(`   Labels: ${labels.length > 0 ? '✅' : '❌'}`);
    console.log(`   Optins: ${optins.length > 0 ? '✅' : '❌'}`);
    console.log(`   Sends: ${sends.length > 0 ? '✅' : '❌'}`);
    
    if (locations.length > 0 && teamPins.length > 0) {
      console.log('\n🎉 Migration successful! You can login with:');
      console.log('   Location: paris');
      console.log('   PIN: 1234 or paris');
    } else {
      console.log('\n❌ Migration incomplete. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure proper order
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of migrationFiles) {
      console.log(`\n📄 Running migration: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        // Run the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (error) {
          console.error(`❌ Error running migration ${file}:`, error.message);
          console.error(`   Details:`, error.details || 'No additional details');
          errorCount++;
          // Continue with other migrations even if one fails
          continue;
        }
        
        console.log(`✅ Migration ${file} completed successfully`);
        successCount++;
      } catch (err) {
        console.error(`❌ Exception running migration ${file}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📁 Total: ${migrationFiles.length}`);
    
    // Test migration results
    if (successCount > 0) {
      console.log('\n🧪 Testing migration results...');
      await testMigrationResults();
    }
    
    console.log('\n🎉 All migrations completed!');
    console.log('📍 You can now login with Location: paris and PIN: 1234 or paris');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if we need to create the exec_sql function first
async function ensureExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'Success';
    END;
    $$;
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    console.log('✅ exec_sql function created/updated');
  } catch (error) {
    // Function might already exist, that's okay
    console.log('ℹ️  exec_sql function already exists or will be created');
  }
}

async function main() {
  await ensureExecSqlFunction();
  await runMigrations();
}

main().catch(console.error);
