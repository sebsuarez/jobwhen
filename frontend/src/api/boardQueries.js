import { graphqlRequest } from '../lib/graphqlRequest'


// Job Board Queries (fetching data, think of it like a GET request)
const JOB_APPLICATIONS_QUERY = `
  query GetJobApplications($userId: Int!) {
    jobApplications(userId: $userId) {
      applicationId
      companyName
      roleTitle
      location
      salaryRange
      status
      notes
      jobLink
      applicationDeadline
      appliedDate
      updatedAt
    }
  }
`

// Job Board Mutations (modify or writing data)
const CREATE_JOB_APPLICATION_MUTATION = `
  mutation CreateJobApplication($input: CreateJobApplicationInput!) {
    createJobApplication(input: $input) {
      ok
      application {
        applicationId
        companyName
        roleTitle
        location
        salaryRange
        status
        notes
        jobLink
        applicationDeadline
        appliedDate
        updatedAt
      }
    }
  }
`

const UPDATE_STATUS_MUTATION = `
  mutation UpdateJobApplicationStatus($applicationId: Int!, $newStatus: String!, $note: String) {
    updateJobApplicationStatus(applicationId: $applicationId, newStatus: $newStatus, note: $note) {
      ok
      application {
        applicationId
        status
        updatedAt
      }
    }
  }
`

// Exported API functions
export async function fetchJobApplications(userId) {
  const data = await graphqlRequest(JOB_APPLICATIONS_QUERY, { userId })
  return data.jobApplications
}

export async function createJobApplication(input) {
  const data = await graphqlRequest(CREATE_JOB_APPLICATION_MUTATION, { input })
  return data.createJobApplication
}

export async function updateJobApplicationStatus(applicationId, newStatus, note = null) {
  const data = await graphqlRequest(UPDATE_STATUS_MUTATION, { applicationId, newStatus, note })
  return data.updateJobApplicationStatus
}
