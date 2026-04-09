import { graphqlRequest } from '../lib/graphqlRequest'


const PROFILE_INSIGHTS_QUERY = `
  query ProfileInsights {
    myBadges {
      userBadgeId
      earnedAt
      badge {
        badgeId
      }
    }
    myXpHistory {
      xpEventId
    }
  }
`

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

export async function fetchProfileInsights() {
  const data = await graphqlRequest(PROFILE_INSIGHTS_QUERY)
  return {
    myBadges: data.myBadges ?? [],
    myXpHistory: data.myXpHistory ?? [],
  }
}
