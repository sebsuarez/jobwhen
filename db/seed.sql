-- Job When? - Seed Data

-- ROLES
INSERT INTO roles (role_name) VALUES
('job_seeker'),
('mentor'),
('admin');

-- USERS
INSERT INTO users (
    role_id, full_name, email, headline, bio, location,
    current_level, current_xp, streak_days, is_active
) VALUES
-- Job seekers
(1, 'Ryan Khryss Obiar', 'ryankhryss.obiar@ucalgary.ca',
 'Software Engineering Student', 'Grinding applications and staying consistent.',
 'Calgary, AB, Canada', 7, 300, 9, TRUE),

(1, 'Armin Sandhu', 'armin.sandhu@ucalgary.ca',
 'Software Engineering Student', 'Google, hire me!',
 'Calgary, AB, Canada', 7, 340, 12, TRUE),

(1, 'Jason Nguyen', 'jason.nguyen2@ucalgary.ca',
 'Software Engineering Student', 'Just got hired!',
 'Calgary, AB, Canada', 20, 1200, 21, TRUE),

(1, 'Sebastian Suarez', 'sebastian.suarez@ucalgary.ca',
 'Software Engineering Student', 'Interviewing tomorrow.',
 'Calgary, AB, Canada', 10, 550, 5, TRUE),

(1, 'Omar Ahmed', 'omar.ahmed3@ucalgary.ca',
 'Software Engineering Student', 'Grinding today.',
 'Calgary, AB, Canada', 5, 180, 3, TRUE),

-- Mentors
(2, 'Dr. Chan', 'dr.chan@mentor.com',
 'Engineering Manager', 'Helping new grads stay accountable.',
 'Toronto, ON, Canada', 15, 0, 0, TRUE),

(2, 'Lisa Wong', 'lisa.wong@mentor.com',
 'Senior SWE', 'Happy to support interview prep and resumes.',
 'Vancouver, BC, Canada', 12, 0, 0, TRUE),

(2, 'James Park', 'james.park@mentor.com',
 'Recruiter', 'Sharing job search strategies and networking tips.',
 'Ottawa, ON, Canada', 11, 0, 0, TRUE),

-- Admin
(3, 'Mohammed Ali', 'mohammed.admin@jobwhen.com',
 'Platform Admin', 'Keeping the community safe and supportive.',
 'Calgary, AB, Canada', 1, 0, 0, TRUE);

-- USER SETTINGS
INSERT INTO user_settings (
    user_id, dark_mode, profile_visibility, notification_enabled,
    burnout_prompts_enabled, allow_friend_requests
) VALUES
(1, TRUE, 'friends', TRUE, TRUE, TRUE),
(2, TRUE, 'friends', TRUE, TRUE, TRUE),
(3, TRUE, 'public', TRUE, TRUE, TRUE),
(4, TRUE, 'friends', TRUE, TRUE, TRUE),
(5, TRUE, 'friends', TRUE, TRUE, TRUE),
(6, TRUE, 'public', TRUE, TRUE, TRUE),
(7, TRUE, 'public', TRUE, TRUE, TRUE),
(8, TRUE, 'public', TRUE, TRUE, TRUE),
(9, TRUE, 'private', TRUE, TRUE, FALSE);

-- BADGES
INSERT INTO badges (badge_name, description, level_required, icon_name) VALUES
('Level 1 Badge', 'Earned for reaching Level 1.', 1, 'badge-level-1'),
('Level 2 Badge', 'Earned for reaching Level 2.', 2, 'badge-level-2'),
('Level 3 Badge', 'Earned for reaching Level 3.', 3, 'badge-level-3'),
('Level 4 Badge', 'Earned for reaching Level 4.', 4, 'badge-level-4'),
('Level 5 Badge', 'Earned for reaching Level 5.', 5, 'badge-level-5'),
('Level 6 Badge', 'Earned for reaching Level 6.', 6, 'badge-level-6'),
('Level 7 Badge', 'Earned for reaching Level 7.', 7, 'badge-level-7'),
('Interview Sprinter', 'Awarded for completing interview-related challenges.', NULL, 'badge-interview'),
('Apply-a-thon Finisher', 'Awarded for finishing application sprint challenges.', NULL, 'badge-apply');

-- USER BADGES
INSERT INTO user_badges (user_id, badge_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5),
(5, 1), (5, 2), (5, 3);

-- FRIENDSHIPS
INSERT INTO friendships (requester_id, addressee_id, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(1, 4, 'accepted'),
(1, 5, 'accepted'),
(2, 3, 'accepted');

-- ENCOURAGEMENTS
INSERT INTO encouragements (sender_id, receiver_id, message) VALUES
(2, 1, 'Keep pushing, you are close!'),
(3, 1, 'You got this!'),
(1, 4, 'Good luck on your interview tomorrow!'),
(1, 5, 'Stay consistent, one step at a time.');

-- GOALS
INSERT INTO goals (
    user_id, goal_type, target_count, current_count, start_date, end_date, is_completed
) VALUES
(1, 'daily', 3, 1, '2026-03-01', '2026-03-01', FALSE),
(1, 'weekly', 10, 6, '2026-03-01', '2026-03-07', FALSE),
(2, 'weekly', 8, 8, '2026-03-01', '2026-03-07', TRUE);

-- JOB APPLICATIONS
INSERT INTO job_applications (
    user_id, company_name, role_title, location, job_link, salary_range, status,
    notes, application_deadline, applied_date
) VALUES
(1, 'Amazon', 'SDE New Grad', 'Vancouver, BC', 'https://amazon.jobs', '$110k-$140k',
 'wishlist', 'Strong fit for backend + referral possible.', '2026-03-01', NULL),

(1, 'Vercel', 'DX Engineer', 'Remote', 'https://vercel.com/careers', '$120k',
 'wishlist', 'Great culture fit. Tailwind/Next.js stack.', NULL, NULL),

(1, 'Google', 'SWE Intern', 'Waterloo, ON', 'https://careers.google.com', '$55/hr',
 'applied', 'Applied via referral. Resume v3 used.', NULL, '2026-02-20'),

(1, 'Stripe', 'Full Stack Engineer', 'Remote', 'https://stripe.com/jobs', '$130k-$180k',
 'applied', 'OA completed.', NULL, '2026-02-22'),

(1, 'Datadog', 'Backend Engineer', 'NYC, NY', 'https://datadoghq.com/careers', '$135k',
 'applied', 'Recruiter reached out.', NULL, '2026-02-25'),

(1, 'Shopify', 'Frontend Engineer', 'Ottawa, ON', 'https://shopify.com/careers', '$95k-$120k',
 'interview', '2nd round scheduled.', NULL, '2026-02-14'),

(1, 'Coinbase', 'Software Engineer', 'Remote', 'https://www.coinbase.com/careers', '$145k',
 'interview', 'System design round next.', NULL, '2026-02-10'),

(1, 'Figma', 'Software Engineer', 'SF, CA', 'https://figma.com/careers', '$140k',
 'offered', 'Offer received. Deadline Mar 5.', '2026-03-05', '2026-01-30'),

(1, 'Meta', 'Production Engineer', 'Menlo Park, CA', 'https://careers.meta.com', '$120k-$150k',
 'rejected', 'Did not pass phone screen.', NULL, '2026-02-01'),

(1, 'Notion', 'Frontend Developer', 'SF, CA', 'https://www.notion.so/careers', '$125k',
 'ghosted', 'No response after final round.', NULL, '2026-01-15');

-- APPLICATION HISTORY
INSERT INTO application_history (application_id, old_status, new_status, note) VALUES
(1, NULL, 'wishlist', 'Added to wishlist.'),
(2, NULL, 'wishlist', 'Added to wishlist.'),
(3, NULL, 'applied', 'Application submitted.'),
(4, NULL, 'applied', 'Application submitted.'),
(5, NULL, 'applied', 'Application submitted.'),
(6, NULL, 'applied', 'Application submitted.'),
(6, 'applied', 'interview', 'Moved after recruiter response.'),
(7, NULL, 'applied', 'Application submitted.'),
(7, 'applied', 'interview', 'Interview scheduled.'),
(8, NULL, 'applied', 'Application submitted.'),
(8, 'applied', 'interview', 'Interviewed successfully.'),
(8, 'interview', 'offered', 'Offer extended.'),
(9, NULL, 'applied', 'Application submitted.'),
(9, 'applied', 'rejected', 'Rejected after phone screen.'),
(10, NULL, 'applied', 'Application submitted.'),
(10, 'applied', 'ghosted', 'No response after final round.');

-- XP EVENTS
INSERT INTO xp_events (user_id, event_type, xp_amount, description) VALUES
(1, 'job_application', 20, 'Applied to Google SWE Intern'),
(1, 'job_application', 20, 'Applied to Stripe Full Stack Engineer'),
(1, 'job_application', 20, 'Applied to Datadog Backend Engineer'),
(1, 'goal_progress', 30, 'Made progress toward weekly application goal'),
(1, 'challenge_completion', 50, 'Completed part of Apply-a-thon'),
(1, 'streak_bonus', 40, 'Maintained 9 day streak'),
(2, 'streak_bonus', 50, 'Maintained 12 day streak'),
(3, 'badge_unlock', 75, 'Reached level 20 milestone');

-- MOOD CHECK-INS
INSERT INTO mood_checkins (user_id, mood_score, reflection) VALUES
(1, 4, 'Feeling productive today.'),
(1, 2, 'A bit discouraged after rejection.'),
(1, 3, 'Trying to stay consistent.'),
(2, 5, 'Feeling confident this week.'),
(5, 2, 'Burnt out and need motivation.');

-- BURNOUT ALERTS
INSERT INTO burnout_alerts (user_id, trigger_reason, supportive_message, resolved) VALUES
(1, 'Multiple low mood check-ins in one week',
 'You have been under pressure lately. Consider lowering today''s goal and focusing on one small win.',
 FALSE),

(5, 'Low mood score and low streak consistency',
 'Take a small step today—update one application or reach out to one connection.',
 FALSE);

-- MENTOR PROFILES
INSERT INTO mentor_profiles (
    user_id, company, job_title, expertise, availability, is_approved
) VALUES
(6, 'Google', 'Engineering Manager', 'Career strategy, mock interviews, systems design', 'Tue/Thu evenings', TRUE),
(7, 'Meta', 'Senior SWE', 'Frontend interviews, resume reviews', 'Weekends', TRUE),
(8, 'Shopify', 'Recruiter', 'Networking, recruiter expectations, resumes', 'Mon/Wed afternoons', TRUE);

-- CHALLENGES
INSERT INTO challenges (
    mentor_user_id, title, description, xp_reward, badge_reward_id,
    challenge_status, participant_limit, start_date, due_date
) VALUES
(6, 'Apply-a-thon',
 'Submit 5 applications this week.',
 100, 9, 'approved', 100, '2026-03-01', '2026-03-07'),

(7, 'Interview Prep Sprint',
 'Complete 3 mock interview questions and post one reflection.',
 120, 8, 'approved', 50, '2026-03-01', '2026-03-05'),

(8, 'Network Boost',
 'Reach out to 2 new connections this week.',
 80, NULL, 'approved', 75, '2026-03-01', '2026-03-07'),

(7, 'Resume Roast (Kind)',
 'Submit your resume for constructive peer and mentor feedback.',
 60, NULL, 'in_review', 40, '2026-03-02', '2026-03-10'),

(6, 'LeetCode Ladder',
 'Solve 5 medium problems and reflect on patterns.',
 150, NULL, 'rejected', 60, '2026-03-02', '2026-03-12'),

(6, 'Mock Interview Week',
 'Complete 3 mock interview sessions over the week.',
 250, 8, 'draft', 50, '2026-03-03', '2026-03-10');

-- ChALLENGE PARTICIPANTS
INSERT INTO challenge_participants (
    challenge_id, user_id, progress_count, target_count, participation_status
) VALUES
(1, 1, 3, 5, 'active'),
(2, 1, 1, 3, 'active'),
(3, 1, 0, 2, 'active'),
(1, 2, 5, 5, 'completed'),
(2, 2, 2, 3, 'active'),
(1, 3, 5, 5, 'completed');

-- REPORTS
INSERT INTO content_reports (
    reporter_user_id, reported_user_id, challenge_id, report_type, reason, report_status
) VALUES
(1, NULL, 5, 'challenge', 'Challenge requirements are unclear and reward is too high.', 'open'),
(2, 5, NULL, 'profile', 'Inappropriate status message.', 'reviewed'),
(3, NULL, 4, 'challenge', 'Possible spam or duplicate challenge.', 'open');

-- ADMIN ACTIONS
INSERT INTO admin_actions (
    admin_user_id, report_id, challenge_id, action_type, action_note
) VALUES
(9, NULL, 1, 'approve_challenge', 'Challenge meets guidelines and is approved.'),
(9, NULL, 5, 'reject_challenge', 'Reward/value mismatch and insufficient description.'),
(9, 2, NULL, 'warn_user', 'Issued warning for inappropriate public profile content');