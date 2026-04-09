-- 001_add_default_target_count_to_challenges.sql
-- Adds a mentor-defined default target count for challenge progress.

ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS default_target_count INT NOT NULL DEFAULT 1;

ALTER TABLE challenges
DROP CONSTRAINT IF EXISTS chk_default_target_count;

ALTER TABLE challenges
ADD CONSTRAINT chk_default_target_count
CHECK (default_target_count > 0);
