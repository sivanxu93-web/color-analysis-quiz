-- Migration: Add recovery_sent_at to track abandoned cart emails

ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS recovery_sent_at timestamp with time zone;
