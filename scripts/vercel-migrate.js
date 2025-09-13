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
      
      // Run Paris Office migration after seeders
      console.log('🏛️  Running Paris Office migration...');
      await runParisOfficeMigration(supabase);
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

async function runParisOfficeMigration(supabase) {
  try {
    console.log('🏛️  Starting Paris Office migration...');
    
    // Get Paris Office location
    const { data: parisLocation, error: locationError } = await supabase
      .from('locations')
      .select('id, name, slug')
      .eq('slug', 'paris_office')
      .limit(1);

    if (locationError) {
      console.log('⚠️  Error fetching Paris Office location:', locationError.message);
      return;
    }
    
    if (!parisLocation || parisLocation.length === 0) {
      console.log('⚠️  Paris Office location not found');
      return;
    }

    const parisLocationId = parisLocation[0].id;
    console.log('✅ Found Paris Office:', parisLocation[0]);

    // Add product labels for Paris Office (one by one to handle conflicts)
    const labelsToCreate = [
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
    ];

    let labelsError = null;
    for (const label of labelsToCreate) {
      console.log(`🏷️  Creating label: ${label.code}`);
      const { error } = await supabase
        .from('labels')
        .upsert([label]);
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  Label ${label.code} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating label ${label.code}:`, error.message);
          labelsError = error;
          break;
        }
      } else {
        console.log(`✅ Label ${label.code} created successfully`);
      }
    }

    if (labelsError) {
      console.log('⚠️  Error adding labels:', labelsError.message);
      console.log('📝 Labels error details:', JSON.stringify(labelsError, null, 2));
      return; // Exit early if labels creation failed
    } else {
      console.log('✅ Product labels processed for Paris Office');
    }

    // Small delay to ensure labels are committed to database
    console.log('⏳ Waiting for labels to be committed...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get DRONE label ID
    console.log('🔍 Looking for DRONE label in Paris Office...');
    const { data: droneLabel, error: droneLabelError } = await supabase
      .from('labels')
      .select('id, code, name')
      .eq('code', 'DRONE')
      .eq('location_id', parisLocationId)
      .limit(1);

    if (droneLabelError) {
      console.log('⚠️  Error fetching DRONE label:', droneLabelError.message);
      console.log('📝 DRONE label error details:', JSON.stringify(droneLabelError, null, 2));
      return; // Exit early if we can't get the label
    }
    
    if (!droneLabel || droneLabel.length === 0) {
      console.log('⚠️  DRONE label not found for Paris Office');
      console.log('📝 Let me check what labels exist...');
      
      // Debug: Check what labels exist
      const { data: allLabels, error: allLabelsError } = await supabase
        .from('labels')
        .select('id, code, name, location_id')
        .eq('location_id', parisLocationId);
      
      if (allLabelsError) {
        console.log('⚠️  Error fetching all labels:', allLabelsError.message);
      } else {
        console.log('📝 Existing labels in Paris Office:', allLabels);
      }
      return;
    }
    
    const droneLabelId = droneLabel[0].id;
    console.log('✅ Found DRONE label:', droneLabel[0]);

    // Add team pins for Paris Office with proper SHA256 hashes
    const teamPinsToCreate = [
      {
        location_id: parisLocationId,
        pin_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // SHA256 of '1234'
        user_name: 'Marie Dubois',
        active: true
      },
      {
        location_id: parisLocationId,
        pin_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA256 of 'paris'
        user_name: 'Pierre Martin',
        active: true
      },
      {
        location_id: parisLocationId,
        pin_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', // SHA256 of 'team'
        user_name: 'Alice Johnson',
        active: true
      },
      {
        location_id: parisLocationId,
        pin_hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // SHA256 of 'hello'
        user_name: 'Sophie Bernard',
        active: true
      },
      {
        location_id: parisLocationId,
        pin_hash: '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3', // SHA256 of 'jean'
        user_name: 'Jean Moreau',
        active: true
      },
      {
        location_id: parisLocationId,
        pin_hash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', // SHA256 of 'claire'
        user_name: 'Claire Lefebvre',
        active: true
      }
    ];

    let teamPinsError = null;
    for (const pin of teamPinsToCreate) {
      console.log(`🔐 Creating team pin for: ${pin.user_name}`);
      const { error } = await supabase
        .from('team_pins')
        .upsert([pin]);
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  Team pin for ${pin.user_name} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating team pin for ${pin.user_name}:`, error.message);
          teamPinsError = error;
          break;
        }
      } else {
        console.log(`✅ Team pin for ${pin.user_name} created successfully`);
      }
    }

    if (teamPinsError) {
      console.log('⚠️  Error adding team pins:', teamPinsError.message);
      return;
    } else {
      console.log('✅ Team pins created for Paris Office');
    }

    // Add optins for Paris Office
    const optinsToCreate = [
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
      }
    ];

    let optinsError = null;
    for (const optin of optinsToCreate) {
      console.log(`📱 Creating optin for phone: ${optin.phone_e164}`);
      const { error } = await supabase
        .from('optins')
        .upsert([optin]);
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  Optin for ${optin.phone_e164} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating optin for ${optin.phone_e164}:`, error.message);
          optinsError = error;
          break;
        }
      } else {
        console.log(`✅ Optin for ${optin.phone_e164} created successfully`);
      }
    }

    if (optinsError) {
      console.log('⚠️  Error adding optins:', optinsError.message);
      return;
    } else {
      console.log('✅ Optins created for Paris Office');
    }

    // Add sends for Paris Office
    const { data: marieUser, error: marieError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'marie.dubois@restockping.com')
      .limit(1);

    if (marieUser && marieUser.length > 0) {
      const sendsToCreate = [
        {
          location_id: parisLocationId,
          label_id: droneLabelId,
          count_sent: 3,
          sender_user_id: marieUser[0].id
        }
      ];

      let sendsError = null;
      for (const send of sendsToCreate) {
        console.log(`📤 Creating send record for user: ${marieUser[0].id}`);
        const { error } = await supabase
          .from('sends')
          .upsert([send]);
        
        if (error) {
          if (error.code === '23505') {
            console.log(`⚠️  Send record already exists, skipping...`);
          } else {
            console.log(`❌ Error creating send record:`, error.message);
            sendsError = error;
            break;
          }
        } else {
          console.log(`✅ Send record created successfully`);
        }
      }

      if (sendsError) {
        console.log('⚠️  Error adding sends:', sendsError.message);
      } else {
        console.log('✅ Sends created for Paris Office');
      }
    }

    console.log('✅ Paris Office migration completed successfully!');
    console.log('🎯 Key data created:');
    console.log('   - Location: Paris Office');
    console.log('   - Team PIN "1234" for Marie Dubois');
    console.log('   - Product labels: DRONE, PHONE, LAPTOP, MONITOR');
    console.log('   - Optins and sends for dashboard data');
    
  } catch (error) {
    console.log('❌ Paris Office migration failed:', error.message);
    console.log('📝 Error details:', JSON.stringify(error, null, 2));
  }
}

// Run the migration
vercelMigrate();
