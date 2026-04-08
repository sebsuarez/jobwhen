import { graphqlRequest } from '../lib/graphqlRequest'


// Challenge Queries (fetching data, think of it like a GET request)
const ACTIVE_CHALLENGES_QUERY = `
  query ActiveChallenges {
    activeChallenges {
      challengeParticipantId
      challengeId
      userId
      title
      description
      mentorName
      dueDate
      xpReward
      progressCount
      targetCount
      participationStatus
      joinedAt
    }
  }
`

const AVAILABLE_CHALLENGES_QUERY = `
  query AvailableChallenges {
    availableChallenges {
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

// Challenge Mutations (modify or writing data)
const JOIN_CHALLENGE_MUTATION = `
  mutation JoinChallenge($challengeId: Int!) {
    joinChallenge(challengeId: $challengeId) {
      ok
      message
    }
  }
`

const LEAVE_CHALLENGE_MUTATION = `
  mutation LeaveChallenge($challengeId: Int!) {
    leaveChallenge(challengeId: $challengeId) {
      ok
      message
    }
  }
`

// Exported API functions
export async function fetchActiveChallenges() {
  const data = await graphqlRequest(ACTIVE_CHALLENGES_QUERY)
  return data.activeChallenges
}

export async function fetchAvailableChallenges() {
  const data = await graphqlRequest(AVAILABLE_CHALLENGES_QUERY)
  return data.availableChallenges
}

export async function joinChallenge(challengeId) {
  const data = await graphqlRequest(JOIN_CHALLENGE_MUTATION, { challengeId })
  return data.joinChallenge
}

export async function leaveChallenge(challengeId) {
  const data = await graphqlRequest(LEAVE_CHALLENGE_MUTATION, { challengeId })
  return data.leaveChallenge
}
