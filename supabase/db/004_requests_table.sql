-- Create requests table for "can't find it?" requests
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    labelName VARCHAR(100) NOT NULL,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service_role to insert/select
CREATE POLICY requests_service_role_all
ON public.requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow anon/authenticated to insert (for API)
CREATE POLICY requests_insert_all
ON public.requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.requests TO service_role, anon, authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON public.requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
