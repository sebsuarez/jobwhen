-- Update goals table to support fixed activity types and weekly progress resets.

TRUNCATE TABLE goals;

ALTER TABLE goals DROP CONSTRAINT IF EXISTS chk_goal_type;
ALTER TABLE goals ADD CONSTRAINT chk_goal_type
    CHECK (goal_type IN ('job_application', 'wellness_checkin', 'interview_prep'));

ALTER TABLE goals DROP CONSTRAINT IF EXISTS uq_user_goal_type;
ALTER TABLE goals ADD CONSTRAINT uq_user_goal_type UNIQUE (user_id, goal_type);

ALTER TABLE goals ADD COLUMN IF NOT EXISTS week_of DATE NOT NULL DEFAULT CURRENT_DATE;
