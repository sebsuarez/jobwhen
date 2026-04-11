-- Job When? - Seed Data
-- All passwords: jobwhen

-- CLEAR ALL DATA
TRUNCATE
  admin_actions, content_reports, challenge_participants, challenges,
  mentor_profiles, burnout_alerts, mood_checkins, encouragements,
  friendships, user_badges, badges, xp_events, goals,
  application_history, job_applications, user_settings,
  pending_google_signups, sessions, users, roles
RESTART IDENTITY CASCADE;

-- ROLES
INSERT INTO roles (role_name) VALUES
('job_seeker'),
('mentor'),
('admin')
ON CONFLICT DO NOTHING;

-- USERS
INSERT INTO users (
    role_id, password_hash, full_name, email, headline, bio, location,
    avatar, current_level, current_xp, streak_days, last_login_date, is_active
) VALUES
-- Job seekers
(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Armin Sandhu', 'arminsandhuu@gmail.com',
 'Software Engineering Student', 'Grinding applications and staying consistent.',
 'Calgary, AB', '🚀', 7, 400, 12, CURRENT_DATE, TRUE),

(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Ryan Obiar', 'ryan.obiar@ucalgary.ca',
 'Software Engineering Student', 'Chasing that offer letter!',
 'Calgary, AB', '💎', 7, 360, 9, CURRENT_DATE - 1, TRUE),

(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Jason Nguyen', 'jason.nguyen@ucalgary.ca',
 'Software Engineering Student', 'Just landed a FAANG offer!',
 'Vancouver, BC', '🏆', 20, 1140, 21, CURRENT_DATE, TRUE),

(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Sebastian Suarez', 'sebastian.suarez@ucalgary.ca',
 'Software Engineering Student', 'Interview round two tomorrow.',
 'Calgary, AB', '⚡', 10, 540, 5, CURRENT_DATE, TRUE),

(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Omar Ahmed', 'omar.ahmed@ucalgary.ca',
 'Software Engineering Student', 'Trying to stay motivated.',
 'Calgary, AB', '😤', 4, 180, 3, CURRENT_DATE, TRUE),

(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Maya Chen', 'maya.chen@ucalgary.ca',
 'Software Engineering Student', 'Just starting my job search!',
 'Toronto, ON', '🌟', 1, 0, 1, CURRENT_DATE, TRUE),

-- Mentors (approved)
(2, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Dr. Chan', 'dr.chan@mentor.com',
 'Engineering Manager @ Google', 'Helping new grads stay accountable.',
 'Toronto, ON', '👨‍🏫', 1, 0, 0, CURRENT_DATE, TRUE),

(2, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Lisa Wong', 'lisa.wong@mentor.com',
 'Senior SWE @ Meta', 'Happy to support interview prep and resumes.',
 'Vancouver, BC', '👩‍💻', 1, 0, 0, CURRENT_DATE, TRUE),

(2, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'James Park', 'james.park@mentor.com',
 'Recruiter @ Shopify', 'Sharing job search strategies and networking tips.',
 'Ottawa, ON', '🎯', 1, 0, 0, CURRENT_DATE, TRUE),

-- Mentors (pending)
(2, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Priya Patel', 'priya.patel@mentor.com',
 'Software Engineer II @ Amazon', 'Want to help new grads crack distributed systems interviews.',
 'Seattle, WA', '🔥', 1, 0, 0, CURRENT_DATE, TRUE),

(2, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Raj Sharma', 'raj.sharma@mentor.com',
 'Product Manager @ Microsoft', 'PM interviews, case studies, and product thinking.',
 'Redmond, WA', '💡', 1, 0, 0, CURRENT_DATE, TRUE),

-- Admin
(3, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Mohammed Ali', 'admin@jobwhen.com',
 'Platform Admin', 'Keeping the community safe and supportive.',
 'Calgary, AB', NULL, 1, 0, 0, CURRENT_DATE, TRUE),

-- Suspended job seeker
(1, 'pbkdf2_sha256$260000$0123456789abcdeffedcba9876543210$fkvCNeKjXEN9e3csWUxhlSo9MDJFuqy4AR53vW5Ec38=',
 'Sam Torres', 'sam.torres@ucalgary.ca',
 'Software Engineering Student', 'Violated community guidelines.',
 'Calgary, AB', '👾', 3, 120, 0, NULL, FALSE)

ON CONFLICT (email) DO NOTHING;

-- USER SETTINGS
INSERT INTO user_settings (
    user_id, dark_mode, profile_visibility, notification_enabled,
    burnout_prompts_enabled, allow_friend_requests
) VALUES
(1,  TRUE, 'friends', TRUE,  TRUE,  TRUE),
(2,  TRUE, 'friends', TRUE,  TRUE,  TRUE),
(3,  TRUE, 'public',  TRUE,  TRUE,  TRUE),
(4,  TRUE, 'friends', TRUE,  TRUE,  TRUE),
(5,  TRUE, 'friends', TRUE,  TRUE,  TRUE),
(6,  TRUE, 'public',  TRUE,  TRUE,  TRUE),
(7,  TRUE, 'public',  TRUE,  TRUE,  TRUE),
(8,  TRUE, 'public',  TRUE,  TRUE,  TRUE),
(9,  TRUE, 'public',  TRUE,  TRUE,  TRUE),
(10, TRUE, 'public',  TRUE,  TRUE,  TRUE),
(11, TRUE, 'public',  TRUE,  TRUE,  TRUE),
(12, TRUE, 'private', FALSE, FALSE, FALSE),
(13, TRUE, 'friends', TRUE,  TRUE,  TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- BADGES
INSERT INTO badges (badge_name, description, level_required, icon_name) VALUES
('Level 1 Badge',          'Reached Level 1.',                        1,    'badge-level-1'),
('Level 2 Badge',          'Reached Level 2.',                        2,    'badge-level-2'),
('Level 3 Badge',          'Reached Level 3.',                        3,    'badge-level-3'),
('Level 4 Badge',          'Reached Level 4.',                        4,    'badge-level-4'),
('Level 5 Badge',          'Reached Level 5.',                        5,    'badge-level-5'),
('Level 6 Badge',          'Reached Level 6.',                        6,    'badge-level-6'),
('Level 7 Badge',          'Reached Level 7.',                        7,    'badge-level-7'),
('Interview Sprinter',     'Completed interview-related challenges.', NULL, 'badge-interview'),
('Apply-a-thon Finisher',  'Finished an application sprint.',         NULL, 'badge-apply')
ON CONFLICT (badge_name) DO NOTHING;

-- USER BADGES
INSERT INTO user_badges (user_id, badge_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),
(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,9),
(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),
(5,1),(5,2),(5,3),(5,4),
(6,1),
(13,1),(13,2),(13,3)
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- MENTOR PROFILES
INSERT INTO mentor_profiles (user_id, company, job_title, expertise, availability, is_approved)
VALUES
(7,  'Google',    'Engineering Manager',   'Career strategy, mock interviews, systems design', 'Tue/Thu evenings', TRUE),
(8,  'Meta',      'Senior SWE',            'Frontend interviews, resume reviews, JS frameworks', 'Weekends',         TRUE),
(9,  'Shopify',   'Recruiter',             'Networking, recruiter expectations, resume tips',    'Mon/Wed afternoons', TRUE),
(10, 'Amazon',    'Software Engineer II',  'Distributed systems, backend design, AWS',          'Weekday evenings',  FALSE),
(11, 'Microsoft', 'Product Manager',       'PM interviews, case studies, product thinking',     'Flexible',          FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- FRIENDSHIPS
INSERT INTO friendships (requester_id, addressee_id, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(1, 4, 'accepted'),
(2, 3, 'accepted'),
(3, 5, 'accepted'),
(5, 6, 'pending'),
(1, 7, 'accepted'),
(2, 8, 'accepted')
ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- ENCOURAGEMENTS
INSERT INTO encouragements (sender_id, receiver_id, message)
SELECT * FROM (VALUES
    (2::INT, 1::INT, 'You are making great progress, keep it up!'),
    (3::INT, 1::INT, 'You have got this, almost there!'),
    (3::INT, 5::INT, 'Hang in there Omar, stay consistent!')
) AS v(sender_id, receiver_id, message)
WHERE NOT EXISTS (SELECT 1 FROM encouragements LIMIT 1);

-- GOALS
INSERT INTO goals (user_id, goal_type, target_count, current_count, week_of, start_date, end_date, is_completed)
VALUES
(1, 'job_application', 10, 7,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), FALSE),
(1, 'wellness_checkin', 5,  5,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), TRUE),
(1, 'interview_prep',   3,  1,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), FALSE),
(2, 'job_application',  8,  8,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), TRUE),
(2, 'interview_prep',   4,  2,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), FALSE),
(3, 'job_application',  5,  5,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), TRUE),
(3, 'wellness_checkin', 7,  7,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), TRUE),
(3, 'interview_prep',   5,  5,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), TRUE),
(4, 'interview_prep',   3,  0,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), FALSE),
(5, 'wellness_checkin', 5,  1,  DATE_TRUNC('week', CURRENT_DATE)::DATE, DATE_TRUNC('week', CURRENT_DATE)::DATE, (DATE_TRUNC('week', CURRENT_DATE)::DATE + 365), FALSE)
ON CONFLICT (user_id, goal_type) DO NOTHING;

-- JOB APPLICATIONS
INSERT INTO job_applications (
    user_id, company_name, role_title, location, job_link, salary_range, status,
    notes, application_deadline, applied_date
)
SELECT * FROM (VALUES
    (1::INT, 'Amazon',   'SDE New Grad',          'Vancouver, BC', 'https://amazon.jobs',           '$110k–$140k', 'wishlist',   'Strong backend fit, referral possible.',        (CURRENT_DATE + 30)::DATE, NULL::DATE),
    (1::INT, 'Vercel',   'DX Engineer',            'Remote',        'https://vercel.com/careers',    '$120k',       'wishlist',   'Great culture, Tailwind + Next.js stack.',      NULL::DATE,                NULL::DATE),
    (1::INT, 'Google',   'SWE Intern',             'Waterloo, ON',  'https://careers.google.com',    '$55/hr',      'applied',    'Applied via referral. Resume v3 used.',         NULL::DATE,                (CURRENT_DATE - 10)::DATE),
    (1::INT, 'Stripe',   'Full Stack Engineer',    'Remote',        'https://stripe.com/jobs',       '$130k–$180k', 'applied',    'OA completed.',                                 NULL::DATE,                (CURRENT_DATE - 8)::DATE),
    (1::INT, 'Datadog',  'Backend Engineer',       'NYC, NY',       'https://datadoghq.com/careers', '$135k',       'applied',    'Recruiter reached out first.',                  NULL::DATE,                (CURRENT_DATE - 7)::DATE),
    (1::INT, 'Shopify',  'Frontend Engineer',      'Ottawa, ON',    'https://shopify.com/careers',   '$95k–$120k',  'interview',  '2nd round scheduled for next week.',            NULL::DATE,                (CURRENT_DATE - 14)::DATE),
    (1::INT, 'Coinbase', 'Software Engineer',      'Remote',        'https://coinbase.com/careers',  '$145k',       'interview',  'System design round coming up.',                NULL::DATE,                (CURRENT_DATE - 12)::DATE),
    (1::INT, 'Figma',    'Software Engineer',      'SF, CA',        'https://figma.com/careers',     '$140k',       'offer',      'Offer received! Deciding soon.',                (CURRENT_DATE + 7)::DATE,  (CURRENT_DATE - 30)::DATE),
    (1::INT, 'Meta',     'Production Engineer',    'Menlo Park, CA','https://careers.meta.com',      '$120k–$150k', 'rejected',   'Did not pass the phone screen.',                NULL::DATE,                (CURRENT_DATE - 20)::DATE),
    (1::INT, 'Notion',   'Frontend Developer',     'SF, CA',        'https://notion.so/careers',     '$125k',       'ghosted',    'No response after final round.',                NULL::DATE,                (CURRENT_DATE - 35)::DATE),
    (2::INT, 'Netflix',  'SWE New Grad',           'Los Gatos, CA', 'https://jobs.netflix.com',      '$150k',       'wishlist',   'Dream company.',                                NULL::DATE,                NULL::DATE),
    (2::INT, 'Lyft',     'Backend Engineer',       'SF, CA',        'https://lyft.com/careers',      '$125k',       'applied',    'Applied last week.',                            NULL::DATE,                (CURRENT_DATE - 5)::DATE),
    (2::INT, 'Airbnb',   'Frontend Engineer',      'SF, CA',        'https://careers.airbnb.com',    '$130k',       'interview',  'First round done, felt great.',                 NULL::DATE,                (CURRENT_DATE - 9)::DATE),
    (2::INT, 'Dropbox',  'Software Engineer',      'Remote',        'https://dropbox.com/jobs',      '$115k',       'rejected',   'Did not progress after OA.',                    NULL::DATE,                (CURRENT_DATE - 15)::DATE),
    (2::INT, 'Apple',    'Software Engineer',      'Cupertino, CA', 'https://jobs.apple.com',        '$140k',       'ghosted',    'Recruiter went quiet after 2 rounds.',           NULL::DATE,                (CURRENT_DATE - 25)::DATE),
    (3::INT, 'Uber',     'Backend Engineer',       'SF, CA',        'https://uber.com/careers',      '$145k',       'applied',    'Referred by a friend at Uber.',                 NULL::DATE,                (CURRENT_DATE - 3)::DATE),
    (3::INT, 'LinkedIn', 'SWE New Grad',           'Sunnyvale, CA', 'https://careers.linkedin.com',  '$135k',       'applied',    'Cold applied through portal.',                  NULL::DATE,                (CURRENT_DATE - 6)::DATE),
    (3::INT, 'Salesforce','SWE',                   'SF, CA',        'https://salesforce.com/careers','$130k',       'interview',  'Technical phone screen scheduled.',             NULL::DATE,                (CURRENT_DATE - 10)::DATE),
    (3::INT, 'GitHub',   'Developer Advocate',     'Remote',        'https://github.com/about/careers','$140k',     'interview',  'Culture fit interview next.',                   NULL::DATE,                (CURRENT_DATE - 8)::DATE),
    (3::INT, 'MongoDB',  'Backend Engineer',       'NYC, NY',       'https://mongodb.com/careers',   '$145k',       'offer',      'Offer #1 received! Evaluating.',                (CURRENT_DATE + 5)::DATE,  (CURRENT_DATE - 25)::DATE),
    (3::INT, 'Cloudflare','Systems Engineer',      'Remote',        'https://cloudflare.com/careers','$150k',       'offer',      'Offer #2! Stock package looks great.',           (CURRENT_DATE + 10)::DATE, (CURRENT_DATE - 22)::DATE),
    (3::INT, 'Atlassian','Frontend Engineer',      'NYC, NY',       'https://atlassian.com/company/careers','$125k','rejected',   'Mismatch on team fit.',                         NULL::DATE,                (CURRENT_DATE - 30)::DATE),
    (3::INT, 'Docker',   'DevOps Engineer',        'Remote',        'https://docker.com/careers',    '$120k',       'rejected',   'Rejected post OA.',                             NULL::DATE,                (CURRENT_DATE - 28)::DATE),
    (4::INT, 'Slack',    'Software Engineer',      'SF, CA',        'https://slack.com/careers',     '$130k',       'wishlist',   'Need to tailor resume first.',                  NULL::DATE,                NULL::DATE),
    (4::INT, 'Zoom',     'Software Engineer',      'San Jose, CA',  'https://careers.zoom.us',       '$120k',       'applied',    'Applied this week.',                            NULL::DATE,                (CURRENT_DATE - 4)::DATE),
    (4::INT, 'Twilio',   'Backend Engineer',       'Remote',        'https://twilio.com/en-us/company/jobs','$125k', 'applied',    'OA invite received.',                           NULL::DATE,                (CURRENT_DATE - 6)::DATE),
    (5::INT, 'Shopify',  'SDE',                    'Ottawa, ON',    'https://shopify.com/careers',   '$95k',        'wishlist',   'Will apply once I fix my resume.',              NULL::DATE,                NULL::DATE),
    (5::INT, 'Square',   'Backend Engineer',       'SF, CA',        'https://squareup.com/careers',  '$110k',       'applied',    'Applied but feeling burnt out.',                NULL::DATE,                (CURRENT_DATE - 2)::DATE),
    (13::INT,'Reddit',   'Backend Engineer',       'Remote',        'https://redditinc.com/careers', '$130k',       'applied',    'Submitted before account was suspended.',       NULL::DATE,                (CURRENT_DATE - 5)::DATE),
    (13::INT,'Discord',  'Software Engineer',      'SF, CA',        'https://discord.com/jobs',      '$125k',       'interview',  'Had a phone screen before suspension.',         NULL::DATE,                (CURRENT_DATE - 10)::DATE)
) AS v(user_id, company_name, role_title, location, job_link, salary_range, status,
       notes, application_deadline, applied_date)
WHERE NOT EXISTS (SELECT 1 FROM job_applications LIMIT 1);

-- APPLICATION HISTORY
INSERT INTO application_history (application_id, old_status, new_status, note)
SELECT * FROM (VALUES
    (1::INT,  NULL::VARCHAR,  'wishlist',   'Added to wishlist.'),
    (2::INT,  NULL,           'wishlist',   'Added to wishlist.'),
    (3::INT,  NULL,           'applied',    'Submitted via referral.'),
    (4::INT,  NULL,           'applied',    'OA submitted.'),
    (5::INT,  NULL,           'applied',    'Recruiter cold outreach.'),
    (6::INT,  NULL,           'applied',    'Applied through portal.'),
    (6::INT,  'applied',      'interview',  'Recruiter invited to phone screen.'),
    (7::INT,  NULL,           'applied',    'Applied through portal.'),
    (7::INT,  'applied',      'interview',  'System design round scheduled.'),
    (8::INT,  NULL,           'applied',    'Applied with strong referral.'),
    (8::INT,  'applied',      'interview',  'Passed all rounds.'),
    (8::INT,  'interview',    'offer',      'Offer extended — evaluating!'),
    (9::INT,  NULL,           'applied',    'Applied directly.'),
    (9::INT,  'applied',      'rejected',   'Did not pass phone screen.'),
    (10::INT, NULL,           'applied',    'Applied through portal.'),
    (10::INT, 'applied',      'ghosted',    'No response after final round.'),
    (11::INT, NULL,           'wishlist',   'Added to wishlist.'),
    (12::INT, NULL,           'applied',    'Submitted last week.'),
    (13::INT, NULL,           'applied',    'Applied and heard back fast.'),
    (13::INT, 'applied',      'interview',  'Phone screen passed.'),
    (14::INT, NULL,           'applied',    'Applied.'),
    (14::INT, 'applied',      'rejected',   'Did not advance after OA.'),
    (15::INT, NULL,           'applied',    'Applied.'),
    (15::INT, 'applied',      'ghosted',    'Recruiter went silent.'),
    (16::INT, NULL,           'applied',    'Friend referral.'),
    (17::INT, NULL,           'applied',    'Portal application.'),
    (18::INT, NULL,           'applied',    'Applied directly.'),
    (18::INT, 'applied',      'interview',  'Technical screen scheduled.'),
    (19::INT, NULL,           'applied',    'Applied.'),
    (19::INT, 'applied',      'interview',  'Culture fit round next.'),
    (20::INT, NULL,           'applied',    'Applied.'),
    (20::INT, 'applied',      'interview',  'Multiple rounds passed.'),
    (20::INT, 'interview',    'offer',      'Offer received!'),
    (21::INT, NULL,           'applied',    'Applied.'),
    (21::INT, 'applied',      'interview',  'Passed technical rounds.'),
    (21::INT, 'interview',    'offer',      'Second offer in hand!'),
    (22::INT, NULL,           'applied',    'Applied.'),
    (22::INT, 'applied',      'rejected',   'Team fit mismatch.'),
    (23::INT, NULL,           'applied',    'Applied.'),
    (23::INT, 'applied',      'rejected',   'Rejected post OA.'),
    (24::INT, NULL,           'wishlist',   'Added to wishlist.'),
    (25::INT, NULL,           'applied',    'Applied this week.'),
    (26::INT, NULL,           'applied',    'OA invite received.'),
    (27::INT, NULL,           'wishlist',   'Added to wishlist.'),
    (28::INT, NULL,           'applied',    'Applied while burnt out.'),
    (29::INT, NULL,           'applied',    'Applied before suspension.'),
    (30::INT, NULL,           'applied',    'Applied before suspension.'),
    (30::INT, 'applied',      'interview',  'Phone screen before account was suspended.')
) AS v(application_id, old_status, new_status, note)
WHERE NOT EXISTS (SELECT 1 FROM application_history LIMIT 1);

-- XP EVENTS
INSERT INTO xp_events (user_id, event_type, xp_amount, description)
SELECT * FROM (VALUES
    (1::INT, 'job_application',    20, 'Applied to Google SWE Intern'),
    (1::INT, 'job_application',    20, 'Applied to Stripe Full Stack Engineer'),
    (1::INT, 'job_application',    20, 'Applied to Datadog Backend Engineer'),
    (1::INT, 'goal_completion',    30, 'Completed wellness check-in goal this week'),
    (1::INT, 'challenge_completed',100,'Completed Apply-a-thon challenge (partial)'),
    (1::INT, 'streak_bonus',       60, 'Maintained a 12-day login streak'),
    (2::INT, 'job_application',    20, 'Applied to Lyft Backend Engineer'),
    (2::INT, 'job_application',    20, 'Applied to Airbnb Frontend Engineer'),
    (2::INT, 'goal_completion',    30, 'Completed job application goal this week'),
    (2::INT, 'streak_bonus',       40, 'Maintained a 9-day streak'),
    (3::INT, 'challenge_completed',100,'Completed Apply-a-thon — collected reward'),
    (3::INT, 'goal_completion',    30, 'Completed all 3 goals this week'),
    (3::INT, 'goal_completion',    30, 'Completed interview prep goal'),
    (3::INT, 'goal_completion',    30, 'Completed wellness goal'),
    (3::INT, 'streak_bonus',       100,'Maintained a 21-day streak'),
    (4::INT, 'job_application',    20, 'Applied to Zoom Software Engineer'),
    (4::INT, 'job_application',    20, 'Applied to Twilio Backend Engineer'),
    (5::INT, 'job_application',    20, 'Applied to Square Backend Engineer')
) AS v(user_id, event_type, xp_amount, description)
WHERE NOT EXISTS (SELECT 1 FROM xp_events LIMIT 1);

-- MOOD CHECK-INS
INSERT INTO mood_checkins (user_id, mood_score, reflection, checked_in_at)
SELECT * FROM (VALUES
    (1::INT, 4, 'Feeling productive, interviews going well.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (1::INT, 5, 'Got great feedback from Shopify interview!',  CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1::INT, 4, 'Staying focused on goals.',                   CURRENT_TIMESTAMP),
    (2::INT, 4, 'Airbnb interview felt solid.',                CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (3::INT, 5, 'Two offers in hand, feeling amazing!',        CURRENT_TIMESTAMP),
    (5::INT, 2, 'Feeling burnt out and discouraged.',          CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (5::INT, 2, 'Another rejection, hard to stay positive.',   CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (5::INT, 2, 'Really struggling to keep applying.',         CURRENT_TIMESTAMP)
) AS v(user_id, mood_score, reflection, checked_in_at)
WHERE NOT EXISTS (SELECT 1 FROM mood_checkins LIMIT 1);

-- BURNOUT ALERTS
INSERT INTO burnout_alerts (user_id, trigger_reason, supportive_message, resolved)
SELECT * FROM (VALUES
    (5::INT,
     'Three consecutive days of mood score 2 or below.',
     'You have been under a lot of pressure lately. Consider taking a small break and reaching out to a friend — your network is here for you.',
     FALSE)
) AS v(user_id, trigger_reason, supportive_message, resolved)
WHERE NOT EXISTS (SELECT 1 FROM burnout_alerts LIMIT 1);

-- CHALLENGES
INSERT INTO challenges (
    mentor_user_id, title, description, xp_reward, badge_reward_id,
    default_target_count, max_completions_per_user, challenge_status,
    participant_limit, start_date, due_date
)
SELECT * FROM (VALUES
    (7::INT, 'Apply-a-thon',
     'Submit 5 job applications this week. Consistency is the key to landing interviews.',
     100, 9::INT, 5, 3, 'approved'::VARCHAR, 100::INT,
     (CURRENT_DATE - 3)::DATE, (CURRENT_DATE + 11)::DATE),

    (8::INT, 'Interview Sprint',
     'Complete 3 mock interview questions and write a short reflection on each.',
     120, 8::INT, 3, 2, 'approved'::VARCHAR, 50::INT,
     (CURRENT_DATE - 3)::DATE, (CURRENT_DATE + 11)::DATE),

    (9::INT, 'Network Boost',
     'Reach out to 2 new industry connections this week via LinkedIn or email.',
     80, NULL::INT, 2, 4, 'approved'::VARCHAR, 75::INT,
     (CURRENT_DATE - 3)::DATE, (CURRENT_DATE + 11)::DATE),

    (7::INT, 'Resume Roast',
     'Submit your resume for peer and mentor feedback. Get actionable improvements.',
     60, NULL::INT, 1, 1, 'in_review'::VARCHAR, 40::INT,
     (CURRENT_DATE + 7)::DATE, (CURRENT_DATE + 21)::DATE),

    (8::INT, 'LeetCode Patterns',
     'Solve 5 medium-difficulty problems and document the patterns you used.',
     150, NULL::INT, 5, 2, 'in_review'::VARCHAR, 60::INT,
     (CURRENT_DATE + 7)::DATE, (CURRENT_DATE + 21)::DATE),

    (9::INT, 'Job Board Sprint',
     'Apply to 20 jobs in one day.',
     200, NULL::INT, 20, 1, 'rejected'::VARCHAR, 200::INT,
     (CURRENT_DATE + 3)::DATE, (CURRENT_DATE + 10)::DATE),

    (7::INT, 'App Blitz',
     'Send out 3 applications before the deadline. This challenge has now expired.',
     50, NULL::INT, 3, 1, 'approved'::VARCHAR, 50::INT,
     (CURRENT_DATE - 14)::DATE, (CURRENT_DATE - 3)::DATE)

) AS v(mentor_user_id, title, description, xp_reward, badge_reward_id,
       default_target_count, max_completions_per_user, challenge_status,
       participant_limit, start_date, due_date)
WHERE NOT EXISTS (SELECT 1 FROM challenges LIMIT 1);

-- CHALLENGE PARTICIPANTS
INSERT INTO challenge_participants (
    challenge_id, user_id, progress_count, target_count,
    completion_count, participation_status, completed_at
)
VALUES

(1, 1, 3, 5, 0, 'active',     NULL),
(1, 2, 5, 5, 0, 'completed',  CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 3, 0, 5, 1, 'withdrawn',  NULL),
(1, 4, 2, 5, 0, 'active',     NULL),
(2, 1, 2, 3, 0, 'active',     NULL),
(2, 5, 0, 3, 0, 'withdrawn',  NULL),
(2, 6, 1, 3, 0, 'active',     NULL),
(3, 3, 2, 2, 0, 'completed',  CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(3, 4, 0, 2, 0, 'active',     NULL),
(7, 1, 1, 3, 0, 'active',     NULL),
(7, 2, 2, 3, 0, 'active',     NULL)

ON CONFLICT (challenge_id, user_id) DO NOTHING;

-- CONTENT REPORTS
INSERT INTO content_reports (
    reporter_user_id, reported_user_id, challenge_id,
    report_type, reason, report_status
)
SELECT * FROM (VALUES
    (3::INT, NULL::INT, 6::INT,
     'challenge'::VARCHAR,
     'Challenge target of 20 applications in one day is unrealistic and could encourage low-quality submissions.',
     'open'::VARCHAR),
    (1::INT, 13::INT, NULL::INT,
     'profile'::VARCHAR,
     'Inappropriate content in profile status messages.',
     'reviewed'::VARCHAR)
) AS v(reporter_user_id, reported_user_id, challenge_id, report_type, reason, report_status)
WHERE NOT EXISTS (SELECT 1 FROM content_reports LIMIT 1);

-- ADMIN ACTIONS
INSERT INTO admin_actions (admin_user_id, report_id, challenge_id, action_type, action_note)
SELECT * FROM (VALUES
    (12::INT, NULL::INT, 1::INT, 'approve_challenge'::VARCHAR, 'Challenge meets community guidelines. Approved.'),
    (12::INT, NULL::INT, 2::INT, 'approve_challenge'::VARCHAR, 'Well-structured challenge. Approved.'),
    (12::INT, NULL::INT, 3::INT, 'approve_challenge'::VARCHAR, 'Good networking challenge. Approved.'),
    (12::INT, NULL::INT, 6::INT, 'reject_challenge'::VARCHAR, 'Target count of 20 applications in one day is unrealistic.'),
    (12::INT, 2::INT, NULL::INT, 'suspend_user'::VARCHAR, 'User suspended for repeated violations of community guidelines.')
) AS v(admin_user_id, report_id, challenge_id, action_type, action_note)
WHERE NOT EXISTS (SELECT 1 FROM admin_actions LIMIT 1);
