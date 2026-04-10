-- Track the date of each user's most recent login for streak calculation.
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;
