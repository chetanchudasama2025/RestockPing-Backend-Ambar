const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
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

    console.log('📋 Seeding database with sample data...');

    // 1. Seed locations
    console.log('🌱 Seeding locations...');
    const { error: locationsError } = await supabase
      .from('locations')
      .upsert([
        { name: 'New York Office', slug: 'ny_office', timezone: 'America/New_York' },
        { name: 'London Office', slug: 'london_office', timezone: 'Europe/London' },
        { name: 'San Francisco Office', slug: 'sf_office', timezone: 'America/Los_Angeles' },
        { name: 'Tokyo Office', slug: 'tokyo_office', timezone: 'Asia/Tokyo' },
        { name: 'Berlin Office', slug: 'berlin_office', timezone: 'Europe/Berlin' },
        { name: 'Sydney Office', slug: 'sydney_office', timezone: 'Australia/Sydney' },
        { name: 'Paris Office', slug: 'paris_office', timezone: 'Europe/Paris' }
      ], { onConflict: 'slug' });

    if (locationsError) {
      console.log('⚠️  Locations seeding failed:', locationsError.message);
    } else {
      console.log('✅ Locations seeded successfully');
    }

    // 2. Seed users
    console.log('🌱 Seeding users...');
    const { error: usersError } = await supabase
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
        { email: 'pierre.martin@restockping.com', name: 'Pierre Martin', role: 'team' }
      ], { onConflict: 'email' });

    if (usersError) {
      console.log('⚠️  Users seeding failed:', usersError.message);
    } else {
      console.log('✅ Users seeded successfully');
    }

    // 3. Get Paris Office ID for labels and team pins
    const { data: parisOffice, error: parisError } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', 'paris_office')
      .single();

    if (parisError || !parisOffice) {
      console.log('❌ Could not find Paris Office, skipping Paris-specific data');
      return;
    }

    const parisId = parisOffice.id;
    console.log('📍 Paris Office ID:', parisId);

    // 4. Seed labels for Paris Office
    console.log('🌱 Seeding labels...');
    const { error: labelsError } = await supabase
      .from('labels')
      .upsert([
        { location_id: parisId, code: 'DRONE', name: 'Drones', synonyms: 'Quadcopter,FPV Drone,Camera Drone,Professional Drone', active: true },
        { location_id: parisId, code: 'PHONE', name: 'Smartphones', synonyms: 'Mobile Phones,Cell Phones,iPhone,Android', active: true },
        { location_id: parisId, code: 'LAPTOP', name: 'Laptops', synonyms: 'Notebooks,MacBook,Windows Laptop,Chromebook', active: true },
        { location_id: parisId, code: 'MONITOR', name: 'Monitors', synonyms: 'Computer Monitor,4K Monitor,Gaming Monitor,Ultrawide', active: true }
      ]);

    if (labelsError) {
      console.log('⚠️  Labels seeding failed:', labelsError.message);
    } else {
      console.log('✅ Labels seeded successfully');
    }

    // 5. Seed team pins for Paris Office
    console.log('🌱 Seeding team pins...');
    const crypto = require('crypto');
    const pin1234Hash = crypto.createHash('sha256').update('1234').digest('hex');
    const pinParisHash = crypto.createHash('sha256').update('paris').digest('hex');

    const { error: pinsError } = await supabase
      .from('team_pins')
      .upsert([
        { location_id: parisId, pin_hash: pin1234Hash, active: true },
        { location_id: parisId, pin_hash: pinParisHash, active: true }
      ]);

    if (pinsError) {
      console.log('⚠️  Team pins seeding failed:', pinsError.message);
    } else {
      console.log('✅ Team pins seeded successfully');
    }

    // 6. Get DRONE label ID for sends (we'll get all labels in the next step)
    const { data: droneLabelForSends, error: droneError } = await supabase
      .from('labels')
      .select('id')
      .eq('location_id', parisId)
      .eq('code', 'DRONE')
      .single();

    if (droneError || !droneLabelForSends) {
      console.log('❌ Could not find DRONE label, skipping sends');
    }

    // 7. Get all label IDs for optins
    const { data: allLabels, error: labelsFetchError } = await supabase
      .from('labels')
      .select('id, code')
      .eq('location_id', parisId);

    if (labelsFetchError || !allLabels || allLabels.length === 0) {
      console.log('❌ Could not find labels, skipping optins');
      return;
    }

    // 8. Seed optins for all labels
    console.log('🌱 Seeding optins...');
    const optinsData = [];
    
    // Add optins for DRONE label
    const droneLabel = allLabels.find(l => l.code === 'DRONE');
    if (droneLabel) {
      optinsData.push(
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33123456789', status: 'active' },
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33987654321', status: 'active' },
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33555555555', status: 'active' },
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33111223344', status: 'active' },
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33999888777', status: 'alerted' },
        { location_id: parisId, label_id: droneLabel.id, phone_e164: '+33123450000', status: 'unsub' }
      );
    }

    // Add optins for PHONE label
    const phoneLabel = allLabels.find(l => l.code === 'PHONE');
    if (phoneLabel) {
      optinsData.push(
        { location_id: parisId, label_id: phoneLabel.id, phone_e164: '+33123456789', status: 'active' },
        { location_id: parisId, label_id: phoneLabel.id, phone_e164: '+33987654321', status: 'active' },
        { location_id: parisId, label_id: phoneLabel.id, phone_e164: '+33555555555', status: 'active' },
        { location_id: parisId, label_id: phoneLabel.id, phone_e164: '+33999888777', status: 'alerted' }
      );
    }

    // Add optins for LAPTOP label
    const laptopLabel = allLabels.find(l => l.code === 'LAPTOP');
    if (laptopLabel) {
      optinsData.push(
        { location_id: parisId, label_id: laptopLabel.id, phone_e164: '+33123456789', status: 'active' },
        { location_id: parisId, label_id: laptopLabel.id, phone_e164: '+33987654321', status: 'active' },
        { location_id: parisId, label_id: laptopLabel.id, phone_e164: '+33111223344', status: 'active' }
      );
    }

    // Add optins for MONITOR label
    const monitorLabel = allLabels.find(l => l.code === 'MONITOR');
    if (monitorLabel) {
      optinsData.push(
        { location_id: parisId, label_id: monitorLabel.id, phone_e164: '+33555555555', status: 'active' },
        { location_id: parisId, label_id: monitorLabel.id, phone_e164: '+33111223344', status: 'active' },
        { location_id: parisId, label_id: monitorLabel.id, phone_e164: '+33999888777', status: 'alerted' }
      );
    }

    const { error: optinsError } = await supabase
      .from('optins')
      .upsert(optinsData);

    if (optinsError) {
      console.log('⚠️  Optins seeding failed:', optinsError.message);
    } else {
      console.log('✅ Optins seeded successfully');
    }

    // 8. Get Marie Dubois user ID for sends
    const { data: marieUser, error: marieError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'marie.dubois@restockping.com')
      .single();

    if (marieError || !marieUser) {
      console.log('❌ Could not find Marie Dubois user, skipping sends');
      return;
    }

    // 9. Get Pierre Martin user ID for additional sends
    const { data: pierreUser, error: pierreError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'pierre.martin@restockping.com')
      .single();

    // 10. Seed sends with different timestamps
    console.log('🌱 Seeding sends...');
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const sendsData = [];
    
    // Add DRONE send if label exists
    if (droneLabelForSends) {
      sendsData.push({
        location_id: parisId, 
        label_id: droneLabelForSends.id, 
        count_sent: 4, 
        sender_user_id: marieUser.id,
        sent_at: threeHoursAgo.toISOString()
      });
    }

    // Add more sends for different labels if users exist
    if (pierreUser) {
      if (phoneLabel) {
        sendsData.push({
          location_id: parisId,
          label_id: phoneLabel.id,
          count_sent: 3,
          sender_user_id: pierreUser.id,
          sent_at: twoHoursAgo.toISOString()
        });
      }

      if (laptopLabel) {
        sendsData.push({
          location_id: parisId,
          label_id: laptopLabel.id,
          count_sent: 2,
          sender_user_id: marieUser.id,
          sent_at: oneHourAgo.toISOString()
        });
      }

      if (monitorLabel) {
        sendsData.push({
          location_id: parisId,
          label_id: monitorLabel.id,
          count_sent: 1,
          sender_user_id: pierreUser.id,
          sent_at: now.toISOString()
        });
      }
    }

    const { error: sendsError } = await supabase
      .from('sends')
      .upsert(sendsData);

    if (sendsError) {
      console.log('⚠️  Sends seeding failed:', sendsError.message);
    } else {
      console.log('✅ Sends seeded successfully');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📍 You can now login with Location: paris and PIN: 1234 or paris');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.log('📋 Please check your Supabase connection and permissions');
  }
}

// Run the seeding
seedDatabase();
