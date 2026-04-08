import { graphqlRequest } from '../lib/graphqlRequest'


// Profile Mutations (modify or writing data)
const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($headline: String, $bio: String, $location: String, $fullName: String, $avatar: String) {
    updateProfile(headline: $headline, bio: $bio, location: $location, fullName: $fullName, avatar: $avatar) {
      ok
      message
      user {
        userId
        fullName
        email
        headline
        bio
        location
        avatar
        currentLevel
        currentXp
        streakDays
      }
    }
  }
`

// Exported API functions
export async function updateProfile({ headline, bio, location, fullName, avatar }) {
  const data = await graphqlRequest(UPDATE_PROFILE_MUTATION, { headline, bio, location, fullName, avatar })
  return data.updateProfile
}
