const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map of location slugs to their default PINs
const locationPins = {
  'ny_office': ['1234', '5678'],           // NY Office - Primary and Backup
  'london_office': ['2468', '1357'],       // London Office - Primary and Backup
  'sf_office': ['1111', '2222'],           // SF Office - Primary and Backup
  'tokyo_office': ['3333', '4444'],        // Tokyo Office - Primary and Backup
  'berlin_office': ['5555', '6666'],       // Berlin Office - Primary and Backup
  'sydney_office': ['7777', '8888']        // Sydney Office - Primary and Backup
};

async function updateExistingPins() {
  try {
    console.log('🔄 Updating existing team PINs with proper bcrypt hashes...\n');

    const saltRounds = 12;

    // Get all existing team PINs with their locations
    const { data: existingPins, error: fetchError } = await supabase
      .from('team_pins')
      .select(`
        id,
        location_id,
        pin_hash,
        active,
        locations!inner(id, name, slug)
      `)
      .order('created_at');

    if (fetchError) {
      console.error('Error fetching existing PINs:', fetchError);
      return;
    }

    if (!existingPins || existingPins.length === 0) {
      console.log('No existing team PINs found.');
      return;
    }

    console.log(`Found ${existingPins.length} existing team PINs:\n`);

    // Group PINs by location
    const pinsByLocation = {};
    existingPins.forEach(pin => {
      const slug = pin.locations.slug;
      if (!pinsByLocation[slug]) {
        pinsByLocation[slug] = [];
      }
      pinsByLocation[slug].push(pin);
    });

    // Update PINs for each location
    for (const [locationSlug, pins] of Object.entries(pinsByLocation)) {
      console.log(`📍 Location: ${pins[0].locations.name} (${locationSlug})`);
      
      const defaultPins = locationPins[locationSlug] || ['1234', '5678'];
      
      for (let i = 0; i < Math.min(pins.length, defaultPins.length); i++) {
        const pin = pins[i];
        const newPinValue = defaultPins[i];
        const newPinHash = await bcrypt.hash(newPinValue, saltRounds);
        
        const { error } = await supabase
          .from('team_pins')
          .update({ pin_hash: newPinHash })
          .eq('id', pin.id);

        if (error) {
          console.log(`   ❌ Failed to update PIN ${i + 1}: ${error.message}`);
        } else {
          console.log(`   ✅ Updated PIN ${i + 1}: ${newPinValue} (ID: ${pin.id})`);
        }
      }
      console.log('');
    }

    console.log('🎉 Team PINs update completed successfully!');
    console.log('\n📋 Updated PINs by location:');
    
    for (const [locationSlug, pins] of Object.entries(pinsByLocation)) {
      const defaultPins = locationPins[locationSlug] || ['1234', '5678'];
      const locationName = pins[0].locations.name;
      console.log(`   ${locationName}: ${defaultPins.slice(0, pins.length).join(', ')}`);
    }

    console.log('\n⚠️  Remember to change these default PINs in production!');
    console.log('\n🧪 Test the API:');
    console.log('   curl -X POST http://localhost:3000/api/team/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"pin": "1234", "location_id": "YOUR_LOCATION_ID"}\'');

  } catch (error) {
    console.error('Update error:', error);
  }
}

// Run the update
updateExistingPins();
