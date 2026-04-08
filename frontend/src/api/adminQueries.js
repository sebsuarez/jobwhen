import { graphqlRequest } from '../lib/graphqlRequest'


// Admin Queries (fetching data, think of it like a GET request)
const PENDING_CHALLENGES_QUERY = `
  query AdminPendingChallenges {
    adminPendingChallenges {
      challengeId
      mentorUserId
      mentorName
      title
      description
      xpReward
      challengeStatus
      participantLimit
      startDate
      dueDate
      createdAt
    }
  }
`

const PENDING_MENTORS_QUERY = `
  query AdminPendingMentors {
    adminPendingMentors {
      mentorProfileId
      userId
      fullName
      headline
      company
      jobTitle
      expertise
    }
  }
`

const ALL_USERS_QUERY = `
  query AdminAllUsers($query: String) {
    adminAllUsers(query: $query) {
      userId
      fullName
      email
      roleName
      isActive
      currentLevel
      headline
      createdAt
    }
  }
`

// Admin Mutations (modify or writing data)
const APPROVE_CHALLENGE_MUTATION = `
  mutation ApproveChallenge($challengeId: Int!) {
    approveChallenge(challengeId: $challengeId) {
      ok
      message
    }
  }
`

const REJECT_CHALLENGE_MUTATION = `
  mutation RejectChallenge($challengeId: Int!, $note: String) {
    rejectChallenge(challengeId: $challengeId, note: $note) {
      ok
      message
    }
  }
`

const APPROVE_MENTOR_MUTATION = `
  mutation ApproveMentor($userId: Int!) {
    approveMentor(userId: $userId) {
      ok
      message
    }
  }
`

const REJECT_MENTOR_MUTATION = `
  mutation RejectMentor($userId: Int!) {
    rejectMentor(userId: $userId) {
      ok
      message
    }
  }
`

const SUSPEND_USER_MUTATION = `
  mutation SuspendUser($targetUserId: Int!, $note: String!) {
    suspendUser(targetUserId: $targetUserId, note: $note) {
      ok
      message
    }
  }
`

const UNSUSPEND_USER_MUTATION = `
  mutation UnsuspendUser($targetUserId: Int!) {
    unsuspendUser(targetUserId: $targetUserId) {
      ok
      message
    }
  }
`

// Exported API functions
export async function fetchPendingChallenges() {
  const data = await graphqlRequest(PENDING_CHALLENGES_QUERY)
  return data.adminPendingChallenges
}

export async function fetchPendingMentors() {
  const data = await graphqlRequest(PENDING_MENTORS_QUERY)
  return data.adminPendingMentors
}

export async function fetchAllUsers(query = null) {
  const data = await graphqlRequest(ALL_USERS_QUERY, { query })
  return data.adminAllUsers
}

export async function approveChallenge(challengeId) {
  const data = await graphqlRequest(APPROVE_CHALLENGE_MUTATION, { challengeId })
  return data.approveChallenge
}

export async function rejectChallenge(challengeId, note = null) {
  const data = await graphqlRequest(REJECT_CHALLENGE_MUTATION, { challengeId, note })
  return data.rejectChallenge
}

export async function approveMentor(userId) {
  const data = await graphqlRequest(APPROVE_MENTOR_MUTATION, { userId })
  return data.approveMentor
}

export async function rejectMentor(userId) {
  const data = await graphqlRequest(REJECT_MENTOR_MUTATION, { userId })
  return data.rejectMentor
}

export async function suspendUser(targetUserId, note) {
  const data = await graphqlRequest(SUSPEND_USER_MUTATION, { targetUserId, note })
  return data.suspendUser
}

export async function unsuspendUser(targetUserId) {
  const data = await graphqlRequest(UNSUSPEND_USER_MUTATION, { targetUserId })
  return data.unsuspendUser
}
