import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// This endpoint can be called to run the migration manually
// GET /api/migrate?secret=YOUR_SECRET_KEY

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for secret key to prevent unauthorized access
  const secret = req.query.secret;
  const expectedSecret = process.env.MIGRATION_SECRET || 'migrate-2025';

  if (secret !== expectedSecret) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid secret key. Use ?secret=YOUR_SECRET_KEY'
    });
  }

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    });
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Starting migration via API...');

    // Step 1: Add missing users
    console.log('📝 Adding missing users...');
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
        }
      ], { onConflict: 'id' });

    if (usersError) {
      console.error('❌ Error adding users:', usersError);
    } else {
      console.log('✅ Users added successfully');
    }

    // Step 2: Update team_pins with user names
    console.log('📝 Updating team_pins with user names...');
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
        }
      ], { onConflict: 'id' });

    if (teamPinsError) {
      console.error('❌ Error updating team_pins:', teamPinsError);
    } else {
      console.log('✅ team_pins updated with user names');
    }

    // Step 3: Verify the migration
    console.log('📝 Verifying migration...');
    
    const { data: teamPins, error: verifyError } = await supabase
      .from('team_pins')
      .select('id, user_name')
      .limit(3);

    if (verifyError) {
      console.error('❌ Error verifying team_pins:', verifyError);
    } else {
      console.log('✅ team_pins verification:', teamPins);
    }

    console.log('🎉 Migration completed successfully!');

    return res.status(200).json({
      success: true,
      message: 'Migration completed successfully!',
      timestamp: new Date().toISOString(),
      results: {
        users_added: true,
        team_pins_updated: true,
        verification: teamPins || []
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
