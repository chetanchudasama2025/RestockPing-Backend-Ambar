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

async function updateTeamPins() {
  try {
    console.log('Updating team PINs with proper bcrypt hashes...');

    // Sample PINs to use (in production, these should be set by admin)
    const samplePins = ['1234', '5678'];
    const saltRounds = 12;

    // Get existing team pins
    const { data: existingPins, error: fetchError } = await supabase
      .from('team_pins')
      .select('id, location_id, pin_hash, active')
      .eq('active', true)
      .limit(2);

    if (fetchError) {
      console.error('Error fetching existing PINs:', fetchError);
      return;
    }

    if (!existingPins || existingPins.length === 0) {
      console.log('No existing team PINs found. Creating new ones...');
      
      // Get the first location
      const { data: locations, error: locationError } = await supabase
        .from('locations')
        .select('id, name, slug')
        .limit(1);

      if (locationError) {
        console.error('Error fetching locations:', locationError);
        return;
      }

      if (!locations || locations.length === 0) {
        console.error('No locations found. Please create a location first.');
        return;
      }

      const locationId = locations[0].id;
      console.log(`Creating PINs for location: ${locations[0].name}`);

      // Create new PINs
      for (let i = 0; i < Math.min(samplePins.length, 2); i++) {
        const pin = samplePins[i];
        const pinHash = await bcrypt.hash(pin, saltRounds);
        
        const { data, error } = await supabase
          .from('team_pins')
          .insert({
            location_id: locationId,
            pin_hash: pinHash,
            active: true
          })
          .select('id');

        if (error) {
          console.error(`Error creating PIN ${pin}:`, error);
        } else {
          console.log(`✅ Created team PIN: ${pin} (ID: ${data[0].id})`);
        }
      }
    } else {
      console.log(`Found ${existingPins.length} existing PINs. Updating with proper hashes...`);
      
      // Update existing PINs with proper bcrypt hashes
      for (let i = 0; i < Math.min(existingPins.length, samplePins.length); i++) {
        const pin = samplePins[i];
        const pinHash = await bcrypt.hash(pin, saltRounds);
        
        const { error } = await supabase
          .from('team_pins')
          .update({ pin_hash: pinHash })
          .eq('id', existingPins[i].id);

        if (error) {
          console.error(`Error updating PIN ${pin}:`, error);
        } else {
          console.log(`✅ Updated team PIN: ${pin} (ID: ${existingPins[i].id})`);
        }
      }
    }

    console.log('Team PINs update completed successfully!');
    console.log('Sample PINs: 1234, 5678');
    console.log('⚠️  Remember to change these PINs in production!');

  } catch (error) {
    console.error('Update error:', error);
  }
}

// Run the update
updateTeamPins();
