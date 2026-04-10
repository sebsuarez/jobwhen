
-- Job When? - Database Schema
-- SENG 513 Database Schema Milestone
-- Database: PostgreSQL

-- ROLES
-- Supports: job seekers, mentors, admins
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
);

-- USERS
-- User profile and gamification summary
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    google_sub VARCHAR(255) UNIQUE,
    password_hash TEXT,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    job_search_status VARCHAR(120),
    school_name VARCHAR(120),
    headline VARCHAR(150),
    bio TEXT,
    location VARCHAR(120),
    avatar VARCHAR(10),
    current_level INT NOT NULL DEFAULT 1,
    current_xp INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT
);

-- SESSIONS
-- Server-side login sessions for authenticated users
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- PENDING GOOGLE SIGNUPS
-- Temporary signup records before a first-time Google user confirms account creation
CREATE TABLE IF NOT EXISTS pending_google_signups (
    signup_token VARCHAR(255) PRIMARY KEY,
    google_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- USER SETTINGS
-- Supports settings UI and MVP profile/privacy toggles
-- One settings row per user
CREATE TABLE IF NOT EXISTS user_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    dark_mode BOOLEAN NOT NULL DEFAULT TRUE,
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'friends',
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    burnout_prompts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    allow_friend_requests BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_profile_visibility
        CHECK (profile_visibility IN ('public', 'friends', 'private')),

    CONSTRAINT fk_settings_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- JOB APPLICATIONS
-- Core job board table
CREATE TABLE IF NOT EXISTS job_applications (
    application_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(120) NOT NULL,
    role_title VARCHAR(120) NOT NULL,
    location VARCHAR(120),
    job_link TEXT,
    salary_range VARCHAR(80),
    status VARCHAR(20) NOT NULL DEFAULT 'wishlist',
    notes TEXT,
    application_deadline DATE,
    applied_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_application_status
        CHECK (status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected', 'ghosted')),

    CONSTRAINT fk_application_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- APPLICATION HISTORY
-- Supports chronological application timeline MVP
CREATE TABLE IF NOT EXISTS application_history (
    history_id SERIAL PRIMARY KEY,
    application_id INT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,

    CONSTRAINT chk_old_status
        CHECK (
            old_status IS NULL OR
            old_status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected', 'ghosted')
        ),

    CONSTRAINT chk_new_status
        CHECK (
            new_status IN ('wishlist', 'applied', 'interview', 'offer', 'rejected', 'ghosted')
        ),

    CONSTRAINT fk_history_application
        FOREIGN KEY (application_id) REFERENCES job_applications(application_id)
        ON DELETE CASCADE
);

-- GOALS
-- Supports daily and weekly goals
CREATE TABLE IF NOT EXISTS goals (
    goal_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    goal_type VARCHAR(20) NOT NULL,
    target_count INT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_goal_type
        CHECK (goal_type IN ('daily', 'weekly')),

    CONSTRAINT chk_goal_count
        CHECK (target_count > 0 AND current_count >= 0),

    CONSTRAINT fk_goal_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- XP EVENTS
-- Tracks why users gained XP
CREATE TABLE IF NOT EXISTS xp_events (
    xp_event_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    xp_amount INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_xp_amount
        CHECK (xp_amount >= 0),

    CONSTRAINT fk_xp_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- BADGES
-- Master badge list for collection page
CREATE TABLE IF NOT EXISTS badges (
    badge_id SERIAL PRIMARY KEY,
    badge_name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    level_required INT,
    icon_name VARCHAR(80)
);

-- USER BADGES
-- Stores earned badges per user
CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id),

    CONSTRAINT fk_user_badges_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_badges_badge
        FOREIGN KEY (badge_id) REFERENCES badges(badge_id)
        ON DELETE CASCADE
);

-- FRIENDSHIPS
-- Supports add friend / accepted / blocked
CREATE TABLE IF NOT EXISTS friendships (
    friendship_id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL,
    addressee_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_friendship_status
        CHECK (status IN ('pending', 'accepted', 'blocked', 'rejected')),

    CONSTRAINT chk_no_self_friendship
        CHECK (requester_id <> addressee_id),

    CONSTRAINT uq_friend_pair UNIQUE (requester_id, addressee_id),

    CONSTRAINT fk_friend_requester
        FOREIGN KEY (requester_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_friend_addressee
        FOREIGN KEY (addressee_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ENCOURAGEMENTS
-- Supports social encouragement button/messages
CREATE TABLE IF NOT EXISTS encouragements (
    encouragement_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message VARCHAR(200),
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_no_self_encouragement
        CHECK (sender_id <> receiver_id),

    CONSTRAINT fk_enc_sender
        FOREIGN KEY (sender_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enc_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- MOOD CHECK-INS
-- Supports emotional reflection feature
CREATE TABLE IF NOT EXISTS mood_checkins (
    mood_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    mood_score INT NOT NULL,
    reflection TEXT,
    checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_mood_score
        CHECK (mood_score BETWEEN 1 AND 5),

    CONSTRAINT fk_mood_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- BURNOUT ALERTS
-- Supports burnout detection + supportive prompts feature
CREATE TABLE IF NOT EXISTS burnout_alerts (
    alert_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    trigger_reason TEXT NOT NULL,
    supportive_message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_burnout_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- MENTOR PROFILES
-- Supports public mentor/alumni profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
    mentor_profile_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company VARCHAR(120),
    job_title VARCHAR(120),
    expertise TEXT,
    availability TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_mentor_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- CHALLENGES
-- Mentor-created community challenges
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id SERIAL PRIMARY KEY,
    mentor_user_id INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 0,
    badge_reward_id INT,
    default_target_count INT NOT NULL DEFAULT 1,
    max_completions_per_user INT NOT NULL DEFAULT 1,
    challenge_status VARCHAR(20) NOT NULL DEFAULT 'in_review',
    participant_limit INT,
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_challenge_status
        CHECK (challenge_status IN ('in_review', 'approved', 'rejected', 'draft')),

    CONSTRAINT chk_participant_limit
        CHECK (participant_limit IS NULL OR participant_limit > 0),

    CONSTRAINT chk_default_target_count
        CHECK (default_target_count > 0),

    CONSTRAINT chk_max_completions_per_user
        CHECK (max_completions_per_user > 0),

    CONSTRAINT fk_challenge_mentor
        FOREIGN KEY (mentor_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_challenge_badge
        FOREIGN KEY (badge_reward_id) REFERENCES badges(badge_id)
        ON DELETE SET NULL
);

-- CHALLENGE PARTICIPANTS
-- Users participating in challenges
CREATE TABLE IF NOT EXISTS challenge_participants (
    challenge_participant_id SERIAL PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    progress_count INT NOT NULL DEFAULT 0,
    target_count INT NOT NULL DEFAULT 1,
    completion_count INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    participation_status VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT uq_challenge_user UNIQUE (challenge_id, user_id),

    CONSTRAINT chk_progress_values
        CHECK (progress_count >= 0 AND target_count > 0),

    CONSTRAINT chk_completion_count
        CHECK (completion_count >= 0),

    CONSTRAINT chk_participation_status
        CHECK (participation_status IN ('active', 'completed', 'withdrawn')),

    CONSTRAINT fk_participant_challenge
        FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_participant_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- CONTENT REPORTS
-- Supports moderation of users/challenges/profile content
CREATE TABLE IF NOT EXISTS content_reports (
    report_id SERIAL PRIMARY KEY,
    reporter_user_id INT NOT NULL,
    reported_user_id INT,
    challenge_id INT,
    report_type VARCHAR(30) NOT NULL,
    reason TEXT NOT NULL,
    report_status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_report_type
        CHECK (report_type IN ('user', 'challenge', 'message', 'profile')),

    CONSTRAINT chk_report_status
        CHECK (report_status IN ('open', 'reviewed', 'resolved', 'dismissed')),

    CONSTRAINT fk_report_reporter
        FOREIGN KEY (reporter_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_reported_user
        FOREIGN KEY (reported_user_id) REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_report_challenge
        FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
        ON DELETE SET NULL
);

-- ADMIN ACTIONS
-- Stores admin decisions and approvals
CREATE TABLE IF NOT EXISTS admin_actions (
    action_id SERIAL PRIMARY KEY,
    admin_user_id INT NOT NULL,
    report_id INT,
    challenge_id INT,
    action_type VARCHAR(30) NOT NULL,
    action_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_action_type
        CHECK (action_type IN ('approve_challenge', 'reject_challenge', 'warn_user', 'suspend_user', 'dismiss_report')),

    CONSTRAINT fk_action_admin
        FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_action_report
        FOREIGN KEY (report_id) REFERENCES content_reports(report_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_action_challenge
        FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_application_history_app ON application_history(application_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_google_signups_expires_at ON pending_google_signups(expires_at);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_receiver ON encouragements(receiver_id);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_user ON mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_mentor ON challenges(mentor_user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(challenge_status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(report_status);
