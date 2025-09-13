const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function updateParisPins() {
  try {
    console.log('🔧 Updating Paris Office team pins with proper bcrypt hashes...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('📝 Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
      console.log('📝 Or run this script with environment variables:');
      console.log('   SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/update-paris-pins-bcrypt.js');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate bcrypt hashes
    const saltRounds = 12;
    const pin1234Hash = await bcrypt.hash('1234', saltRounds);
    const pinParisHash = await bcrypt.hash('paris', saltRounds);

    console.log('🔐 Generated bcrypt hashes:');
    console.log('   PIN 1234 hash:', pin1234Hash.substring(0, 30) + '...');
    console.log('   PIN paris hash:', pinParisHash.substring(0, 30) + '...');

    // Update team pins with proper bcrypt hashes
    console.log('🔄 Updating team pins...');

    // Update Marie Dubois PIN (1234)
    const { error: marieError } = await supabase
      .from('team_pins')
      .update({ pin_hash: pin1234Hash })
      .eq('id', '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce');

    if (marieError) {
      console.log('❌ Error updating Marie Dubois PIN:', marieError.message);
    } else {
      console.log('✅ Updated Marie Dubois PIN (1234)');
    }

    // Update Pierre Martin PIN (paris)
    const { error: pierreError } = await supabase
      .from('team_pins')
      .update({ pin_hash: pinParisHash })
      .eq('id', '703f2125-cb50-406b-ac9c-eef6cdfcd33c');

    if (pierreError) {
      console.log('❌ Error updating Pierre Martin PIN:', pierreError.message);
    } else {
      console.log('✅ Updated Pierre Martin PIN (paris)');
    }

    // Verify the updates
    console.log('🔍 Verifying updates...');
    const { data: teamPins, error: verifyError } = await supabase
      .from('team_pins')
      .select('id, user_name, pin_hash, active')
      .eq('location_id', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78');

    if (verifyError) {
      console.log('❌ Error verifying team pins:', verifyError.message);
    } else {
      console.log('✅ Team pins verification:');
      teamPins.forEach(pin => {
        const hashType = pin.pin_hash && pin.pin_hash.startsWith('$2b$') ? 'bcrypt' : 'other';
        console.log(`   - ${pin.user_name}: ${hashType} hash (${pin.pin_hash ? pin.pin_hash.substring(0, 20) + '...' : 'null'})`);
      });
    }

    console.log('🎉 Paris Office team pins updated successfully!');
    console.log('📝 Your Paris PIN 1234 should now work in production!');

  } catch (error) {
    console.error('❌ Error updating Paris pins:', error.message);
  }
}

updateParisPins();
