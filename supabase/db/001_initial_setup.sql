-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('owner', 'team');
CREATE TYPE request_status AS ENUM ('open', 'mapped', 'closed');
CREATE TYPE optin_status AS ENUM ('active', 'alerted', 'unsub');

-- LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    slug text UNIQUE,
    timezone text
);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    name text,
    role user_role
);

-- LABELS TABLE
CREATE TABLE IF NOT EXISTS labels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    code text UNIQUE,
    name text,
    synonyms text,
    active boolean
);

-- REQUESTS TABLE
CREATE TABLE IF NOT EXISTS requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    text text,
    image_url text,
    created_at timestamptz DEFAULT now(),
    matched_label_id uuid REFERENCES labels(id),
    status request_status
);

-- TEAM_PINS TABLE
CREATE TABLE IF NOT EXISTS team_pins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    pin_hash text,
    active boolean,
    created_at timestamptz DEFAULT now()
);

-- OPTINS TABLE
CREATE TABLE IF NOT EXISTS optins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    label_id uuid REFERENCES labels(id),
    request_id uuid REFERENCES requests(id),
    phone_e164 text,
    created_at timestamptz DEFAULT now(),
    status optin_status,
    UNIQUE(location_id, label_id, phone_e164)
);

-- SENDS TABLE
CREATE TABLE IF NOT EXISTS sends (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id),
    label_id uuid REFERENCES labels(id),
    sent_at timestamptz DEFAULT now(),
    count_sent int,
    sender_user_id uuid REFERENCES users(id)
);

-- OPTIONAL INDEXES
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_optins_status ON optins(status);
CREATE INDEX IF NOT EXISTS idx_sends_sent_at ON sends(sent_at);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_labels_location_id ON labels(location_id);
CREATE INDEX IF NOT EXISTS idx_requests_location_id ON requests(location_id);
CREATE INDEX IF NOT EXISTS idx_optins_location_label ON optins(location_id, label_id);
