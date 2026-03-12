-- Migration: Add share_card_url and shared_at for social sharing rewards

-- 1. Add share_card_url to color_lab_reports for storing the R2 URL of the share card
ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS share_card_url varchar;

-- 2. Add shared_at to color_lab_sessions to track when a user shared their result
-- This is used to prevent multiple rewards for the same session.
ALTER TABLE color_lab_sessions 
ADD COLUMN IF NOT EXISTS shared_at timestamp with time zone;
