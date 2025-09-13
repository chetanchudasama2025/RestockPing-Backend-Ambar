-- Team PINs setup and sample data
-- This migration sets up the team_pins table with proper constraints and sample data

-- Ensure the team_pins table has the correct structure
CREATE TABLE IF NOT EXISTS team_pins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    pin_hash text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_team_pins_active ON team_pins(active);
CREATE INDEX IF NOT EXISTS idx_team_pins_location_id ON team_pins(location_id);

-- Add constraint to ensure only 2 active PINs per location
CREATE OR REPLACE FUNCTION check_max_active_pins()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = true THEN
        IF (SELECT COUNT(*) FROM team_pins WHERE location_id = NEW.location_id AND active = true AND id != COALESCE(NEW.id, gen_random_uuid())) >= 2 THEN
            RAISE EXCEPTION 'Maximum 2 active PINs allowed per location';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce max 2 active PINs per location
DROP TRIGGER IF EXISTS trigger_check_max_active_pins ON team_pins;
CREATE TRIGGER trigger_check_max_active_pins
    BEFORE INSERT OR UPDATE ON team_pins
    FOR EACH ROW
    EXECUTE FUNCTION check_max_active_pins();

-- Function to hash PINs (for seeding)
CREATE OR REPLACE FUNCTION hash_pin(pin text)
RETURNS text AS $$
BEGIN
    -- This will be replaced with bcrypt in the application
    -- For now, we'll use a simple hash for seeding
    RETURN encode(digest(pin, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert sample team PINs (these will be replaced with proper bcrypt hashes in the application)
-- Note: In production, PINs should be hashed using bcrypt in the application
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT 
    l.id,
    hash_pin('1234'), -- Sample PIN: 1234
    true
FROM locations l
WHERE l.slug = 'default' -- Assuming there's a default location
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add a second sample PIN for the same location
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT 
    l.id,
    hash_pin('5678'), -- Sample PIN: 5678
    true
FROM locations l
WHERE l.slug = 'default' -- Assuming there's a default location
LIMIT 1
ON CONFLICT DO NOTHING;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS trigger_update_team_pins_updated_at ON team_pins;
CREATE TRIGGER trigger_update_team_pins_updated_at
    BEFORE UPDATE ON team_pins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
