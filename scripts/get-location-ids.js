const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getLocationIds() {
  try {
    console.log('📍 Available Locations:\n');

    // Get all locations
    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, name, slug')
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    if (!locations || locations.length === 0) {
      console.log('No locations found.');
      return;
    }

    // Display locations with their IDs
    locations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.name}`);
      console.log(`   Slug: ${location.slug}`);
      console.log(`   ID: ${location.id}`);
      console.log('');
    });

    console.log('🧪 Test API with any location ID:');
    console.log('   curl -X POST http://localhost:3000/api/team/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`   -d '{"pin": "1234", "location_id": "${locations[0].id}"}'`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
getLocationIds();
