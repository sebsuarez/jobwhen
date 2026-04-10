// pages/SignUp.jsx

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { graphqlRequest } from '../lib/graphqlRequest'
import '../styles/Login.css'
import '../styles/SignUp.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUp() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const googleButtonRef = useRef(null)
  const [role, setRole] = useState('job_seeker')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [jobSeekerStatus, setJobSeekerStatus] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [mentorJobTitle, setMentorJobTitle] = useState('')
  const [mentorCompany, setMentorCompany] = useState('')
  const [mentorReason, setMentorReason] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const missingBase = [
      !firstName.trim() && 'First Name',
      !lastName.trim() && 'Last Name',
      !username.trim() && 'Username',
      !email.trim() && 'Email',
    ].filter(Boolean)
    if (missingBase.length) {
      setFormError(`Please fill in the following fields: ${missingBase.join(', ')}.`)
      return
    }

    if (!emailPattern.test(email.trim())) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    if (role === 'mentor') {
      const missing = [
        !mentorJobTitle.trim() && 'Job Title',
        !mentorCompany.trim() && 'Company',
        !mentorReason.trim() && 'reason for becoming a mentor',
      ].filter(Boolean)
      if (missing.length) {
        setFormError(`Please fill in the following mentor fields: ${missing.join(', ')}.`)
        return
      }
    }

    setFormLoading(true)
    setFormError('')

    try {
      await graphqlRequest(
        `
          mutation Register(
            $roleName: String!
            $firstName: String!
            $lastName: String!
            $username: String!
            $email: String!
            $password: String!
            $jobSeekerStatus: String
            $schoolName: String
            $mentorJobTitle: String
            $mentorCompany: String
            $mentorReason: String
          ) {
            register(
              roleName: $roleName
              firstName: $firstName
              lastName: $lastName
              username: $username
              email: $email
              password: $password
              jobSeekerStatus: $jobSeekerStatus
              schoolName: $schoolName
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
          roleName: role,
          firstName,
          lastName,
          username,
          email,
          password,
          jobSeekerStatus: role === 'job_seeker' ? jobSeekerStatus : null,
          schoolName: role === 'job_seeker' ? schoolName : null,
          mentorJobTitle: role === 'mentor' ? mentorJobTitle : null,
          mentorCompany: role === 'mentor' ? mentorCompany : null,
          mentorReason: role === 'mentor' ? mentorReason : null,
        },
      )

      await refreshUser()
      navigate('/dashboard')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    if (!googleClientId) {
      setGoogleError('Missing `VITE_GOOGLE_CLIENT_ID` in your frontend environment.')
      return
    }

    let isMounted = true

    const renderGoogleButton = () => {
      const googleAccounts = window.google?.accounts?.id

      if (!googleAccounts || !googleButtonRef.current || !isMounted) {
        return false
      }

      googleAccounts.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setGoogleError('Google did not return a credential.')
            return
          }

          setGoogleLoading(true)
          setGoogleError('')

          try {
            const data = await graphqlRequest(
              `
                mutation GoogleAuth($credential: String!) {
                  googleAuth(credential: $credential) {
                    ok
                    message
                    requiresSignup
                  }
                }
              `,
              { credential },
            )

            if (data.googleAuth.requiresSignup) {
              navigate('/complete-signup')
              return
            }

            await refreshUser()
            navigate('/dashboard')
          } catch (error) {
            setGoogleError(error.message)
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      googleButtonRef.current.innerHTML = ''
      googleAccounts.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signup_with',
        width: googleButtonRef.current.clientWidth || 400,
      })

      return true
    }

    if (renderGoogleButton()) {
      return () => {
        isMounted = false
      }
    }

    const intervalId = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(intervalId)
      }
    }, 250)

    const timeoutId = window.setTimeout(() => {
      if (!window.google?.accounts?.id && isMounted) {
        setGoogleError('Google Sign-Up failed to load. Check your network and refresh.')
      }
      window.clearInterval(intervalId)
    }, 5000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [navigate, refreshUser])

  return (
    <div className="login">
      <div className="login__container">
        <h1 className="login__title">Job When?</h1>
        <p className="login__subtitle">
          Welcome back! Let's keep the momentum going.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className={`signup-layout ${role === 'mentor' ? 'mentor-mode' : ''}`}>
            <div className="login__card signup-main-card">
              <div className="login__tabs">
                <Link to="/" className="login__tab">
                  Log In
                </Link>
                <Link to="/signup" className="login__tab login__tab--active">
                  Sign Up
                </Link>
              </div>

              <div className="signup__google">
                <div ref={googleButtonRef} className="signup__google-button" />
                {googleLoading ? <p className="signup__status">Signing you up with Google...</p> : null}
                {googleError ? <p className="signup__error">{googleError}</p> : null}
              </div>

              <div className="login__divider">
                <span>or use email</span>
              </div>

              <p className="register-label">Register as:</p>

              <div className="role-toggle">
                <button
                  className={role === 'job_seeker' ? 'role active' : 'role'}
                  onClick={() => setRole('job_seeker')}
                  type="button"
                >
                  Job Seeker
                </button>

                <button
                  className={role === 'mentor' ? 'role active' : 'role'}
                  onClick={() => setRole('mentor')}
                  type="button"
                >
                  Mentor
                </button>
              </div>

              <div className="form-grid">
                <div>
                  <label>First Name *</label>
                  <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="e.g. John" />
                </div>

                <div>
                  <label>Last Name *</label>
                  <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="e.g. Doe" />
                </div>

                <div>
                  <label>Username *</label>
                  <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. johndoe" />
                </div>

                <div>
                  <label>Email *</label>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="e.g. user@gmail.com" />
                </div>

                <div>
                  <label>Password *</label>
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="*************" />
                </div>

                <div>
                  <label>Confirm Password *</label>
                  <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="*************" />
                </div>

                {role === 'job_seeker' && (
                  <>
                    <div>
                      <label>Status</label>
                      <input value={jobSeekerStatus} onChange={(event) => setJobSeekerStatus(event.target.value)} placeholder="e.g. New Graduate" />
                    </div>

                    <div>
                      <label>Affiliated School</label>
                      <input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="e.g. University of Calgary" />
                    </div>
                  </>
                )}
              </div>

              {formError ? <p className="signup__error">{formError}</p> : null}
            </div>

            {role === 'mentor' && (
              <div className="mentor-card">
                <div className="mentor-top-row">
                  <div>
                    <label>Job Title *</label>
                    <input value={mentorJobTitle} onChange={(event) => setMentorJobTitle(event.target.value)} placeholder="e.g. UI/UX Designer" />
                  </div>

                  <div>
                    <label>Company *</label>
                    <input value={mentorCompany} onChange={(event) => setMentorCompany(event.target.value)} placeholder="e.g. Apple" />
                  </div>
                </div>

                <div className="mentor-textarea-group">
                  <label>Why do you want to be a mentor? *</label>
                  <textarea rows="6" value={mentorReason} onChange={(event) => setMentorReason(event.target.value)} />
                </div>
              </div>
            )}
          </div>

          <button className="btn btn--primary signup-submit" type="submit" disabled={formLoading}>
            {formLoading
              ? 'Creating account...'
              : role === 'mentor'
                ? 'Submit application for approval'
                : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}
