import { graphqlRequest } from '../lib/graphqlRequest'


// Profile Mutations (modify or writing data)
const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($headline: String, $bio: String, $location: String) {
    updateProfile(headline: $headline, bio: $bio, location: $location) {
      ok
      message
      user {
        userId
        fullName
        email
        headline
        bio
        location
        currentLevel
        currentXp
        streakDays
      }
    }
  }
`

// Exported API functions
export async function updateProfile({ headline, bio, location }) {
  const data = await graphqlRequest(UPDATE_PROFILE_MUTATION, { headline, bio, location })
  return data.updateProfile
}
