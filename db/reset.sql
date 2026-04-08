-- Job When? - Database Reset
-- WARNING: This will permanently delete ALL data and drop all tables.
-- Only run this when you intentionally want a full clean slate.
-- After running this, re-run schema.sql then seed.sql.

DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS mentor_profiles CASCADE;
DROP TABLE IF EXISTS burnout_alerts CASCADE;
DROP TABLE IF EXISTS mood_checkins CASCADE;
DROP TABLE IF EXISTS encouragements CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS xp_events CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS application_history CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS pending_google_signups CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
