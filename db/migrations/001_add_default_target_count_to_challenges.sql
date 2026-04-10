-- 001_add_default_target_count_to_challenges.sql
-- Adds mentor-defined target counts and completion tracking for challenges.

ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS default_target_count INT NOT NULL DEFAULT 1;

ALTER TABLE challenges
DROP CONSTRAINT IF EXISTS chk_default_target_count;

ALTER TABLE challenges
ADD CONSTRAINT chk_default_target_count
CHECK (default_target_count > 0);

ALTER TABLE challenge_participants
ADD COLUMN IF NOT EXISTS completion_count INT NOT NULL DEFAULT 0;

ALTER TABLE challenge_participants
DROP CONSTRAINT IF EXISTS chk_completion_count;

ALTER TABLE challenge_participants
ADD CONSTRAINT chk_completion_count
CHECK (completion_count >= 0);
