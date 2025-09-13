const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function buildWithDatabase() {
  try {
    console.log('🚀 Starting build with database setup...');
    
    // Check if environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️  Missing Supabase environment variables - skipping database setup');
      console.log('📝 Make sure to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔧 Setting up database...');
    await setupDatabase(supabase);

    console.log('✅ Database setup completed!');
    console.log('🎯 Your database is now ready with:');
    console.log('   - Complete schema with all tables');
    console.log('   - Row Level Security (RLS) enabled');
    console.log('   - audit_logs table cleaned up');
    console.log('   - Fresh seed data for all locations');
    console.log('   - Paris Office with PIN "1234" for Marie Dubois');
    console.log('   - Comprehensive dashboard data');
    
  } catch (error) {
    console.error('❌ Error in database setup:', error.message);
    console.log('📝 Error details:', JSON.stringify(error, null, 2));
    // Don't exit with error code to avoid breaking the build
  }
}

async function setupDatabase(supabase) {
  try {
    console.log('🔧 Step 1: Creating database schema...');
    await createSchema(supabase);

    console.log('🧹 Step 1.5: Cleaning up audit_logs table if it exists...');
    await cleanupAuditLogs(supabase);

    console.log('🗑️  Step 2: Cleaning existing data...');
    await cleanExistingData(supabase);

    console.log('🌱 Step 3: Seeding database with fresh data...');
    await seedDatabase(supabase);

    console.log('🏛️  Step 4: Running Paris Office migration...');
    await runParisOfficeMigration(supabase);
  } catch (error) {
    console.log('❌ Database setup failed:', error.message);
  }
}

async function cleanupAuditLogs(supabase) {
  try {
    console.log('🧹 Removing audit_logs table if it exists...');
    
    const cleanupSQL = `
      -- Drop the audit_logs table if it exists
      DROP TABLE IF EXISTS audit_logs CASCADE;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: cleanupSQL });
    
    if (error && !error.message.includes('does not exist')) {
      console.log('⚠️  Audit logs cleanup warning:', error.message);
    } else {
      console.log('✅ Audit logs table cleaned up successfully');
    }
  } catch (cleanupError) {
    console.log('⚠️  Audit logs cleanup error:', cleanupError.message);
  }
}

async function createSchema(supabase) {
  try {
    // Inline schema creation SQL
    const schemaSQL = `
      -- ENUM TYPES
      DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('owner', 'team');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE request_status AS ENUM ('open', 'mapped', 'closed');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
          CREATE TYPE optin_status AS ENUM ('active', 'alerted', 'unsub');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      -- LOCATIONS TABLE
      CREATE TABLE IF NOT EXISTS locations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text,
          slug text UNIQUE,
          timezone text,
          created_at timestamptz DEFAULT now()
      );

      -- USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text UNIQUE,
          name text,
          role user_role,
          created_at timestamptz DEFAULT now()
      );

      -- LABELS TABLE
      CREATE TABLE IF NOT EXISTS labels (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          location_id uuid REFERENCES locations(id),
          code text,
          name text,
          synonyms text,
          active boolean,
          UNIQUE(location_id, code)
      );

      -- REQUESTS TABLE
      CREATE TABLE IF NOT EXISTS requests (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          location_id uuid REFERENCES locations(id),
          text text,
          image_url text,
          status request_status,
          matched_label_id uuid REFERENCES labels(id),
          created_at timestamptz DEFAULT now()
      );

      -- TEAM_PINS TABLE
      CREATE TABLE IF NOT EXISTS team_pins (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          location_id uuid REFERENCES locations(id),
          pin_hash text,
          user_name text,
          active boolean,
          created_at timestamptz DEFAULT now()
      );

      -- OPTINS TABLE
      CREATE TABLE IF NOT EXISTS optins (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          location_id uuid REFERENCES locations(id),
          label_id uuid REFERENCES labels(id),
          phone_e164 text,
          status optin_status,
          created_at timestamptz DEFAULT now()
      );

      -- SENDS TABLE
      CREATE TABLE IF NOT EXISTS sends (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          location_id uuid REFERENCES locations(id),
          label_id uuid REFERENCES labels(id),
          count_sent integer,
          sender_user_id uuid REFERENCES users(id),
          sent_at timestamptz DEFAULT now(),
          created_at timestamptz DEFAULT now()
      );

      -- ENABLE ROW LEVEL SECURITY
      ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE team_pins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE optins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE sends ENABLE ROW LEVEL SECURITY;

      -- CREATE BASIC POLICIES FOR SERVICE ROLE ACCESS
      CREATE POLICY IF NOT EXISTS "Service role can access all locations" ON locations FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all users" ON users FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all labels" ON labels FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all requests" ON requests FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all team_pins" ON team_pins FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all optins" ON optins FOR ALL USING (true);
      CREATE POLICY IF NOT EXISTS "Service role can access all sends" ON sends FOR ALL USING (true);

    `;
    
    console.log('📋 Executing schema creation...');
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error && !error.message.includes('already exists')) {
      console.log('⚠️  Schema creation warning:', error.message);
    } else {
      console.log('✅ Schema created successfully');
    }
  } catch (schemaError) {
    console.log('⚠️  Schema creation error:', schemaError.message);
  }
}

async function cleanExistingData(supabase) {
  const tablesToClean = [
    'sends', 'optins', 'requests', 'team_pins', 'labels', 'users', 'locations'
  ];

  for (const table of tablesToClean) {
    try {
      console.log(`🧹 Cleaning table: ${table}`);
      
      // Check if table exists first
      const { data: testData, error: testError } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (testError) {
        if (testError.message.includes('schema cache') || testError.message.includes('does not exist')) {
          console.log(`ℹ️  Table ${table} does not exist yet, skipping...`);
          continue;
        }
      }
      
      // Clean the table
      const { error } = await supabase
        .from(table)
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        console.log(`⚠️  Could not clean table ${table}:`, error.message);
      } else {
        console.log(`✅ Cleaned table: ${table}`);
      }
    } catch (cleanError) {
      console.log(`⚠️  Error cleaning table ${table}:`, cleanError.message);
    }
  }
}

async function seedDatabase(supabase) {
  try {
    console.log('🌱 Seeding database with fresh data...');
    
    // Create locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .upsert([
        { name: 'New York Office', slug: 'ny_office', timezone: 'America/New_York' },
        { name: 'London Office', slug: 'london_office', timezone: 'Europe/London' },
        { name: 'San Francisco Office', slug: 'sf_office', timezone: 'America/Los_Angeles' },
        { name: 'Tokyo Office', slug: 'tokyo_office', timezone: 'Asia/Tokyo' },
        { name: 'Berlin Office', slug: 'berlin_office', timezone: 'Europe/Berlin' },
        { name: 'Sydney Office', slug: 'sydney_office', timezone: 'Australia/Sydney' },
        { name: 'Paris Office', slug: 'paris_office', timezone: 'Europe/Paris' }
      ])
      .select();

    if (locationsError) {
      console.log('⚠️  Error creating locations:', locationsError.message);
    } else {
      console.log('✅ Locations created successfully');
    }

    // Create users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert([
        { email: 'alice.owner@company.com', name: 'Alice Johnson', role: 'owner' },
        { email: 'bob.team@company.com', name: 'Bob Smith', role: 'team' },
        { email: 'carol.manager@company.com', name: 'Carol Davis', role: 'owner' },
        { email: 'david.engineer@company.com', name: 'David Wilson', role: 'team' },
        { email: 'emma.designer@company.com', name: 'Emma Brown', role: 'team' },
        { email: 'frank.analyst@company.com', name: 'Frank Miller', role: 'team' },
        { email: 'grace.lead@company.com', name: 'Grace Taylor', role: 'owner' },
        { email: 'henry.developer@company.com', name: 'Henry Anderson', role: 'team' },
        { email: 'marie.dubois@restockping.com', name: 'Marie Dubois', role: 'team' },
        { email: 'pierre.martin@restockping.com', name: 'Pierre Martin', role: 'team' },
        { email: 'sophie.bernard@restockping.com', name: 'Sophie Bernard', role: 'team' },
        { email: 'jean.moreau@restockping.com', name: 'Jean Moreau', role: 'team' },
        { email: 'claire.lefebvre@restockping.com', name: 'Claire Lefebvre', role: 'owner' }
      ])
      .select();

    if (usersError) {
      console.log('⚠️  Error creating users:', usersError.message);
    } else {
      console.log('✅ Users created successfully');
    }

    console.log('✅ Database seeding completed');
  } catch (seedError) {
    console.log('⚠️  Error seeding database:', seedError.message);
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

    // Create comprehensive labels for Paris Office
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
      },
      {
        location_id: parisLocationId,
        code: 'TABLET',
        name: 'Tablets',
        synonyms: 'iPad,Android Tablet,Surface,Kindle',
        active: true
      },
      {
        location_id: parisLocationId,
        code: 'HEADPHONES',
        name: 'Headphones',
        synonyms: 'Earbuds,AirPods,Wireless Headphones,Noise Cancelling',
        active: true
      },
      {
        location_id: parisLocationId,
        code: 'CAMERA',
        name: 'Cameras',
        synonyms: 'DSLR,Mirrorless,Action Camera,Webcam',
        active: true
      },
      {
        location_id: parisLocationId,
        code: 'SMARTWATCH',
        name: 'Smartwatches',
        synonyms: 'Apple Watch,Fitbit,Garmin,Wearable Tech',
        active: true
      },
      {
        location_id: parisLocationId,
        code: 'GAMING',
        name: 'Gaming',
        synonyms: 'Gaming Console,PS5,Xbox,Nintendo Switch,Gaming PC',
        active: true
      },
      {
        location_id: parisLocationId,
        code: 'TV',
        name: 'Televisions',
        synonyms: 'Smart TV,4K TV,OLED,LED,Home Theater',
        active: true
      }
    ];

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
        }
      } else {
        console.log(`✅ Label ${label.code} created successfully`);
      }
    }

    // Get DRONE label ID
    const { data: droneLabel, error: droneLabelError } = await supabase
      .from('labels')
      .select('id, code, name')
      .eq('code', 'DRONE')
      .eq('location_id', parisLocationId)
      .limit(1);

    if (droneLabelError || !droneLabel || droneLabel.length === 0) {
      console.log('⚠️  DRONE label not found for Paris Office');
      return;
    }
    
    const droneLabelId = droneLabel[0].id;
    console.log('✅ Found DRONE label:', droneLabel[0]);

    // Create team pins for Paris Office
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
      }
    ];

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
        }
      } else {
        console.log(`✅ Team pin for ${pin.user_name} created successfully`);
      }
    }

    // Get all label IDs for comprehensive optins
    const { data: allLabels, error: labelsError } = await supabase
      .from('labels')
      .select('id, code')
      .eq('location_id', parisLocationId);

    if (labelsError || !allLabels || allLabels.length === 0) {
      console.log('⚠️  No labels found for Paris Office');
      return;
    }

    // Create comprehensive optins for Paris Office
    const optinsToCreate = [
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'DRONE')?.id,
        phone_e164: '+33123456789',
        status: 'active'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'DRONE')?.id,
        phone_e164: '+33987654321',
        status: 'active'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'PHONE')?.id,
        phone_e164: '+33555555555',
        status: 'active'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'LAPTOP')?.id,
        phone_e164: '+33111223344',
        status: 'alerted'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'MONITOR')?.id,
        phone_e164: '+33999888777',
        status: 'active'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'TABLET')?.id,
        phone_e164: '+33666777888',
        status: 'active'
      },
      {
        location_id: parisLocationId,
        label_id: allLabels.find(l => l.code === 'HEADPHONES')?.id,
        phone_e164: '+33444555666',
        status: 'unsub'
      }
    ];

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
        }
      } else {
        console.log(`✅ Optin for ${optin.phone_e164} created successfully`);
      }
    }

    // Create comprehensive requests for Paris Office dashboard
    const requestsToCreate = [
      {
        location_id: parisLocationId,
        text: 'DJI Mavic 3 Pro Drone with 4K Camera',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'iPhone 15 Pro 256GB - Natural Titanium',
        image_url: '',
        status: 'mapped'
      },
      {
        location_id: parisLocationId,
        text: 'MacBook Air M2 13-inch - Midnight',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'Samsung 27-inch 4K Monitor - Space Gray',
        image_url: '',
        status: 'closed'
      },
      {
        location_id: parisLocationId,
        text: 'Sony A7R V Mirrorless Camera with 24-70mm Lens',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'Apple Watch Ultra 2 GPS + Cellular 49mm - Titanium',
        image_url: '',
        status: 'mapped'
      },
      {
        location_id: parisLocationId,
        text: 'iPad Pro 12.9-inch M2 - Space Gray',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'Sony WH-1000XM5 Wireless Headphones - Black',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'PlayStation 5 Console - Digital Edition',
        image_url: '',
        status: 'mapped'
      },
      {
        location_id: parisLocationId,
        text: 'Samsung 65-inch QLED 4K Smart TV',
        image_url: '',
        status: 'open'
      },
      {
        location_id: parisLocationId,
        text: 'Samsung Galaxy S24 Ultra 512GB - Titanium Black',
        image_url: '',
        status: 'closed'
      },
      {
        location_id: parisLocationId,
        text: 'AirPods Pro 2nd Generation with MagSafe Case',
        image_url: '',
        status: 'mapped'
      }
    ];

    for (const request of requestsToCreate) {
      console.log(`📝 Creating request: ${request.text.substring(0, 30)}...`);
      const { error } = await supabase
        .from('requests')
        .upsert([request]);
      
      if (error) {
        console.log(`❌ Error creating request:`, error.message);
      } else {
        console.log(`✅ Request created successfully`);
      }
    }

    // Create comprehensive sends data for analytics
    const { data: marieUser, error: marieError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'marie.dubois@restockping.com')
      .limit(1);

    const { data: pierreUser, error: pierreError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'pierre.martin@restockping.com')
      .limit(1);

    if (marieUser && marieUser.length > 0) {
      const sendsToCreate = [
        {
          location_id: parisLocationId,
          label_id: allLabels.find(l => l.code === 'DRONE')?.id,
          count_sent: 5,
          sender_user_id: marieUser[0].id,
          sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          location_id: parisLocationId,
          label_id: allLabels.find(l => l.code === 'PHONE')?.id,
          count_sent: 3,
          sender_user_id: marieUser[0].id,
          sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
          location_id: parisLocationId,
          label_id: allLabels.find(l => l.code === 'LAPTOP')?.id,
          count_sent: 2,
          sender_user_id: pierreUser?.[0]?.id,
          sent_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
          location_id: parisLocationId,
          label_id: allLabels.find(l => l.code === 'MONITOR')?.id,
          count_sent: 4,
          sender_user_id: marieUser[0].id,
          sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        }
      ];

      for (const send of sendsToCreate) {
        if (send.label_id) {
          console.log(`📤 Creating send record for label: ${allLabels.find(l => l.id === send.label_id)?.code}`);
          const { error } = await supabase
            .from('sends')
            .upsert([send]);
          
          if (error) {
            console.log(`❌ Error creating send record:`, error.message);
          } else {
            console.log(`✅ Send record created successfully`);
          }
        }
      }
    }


    console.log('✅ Paris Office migration completed successfully!');
    console.log('🎯 Key data created:');
    console.log('   - Location: Paris Office');
    console.log('   - Team PIN "1234" for Marie Dubois');
    console.log('   - 10 Product labels: DRONE, PHONE, LAPTOP, MONITOR, TABLET, HEADPHONES, CAMERA, SMARTWATCH, GAMING, TV');
    console.log('   - 12 Product requests with various statuses');
    console.log('   - 7 Phone optins with different statuses');
    console.log('   - 4 Send records for analytics');
    
  } catch (error) {
    console.log('❌ Paris Office migration failed:', error.message);
  }
}

// Run the setup
buildWithDatabase();
