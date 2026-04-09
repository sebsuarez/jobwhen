// components/MentorChallenges.jsx

import '../styles/MentorChallenges.css'

const STATUS_ORDER = ['approved', 'in_review', 'rejected']

const STATUS_CONFIG = {
  approved:  { label: 'Approved',  className: 'mentor-challenges__status--approved' },
  in_review: { label: 'In Review', className: 'mentor-challenges__status--review' },
  rejected:  { label: 'Rejected',  className: 'mentor-challenges__status--rejected' },
}

// TODO: replace with real API data once backend is ready
const MOCK_CHALLENGES = [
  {
    id: 1,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Encourages consistent application habits over a short sprint.',
    status: 'approved',
    participants: 12,
    isLoopable: true,
    loopCount: 3,
    maxLoops: 5,
  },
  {
    id: 2,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Great for students who need a push to get started.',
    status: 'approved',
    participants: 8,
    isLoopable: false,
    loopCount: 0,
    maxLoops: null,
  },
  {
    id: 3,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Intended to build momentum early in the job search process.',
    status: 'in_review',
    participants: 0,
    isLoopable: true,
    loopCount: 0,
    maxLoops: 3,
  },
  {
    id: 4,
    title: 'Apply-a-thon',
    duration: '5 Days',
    description: 'Submit 5 applications this week',
    reviewNote: 'Motivates students to apply broadly across different industries.',
    status: 'rejected',
    participants: 0,
    isLoopable: false,
    loopCount: 0,
    maxLoops: null,
  },
]

export default function MentorChallenges() {
  return (
    <aside className="mentor-challenges">
    </aside>
  )
}
