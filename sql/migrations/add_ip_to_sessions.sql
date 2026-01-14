ALTER TABLE color_lab_sessions ADD COLUMN IF NOT EXISTS ip varchar(45);
CREATE INDEX IF NOT EXISTS idx_color_lab_sessions_ip ON color_lab_sessions(ip);
