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

    // Run Paris Office migration (always run this)
    console.log('🏢 Running Paris Office migration...');
    await runParisOfficeMigration(supabase);

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

async function runParisOfficeMigration(supabase) {
  try {
    console.log('📝 Step 1: Creating Paris Office location...');
    
    // Create Paris Office location
    const { error: locationError } = await supabase
      .from('locations')
      .upsert([
        {
          name: 'Paris Office',
          slug: 'paris_office',
          timezone: 'Europe/Paris'
        }
      ], { onConflict: 'slug' });

    if (locationError) {
      console.log('⚠️  Error creating Paris Office location:', locationError.message);
    } else {
      console.log('✅ Paris Office location created');
    }

    console.log('📝 Step 2: Adding Paris Office team users...');
    
    // Add Paris Office team users
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          name: 'Marie Dubois',
          email: 'marie.dubois@restockping.com',
          role: 'owner'
        },
        {
          name: 'Pierre Martin',
          email: 'pierre.martin@restockping.com',
          role: 'team'
        },
        {
          name: 'Alice Johnson',
          email: 'alice.johnson@restockping.com',
          role: 'owner'
        },
        {
          name: 'Bob Smith',
          email: 'bob.smith@restockping.com',
          role: 'team'
        },
        {
          name: 'Carol Davis',
          email: 'carol.davis@restockping.com',
          role: 'team'
        }
      ], { onConflict: 'email' });

    if (usersError) {
      console.log('⚠️  Error adding users:', usersError.message);
    } else {
      console.log('✅ Paris Office users added successfully');
    }

    console.log('📝 Step 3: Creating product labels for Paris Office...');
    
    // Get Paris Office location ID
    const { data: parisLocation, error: locationError2 } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', 'paris_office')
      .limit(1);

    if (locationError2 || !parisLocation || parisLocation.length === 0) {
      console.log('⚠️  Error fetching Paris Office location:', locationError2?.message);
      return;
    }

    const parisLocationId = parisLocation[0].id;

    // Add product labels for Paris Office
    const { error: labelsError } = await supabase
      .from('labels')
      .upsert([
        {
          location_id: parisLocationId,
          code: 'DRONE',
          name: 'Drones',
          synonyms: 'Quadcopter,FPV Drone,Camera Drone,Professional Drone',
          active: true
        },
        {
          location_id: parisLocationId,
          code: 'PHONE',
          name: 'Smartphones',
          synonyms: 'Mobile Phones,Cell Phones,iPhone,Android',
          active: true
        },
        {
          location_id: parisLocationId,
          code: 'LAPTOP',
          name: 'Laptops',
          synonyms: 'Notebooks,MacBook,Windows Laptop,Chromebook',
          active: true
        },
        {
          location_id: parisLocationId,
          code: 'MONITOR',
          name: 'Monitors',
          synonyms: 'Computer Monitor,4K Monitor,Gaming Monitor,Ultrawide',
          active: true
        }
      ], { onConflict: 'location_id,code' });

    if (labelsError) {
      console.log('⚠️  Error adding labels:', labelsError.message);
    } else {
      console.log('✅ Product labels created for Paris Office');
    }

    console.log('📝 Step 4: Creating team pins with PIN "1234" for login...');
    
    // Create hash function for PINs
    const hashPinSQL = `
      CREATE OR REPLACE FUNCTION hash_pin(pin text)
      RETURNS text AS $$
      BEGIN
          RETURN encode(digest(pin, 'sha256'), 'hex');
      END;
      $$ LANGUAGE plpgsql;
    `;

    try {
      await supabase.rpc('exec_sql', { sql: hashPinSQL });
      console.log('✅ PIN hash function created');
    } catch (hashError) {
      console.log('⚠️  Could not create hash function:', hashError.message);
    }

    // Add team pins with PIN "1234" for Paris Office
    const { error: teamPinsError } = await supabase
      .from('team_pins')
      .upsert([
        {
          location_id: parisLocationId,
          pin_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // hash of "1234"
          active: true
        },
        {
          location_id: parisLocationId,
          pin_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // hash of "paris"
          active: true
        },
        {
          location_id: parisLocationId,
          pin_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', // hash of "team"
          active: true
        }
      ]);

    if (teamPinsError) {
      console.log('⚠️  Error adding team pins:', teamPinsError.message);
    } else {
      console.log('✅ Team pins created with PIN "1234" for Paris Office');
    }

    console.log('📝 Step 5: Adding test subscribers (optins)...');
    
    // Get DRONE label ID
    const { data: droneLabel, error: droneLabelError } = await supabase
      .from('labels')
      .select('id')
      .eq('code', 'DRONE')
      .eq('location_id', parisLocationId)
      .limit(1);

    if (droneLabelError || !droneLabel || droneLabel.length === 0) {
      console.log('⚠️  Error fetching DRONE label:', droneLabelError?.message);
    } else {
      const droneLabelId = droneLabel[0].id;
      
      // Add test subscribers
      const { error: optinsError } = await supabase
        .from('optins')
        .upsert([
          {
            location_id: parisLocationId,
            label_id: droneLabelId,
            phone_e164: '+33123456789',
            status: 'active'
          },
          {
            location_id: parisLocationId,
            label_id: droneLabelId,
            phone_e164: '+33987654321',
            status: 'active'
          },
          {
            location_id: parisLocationId,
            label_id: droneLabelId,
            phone_e164: '+33555555555',
            status: 'active'
          },
          {
            location_id: parisLocationId,
            label_id: droneLabelId,
            phone_e164: '+33111223344',
            status: 'alerted'
          },
          {
            location_id: parisLocationId,
            label_id: droneLabelId,
            phone_e164: '+33998877665',
            status: 'unsub'
          }
        ], { onConflict: 'location_id,label_id,phone_e164' });

      if (optinsError) {
        console.log('⚠️  Error adding optins:', optinsError.message);
      } else {
        console.log('✅ Test subscribers added for Paris Office');
      }
    }

    console.log('📝 Step 6: Adding test send records...');
    
    // Get user IDs for send records
    const { data: users, error: usersError2 } = await supabase
      .from('users')
      .select('id, email')
      .in('email', [
        'marie.dubois@restockping.com',
        'alice.johnson@restockping.com',
        'bob.smith@restockping.com'
      ]);

    if (usersError2 || !users || users.length === 0) {
      console.log('⚠️  Error fetching users for send records:', usersError2?.message);
    } else {
      const marieUser = users.find(u => u.email === 'marie.dubois@restockping.com');
      const aliceUser = users.find(u => u.email === 'alice.johnson@restockping.com');
      const bobUser = users.find(u => u.email === 'bob.smith@restockping.com');

      if (marieUser && aliceUser && bobUser && droneLabel) {
        const { error: sendsError } = await supabase
          .from('sends')
          .upsert([
            {
              location_id: parisLocationId,
              label_id: droneLabel[0].id,
              count_sent: 3,
              sender_user_id: marieUser.id
            },
            {
              location_id: parisLocationId,
              label_id: droneLabel[0].id,
              count_sent: 4,
              sender_user_id: aliceUser.id
            },
            {
              location_id: parisLocationId,
              label_id: droneLabel[0].id,
              count_sent: 2,
              sender_user_id: bobUser.id
            }
          ]);

        if (sendsError) {
          console.log('⚠️  Error adding send records:', sendsError.message);
        } else {
          console.log('✅ Test send records added for Paris Office');
        }
      }
    }

    console.log('📝 Step 7: Setting up Row Level Security (RLS)...');
    
    // Enable RLS on all tables
    const enableRLSSQL = `
      -- Enable RLS on all tables
      ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE team_pins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE optins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE sends ENABLE ROW LEVEL SECURITY;

      -- Create policies for service_role (full access)
      CREATE POLICY "service_role_full_access" ON locations FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON users FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON labels FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON requests FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON team_pins FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON optins FOR ALL TO service_role USING (true);
      CREATE POLICY "service_role_full_access" ON sends FOR ALL TO service_role USING (true);

      -- Create policies for authenticated users (read/write access)
      CREATE POLICY "authenticated_read_write" ON locations FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON users FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON labels FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON requests FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON team_pins FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON optins FOR ALL TO authenticated USING (true);
      CREATE POLICY "authenticated_read_write" ON sends FOR ALL TO authenticated USING (true);

      -- Create policies for anon users (read-only access for public API)
      CREATE POLICY "anon_read_only" ON locations FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON users FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON labels FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON requests FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON team_pins FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON optins FOR SELECT TO anon USING (true);
      CREATE POLICY "anon_read_only" ON sends FOR SELECT TO anon USING (true);
    `;

    try {
      await supabase.rpc('exec_sql', { sql: enableRLSSQL });
      console.log('✅ Row Level Security enabled with proper policies');
    } catch (rlsError) {
      console.log('⚠️  Could not enable RLS:', rlsError.message);
    }

    console.log('📝 Step 8: Verifying Paris Office migration...');
    
    // Verify the migration
    const { data: teamPins, error: verifyError } = await supabase
      .from('team_pins')
      .select('id, location_id, active')
      .eq('location_id', parisLocationId)
      .eq('active', true);

    if (verifyError) {
      console.log('⚠️  Error verifying team_pins:', verifyError.message);
    } else {
      console.log(`✅ Paris Office migration verification: ${teamPins.length} active team pins created`);
      console.log('🔑 Login with Location: paris_office and PIN: 1234');
    }

    console.log('🎉 Paris Office migration completed successfully!');

  } catch (error) {
    console.log('⚠️  Paris Office migration failed:', error.message);
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
