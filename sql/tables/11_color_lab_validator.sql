-- outfits table for style validator feature
CREATE TABLE IF NOT EXISTS color_lab_outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES color_lab_sessions(id) ON DELETE CASCADE,
    email VARCHAR,
    image_url VARCHAR NOT NULL,
    ai_result JSONB, 
    status VARCHAR DEFAULT 'created', -- 'created', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE color_lab_outfits IS 'User uploaded outfits to be validated against their color profile';
