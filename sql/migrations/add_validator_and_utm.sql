-- Add validator_times to track free/paid uses of the Style Validator
ALTER TABLE user_available 
ADD COLUMN IF NOT EXISTS validator_times integer DEFAULT 0;

-- Add utm_source to track the acquisition channel of each color analysis session
ALTER TABLE color_lab_sessions 
ADD COLUMN IF NOT EXISTS utm_source varchar(255);
