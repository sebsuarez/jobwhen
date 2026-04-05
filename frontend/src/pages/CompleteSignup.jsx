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
    setIsSubmitting(true)
    setError('')

    try {
      await graphqlRequest(
        `
          mutation CompleteSignup($fullName: String, $roleName: String) {
            completeSignup(fullName: $fullName, roleName: $roleName) {
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

        <div className="login__card signup-main-card">
          <form className="signup-form" onSubmit={handleSubmit}>
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

            {error ? <p className="login__error">{error}</p> : null}

            <Button fullWidth type="submit" disabled={isSubmitting || !fullName.trim()}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
