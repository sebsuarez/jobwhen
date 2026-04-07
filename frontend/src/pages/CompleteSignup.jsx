import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { graphqlRequest } from '../lib/graphqlRequest'
import '../styles/Login.css'
import '../styles/SignUp.css'

export default function CompleteSignup() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [pendingSignup, setPendingSignup] = useState(null)
  const [fullName, setFullName] = useState('')
  const [roleName, setRoleName] = useState('job_seeker')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mentorJobTitle, setMentorJobTitle] = useState('')
  const [mentorCompany, setMentorCompany] = useState('')
  const [mentorReason, setMentorReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPendingSignup = async () => {
      try {
        const data = await graphqlRequest(`
          query PendingSignup {
            pendingSignup {
              email
              fullName
              expiresAt
            }
          }
        `)

        if (!data.pendingSignup) {
          navigate('/signup', { replace: true })
          return
        }

        setPendingSignup(data.pendingSignup)
        setFullName(data.pendingSignup.fullName)
      } catch {
        navigate('/signup', { replace: true })
        return
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingSignup()
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedPassword = password.trim()

    if (!trimmedPassword) {
      setError('Password is required.')
      return
    }

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (trimmedPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (roleName === 'mentor' && !mentorJobTitle.trim()) {
      setError('Job title is required for mentors.')
      return
    }

    if (roleName === 'mentor' && !mentorCompany.trim()) {
      setError('Company is required for mentors.')
      return
    }

    if (roleName === 'mentor' && !mentorReason.trim()) {
      setError('Please tell us why you want to be a mentor.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await graphqlRequest(
        `
          mutation CompleteSignup(
            $fullName: String
            $roleName: String
            $password: String
            $mentorJobTitle: String
            $mentorCompany: String
            $mentorReason: String
          ) {
            completeSignup(
              fullName: $fullName
              roleName: $roleName
              password: $password
              mentorJobTitle: $mentorJobTitle
              mentorCompany: $mentorCompany
              mentorReason: $mentorReason
            ) {
              ok
              message
              user {
                userId
              }
            }
          }
        `,
        {
          fullName,
          roleName,
          password: trimmedPassword || null,
          mentorJobTitle: roleName === 'mentor' ? mentorJobTitle : null,
          mentorCompany: roleName === 'mentor' ? mentorCompany : null,
          mentorReason: roleName === 'mentor' ? mentorReason : null,
        },
      )

      await refreshUser()
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="login">
      <div className="login__container">
        <h1 className="login__title">Finish Sign Up</h1>
        <p className="login__subtitle">
          We verified your Google account. Confirm a few details and continue.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className={`signup-layout ${roleName === 'mentor' ? 'mentor-mode' : ''}`}>
            <div className="login__card signup-main-card">
              <div className="form-grid">
              <div>
                <label htmlFor="complete-signup-name">Full Name</label>
                <input
                  id="complete-signup-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="complete-signup-email">Email</label>
                <input
                  id="complete-signup-email"
                  value={pendingSignup?.email ?? ''}
                  disabled
                />
              </div>

              <div>
                <label htmlFor="complete-signup-password">Password</label>
                <input
                  id="complete-signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="complete-signup-confirm-password">Confirm Password</label>
                <input
                  id="complete-signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
              </div>

              <p className="register-label">Create account as:</p>

              <div className="role-toggle">
                <button
                  className={roleName === 'job_seeker' ? 'role active' : 'role'}
                  onClick={() => setRoleName('job_seeker')}
                  type="button"
                >
                  Job Seeker
                </button>
                <button
                  className={roleName === 'mentor' ? 'role active' : 'role'}
                  onClick={() => setRoleName('mentor')}
                  type="button"
                >
                  Mentor
                </button>
              </div>

            </div>

            {roleName === 'mentor' && (
              <div className="mentor-card">
                <div className="mentor-top-row">
                  <div>
                    <label htmlFor="complete-signup-mentor-job-title">Job Title</label>
                    <input
                      id="complete-signup-mentor-job-title"
                      value={mentorJobTitle}
                      onChange={(event) => setMentorJobTitle(event.target.value)}
                      placeholder="e.g. UI/UX Designer"
                    />
                  </div>

                  <div>
                    <label htmlFor="complete-signup-mentor-company">Company</label>
                    <input
                      id="complete-signup-mentor-company"
                      value={mentorCompany}
                      onChange={(event) => setMentorCompany(event.target.value)}
                      placeholder="e.g. Apple"
                    />
                  </div>
                </div>

                <div className="mentor-textarea-group">
                  <label htmlFor="complete-signup-mentor-reason">Why do you want to be a mentor?</label>
                  <textarea
                    id="complete-signup-mentor-reason"
                    rows="6"
                    value={mentorReason}
                    onChange={(event) => setMentorReason(event.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {error ? <p className="login__error">{error}</p> : null}

          <Button fullWidth type="submit" disabled={isSubmitting || !fullName.trim()}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
