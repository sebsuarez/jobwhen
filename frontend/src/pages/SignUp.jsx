// pages/SignUp.jsx

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { graphqlRequest, useAuth } from '../context/AuthContext'
import '../styles/Login.css'
import '../styles/SignUp.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function SignUp() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const googleButtonRef = useRef(null)
  const [role, setRole] = useState('jobseeker')
  const [googleError, setGoogleError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Register clicked')
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
        width: 360,
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

            <div className="login__google">
              <div ref={googleButtonRef} className="login__google-button" />
              {googleLoading ? <p className="login__status">Signing you up with Google...</p> : null}
              {googleError ? <p className="login__error">{googleError}</p> : null}
            </div>

            <div className="login__divider">
              <span>or use email</span>
            </div>

            <p className="register-label">Register as:</p>

            <div className="role-toggle">
              <button
                className={role === 'jobseeker' ? 'role active' : 'role'}
                onClick={() => setRole('jobseeker')}
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

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>First Name</label>
                  <input placeholder="e.g. John" />
                </div>

                <div>
                  <label>Last Name</label>
                  <input placeholder="e.g. Doe" />
                </div>

                <div>
                  <label>Username</label>
                  <input placeholder="e.g. John D." />
                </div>

                <div>
                  <label>Email</label>
                  <input placeholder="e.g. user@gmail.com" />
                </div>

                <div>
                  <label>Password</label>
                  <input type="password" placeholder="*************" />
                </div>

                <div>
                  <label>Confirm Password</label>
                  <input type="password" placeholder="*************" />
                </div>

                {role === 'jobseeker' && (
                  <>
                    <div>
                      <label>Status</label>
                      <input placeholder="e.g. New Graduate" />
                    </div>

                    <div>
                      <label>Affiliated School</label>
                      <input placeholder="e.g. University of Calgary" />
                    </div>
                  </>
                )}
              </div>

              <button className="btn btn--primary btn--full signup-submit" type="submit">
                {role === 'mentor' ? 'Submit application for approval' : 'Register'}
              </button>
            </form>
          </div>

          {role === 'mentor' && (
            <div className="mentor-card">
              <div className="mentor-top-row">
                <div>
                  <label>Job Title</label>
                  <input placeholder="e.g. UI/UX Designer" />
                </div>

                <div>
                  <label>Company</label>
                  <input placeholder="e.g. Apple" />
                </div>
              </div>

              <div className="mentor-textarea-group">
                <label>Why do you want to be a mentor?</label>
                <textarea rows="6" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
