-- Migration: Enhance color_lab_reports for pre-creation workflow

-- 1. Add status column to reports to track lifecycle
ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS status varchar NOT NULL DEFAULT 'completed'; 
-- Default is 'completed' for existing records to maintain backward compatibility

-- 2. Allow payload to be nullable (because draft reports won't have results yet)
ALTER TABLE color_lab_reports 
ALTER COLUMN payload DROP NOT NULL;

-- 3. Add input_image_url for easier access (denormalization)
ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS input_image_url varchar;

comment on column color_lab_reports.status is 'draft | processing | completed | failed';
