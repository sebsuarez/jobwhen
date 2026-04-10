ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS max_completions_per_user INT NOT NULL DEFAULT 1;

ALTER TABLE challenges
DROP CONSTRAINT IF EXISTS chk_max_completions_per_user;

ALTER TABLE challenges
ADD CONSTRAINT chk_max_completions_per_user
CHECK (max_completions_per_user > 0);
