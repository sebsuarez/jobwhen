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
      completionCount
      participationStatus
      joinedAt
      completedAt
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
      defaultTargetCount
      challengeStatus
      participantLimit
      startDate
      dueDate
      createdAt
    }
  }
`

const MY_CREATED_CHALLENGES_QUERY = `
  query MyCreatedChallenges {
    myCreatedChallenges {
      challengeId
      title
      description
      xpReward
      defaultTargetCount
      challengeStatus
      participantLimit
      startDate
      dueDate
      createdAt
    }
  }
`

const CREATE_CHALLENGE_MUTATION = `
  mutation CreateChallenge(
    $title: String!
    $description: String!
    $xpReward: Int
    $defaultTargetCount: Int
    $participantLimit: Int
    $startDate: String
    $dueDate: String
  ) {
    createChallenge(
      title: $title
      description: $description
      xpReward: $xpReward
      defaultTargetCount: $defaultTargetCount
      participantLimit: $participantLimit
      startDate: $startDate
      dueDate: $dueDate
    ) {
      ok
      message
    }
  }
`

const DELETE_CHALLENGE_MUTATION = `
  mutation DeleteChallenge($challengeId: Int!) {
    deleteChallenge(challengeId: $challengeId) {
      ok
      message
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

const UPDATE_CHALLENGE_PROGRESS_MUTATION = `
  mutation UpdateChallengeProgress($challengeParticipantId: Int!, $delta: Int!) {
    updateChallengeProgress(challengeParticipantId: $challengeParticipantId, delta: $delta) {
      ok
      message
      participant {
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
        completionCount
        participationStatus
        joinedAt
        completedAt
      }
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

export async function updateChallengeProgress(challengeParticipantId, delta) {
  const data = await graphqlRequest(UPDATE_CHALLENGE_PROGRESS_MUTATION, { challengeParticipantId, delta })
  return data.updateChallengeProgress
}

export async function fetchMyCreatedChallenges() {
  const data = await graphqlRequest(MY_CREATED_CHALLENGES_QUERY)
  return data.myCreatedChallenges
}

export async function createChallenge(input) {
  const data = await graphqlRequest(CREATE_CHALLENGE_MUTATION, input)
  return data.createChallenge
}

export async function deleteChallenge(challengeId) {
  const data = await graphqlRequest(DELETE_CHALLENGE_MUTATION, { challengeId })
  return data.deleteChallenge
}
