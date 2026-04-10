import { graphqlRequest } from '../lib/graphqlRequest'


// Friend Queries (fetching data, think of it like a GET request)
const MY_FRIENDS_QUERY = `
  query MyFriends {
    myFriends {
      friendshipId
      userId
      fullName
      headline
      location
      roleName
      applicationCount
      currentLevel
      currentXp
    }
  }
`

const PENDING_REQUESTS_QUERY = `
  query PendingFriendRequests {
    pendingFriendRequests {
      friendshipId
      userId
      fullName
      headline
      currentLevel
    }
  }
`

const SEARCH_USERS_QUERY = `
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      userId
      fullName
      email
      headline
      currentLevel
    }
  }
`

// Friend Mutations (modify or writing data)
const SEND_FRIEND_REQUEST_MUTATION = `
  mutation SendFriendRequest($addresseeId: Int!) {
    sendFriendRequest(addresseeId: $addresseeId) {
      ok
      message
    }
  }
`

const RESPOND_TO_FRIEND_REQUEST_MUTATION = `
  mutation RespondToFriendRequest($friendshipId: Int!, $accept: Boolean!) {
    respondToFriendRequest(friendshipId: $friendshipId, accept: $accept) {
      ok
      message
    }
  }
`

const SEND_ENCOURAGEMENT_MUTATION = `
  mutation SendEncouragement($receiverId: Int!, $message: String) {
    sendEncouragement(receiverId: $receiverId, message: $message) {
      ok
      message
    }
  }
`

// Exported API functions
export async function fetchMyFriends() {
  const data = await graphqlRequest(MY_FRIENDS_QUERY)
  return data.myFriends
}

export async function fetchPendingRequests() {
  const data = await graphqlRequest(PENDING_REQUESTS_QUERY)
  return data.pendingFriendRequests
}

export async function searchUsers(query) {
  const data = await graphqlRequest(SEARCH_USERS_QUERY, { query })
  return data.searchUsers
}

export async function sendFriendRequest(addresseeId) {
  const data = await graphqlRequest(SEND_FRIEND_REQUEST_MUTATION, { addresseeId })
  return data.sendFriendRequest
}

export async function respondToFriendRequest(friendshipId, accept) {
  const data = await graphqlRequest(RESPOND_TO_FRIEND_REQUEST_MUTATION, { friendshipId, accept })
  return data.respondToFriendRequest
}

export async function sendEncouragement(receiverId, message = null) {
  const data = await graphqlRequest(SEND_ENCOURAGEMENT_MUTATION, { receiverId, message })
  return data.sendEncouragement
}
