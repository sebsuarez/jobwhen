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

const UPDATE_JOB_APPLICATION_MUTATION = `
  mutation UpdateJobApplication($applicationId: Int!, $input: UpdateJobApplicationInput!) {
    updateJobApplication(applicationId: $applicationId, input: $input) {
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

const DELETE_JOB_APPLICATION_MUTATION = `
  mutation DeleteJobApplication($applicationId: Int!) {
    deleteJobApplication(applicationId: $applicationId) {
      ok
      message
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

export async function updateJobApplication(applicationId, input) {
  const data = await graphqlRequest(UPDATE_JOB_APPLICATION_MUTATION, { applicationId, input })
  return data.updateJobApplication
}

export async function deleteJobApplication(applicationId) {
  const data = await graphqlRequest(DELETE_JOB_APPLICATION_MUTATION, { applicationId })
  return data.deleteJobApplication
}
