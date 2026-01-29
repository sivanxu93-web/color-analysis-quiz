-- Migration: Add image_hash to reports for deduplication

ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS image_hash varchar;

CREATE INDEX IF NOT EXISTS idx_reports_image_hash ON color_lab_reports(image_hash);
