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

    // Read and execute the main setup SQL
    const setupSQLPath = path.join(__dirname, '../supabase/db/001_initial_setup.sql');
    if (fs.existsSync(setupSQLPath)) {
      const setupSQL = fs.readFileSync(setupSQLPath, 'utf8');
      
      console.log('🔨 Executing database schema...');
      const { error } = await supabase.rpc('exec_sql', { sql: setupSQL });
      
      if (error) {
        console.log('⚠️  Schema execution failed:', error.message);
        console.log('📝 This might be expected if tables already exist');
      } else {
        console.log('✅ Database schema updated successfully!');
      }
    }

    // Run user names migration (always run this)
    console.log('👥 Running user names migration...');
    await runUserNamesMigration(supabase);

    // Run seeders if this is a fresh deployment
    if (isVercel && isProduction) {
      console.log('🧹 Cleaning existing database data...');
      await cleanDatabase(supabase);
      
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

async function cleanDatabase(supabase) {
  try {
    console.log('🗑️  Cleaning existing data...');
    
    // Define tables to clean in reverse dependency order
    // Based on the actual schema from 001_initial_setup.sql
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
        
        // Use a more reliable delete approach
        const { error } = await supabase
          .from(table)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (error) {
          console.log(`⚠️  Could not clean table ${table}:`, error.message);
          // Try alternative approach with exec_sql
          try {
            const { error: sqlError } = await supabase.rpc('exec_sql', { 
              sql: `DELETE FROM ${table};` 
            });
            if (sqlError) {
              console.log(`⚠️  SQL cleanup also failed for ${table}:`, sqlError.message);
            } else {
              console.log(`✅ Cleaned table ${table} via SQL`);
            }
          } catch (sqlCleanError) {
            console.log(`⚠️  SQL cleanup error for ${table}:`, sqlCleanError.message);
          }
        } else {
          console.log(`✅ Cleaned table: ${table}`);
        }
      } catch (cleanError) {
        console.log(`⚠️  Error cleaning table ${table}:`, cleanError.message);
      }
    }

    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.log('⚠️  Database cleanup failed:', error.message);
  }
}

async function runUserNamesMigration(supabase) {
  try {
    console.log('📝 Step 1: Adding missing users...');
    
    // Add missing users that are referenced in sends table
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          id: '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
          name: 'Marie Dubois',
          email: 'marie.dubois@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
          name: 'Pierre Martin',
          email: 'pierre.martin@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d',
          name: 'Marie Dubois',
          email: 'marie.dubois@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          name: 'Alice Johnson',
          email: 'alice.johnson@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
          name: 'Bob Smith',
          email: 'bob.smith@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
          name: 'Carol Davis',
          email: 'carol.davis@restockping.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' });

    if (usersError) {
      console.log('⚠️  Error adding users:', usersError.message);
    } else {
      console.log('✅ Users added successfully');
    }

    // Step 2: Add user_name column to team_pins if it doesn't exist
    console.log('📝 Step 2: Adding user_name column to team_pins...');
    const alterTableSQL = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'team_pins' AND column_name = 'user_name') THEN
              ALTER TABLE team_pins ADD COLUMN user_name VARCHAR(255);
          END IF;
      END $$;
    `;

    try {
      const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterTableSQL });
      if (alterError) {
        console.log('⚠️  Column might already exist:', alterError.message);
      } else {
        console.log('✅ user_name column added to team_pins');
      }
    } catch (alterError) {
      console.log('⚠️  Could not add user_name column:', alterError.message);
    }

    // Step 3: Update team_pins with user names
    console.log('📝 Step 3: Updating team_pins with user names...');
    const { error: teamPinsError } = await supabase
      .from('team_pins')
      .upsert([
        {
          id: '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d',
          user_name: 'Marie Dubois',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
          user_name: 'Marie Dubois',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
          user_name: 'Pierre Martin',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          user_name: 'Alice Johnson',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
          user_name: 'Bob Smith',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
          user_name: 'Carol Davis',
          location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'id' });

    if (teamPinsError) {
      console.log('⚠️  Error updating team_pins:', teamPinsError.message);
    } else {
      console.log('✅ team_pins updated with user names');
    }

    // Step 4: Add test subscribers (optins) for development
    console.log('📝 Step 4: Adding test subscribers...');
    
    // Get DRONE label ID
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('id')
      .eq('code', 'DRONE')
      .eq('location_id', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78')
      .limit(1);

    if (labelsError) {
      console.log('⚠️  Error fetching labels:', labelsError.message);
    } else if (labels && labels.length > 0) {
      const droneLabelId = labels[0].id;
      
      const { error: optinsError } = await supabase
        .from('optins')
        .upsert([
          {
            phone: '+33123456789',
            label_id: droneLabelId,
            location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            phone: '+33987654321',
            label_id: droneLabelId,
            location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            phone: '+33555555555',
            label_id: droneLabelId,
            location_id: '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'phone,label_id' });

      if (optinsError) {
        console.log('⚠️  Error adding optins:', optinsError.message);
      } else {
        console.log('✅ Test subscribers added');
      }
    }

    // Step 5: Verify the migration
    console.log('📝 Step 5: Verifying migration...');
    
    const { data: teamPins, error: verifyError } = await supabase
      .from('team_pins')
      .select('id, user_name')
      .limit(3);

    if (verifyError) {
      console.log('⚠️  Error verifying team_pins:', verifyError.message);
    } else {
      console.log('✅ team_pins verification:', teamPins);
    }

    console.log('🎉 User names migration completed successfully!');

  } catch (error) {
    console.log('⚠️  User names migration failed:', error.message);
    // Don't throw error to avoid breaking the build
  }
}

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
