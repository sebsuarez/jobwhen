// pages/Login.jsx

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { graphqlRequest, useAuth } from '../context/AuthContext'
import '../styles/Login.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const googleButtonRef = useRef(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [googleError, setGoogleError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, password })
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
        text: 'continue_with',
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
        setGoogleError('Google Sign-In failed to load. Check your network and refresh.')
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

        <div className="login__card">
          <div className="login__tabs">
            <button type="button" className="login__tab login__tab--active">
              Log In
            </button>
            <Link to="/signup" className="login__tab">
              Sign Up
            </Link>
          </div>

          <div className="login__google">
            <div ref={googleButtonRef} className="login__google-button" />
            {googleLoading ? <p className="login__status">Signing you in with Google...</p> : null}
            {googleError ? <p className="login__error">{googleError}</p> : null}
          </div>

          <div className="login__divider">
            <span>or use email</span>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="*********************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <a href="#" className="login__forgot">Forgot Password</a>

            <Button variant="primary" fullWidth type="submit">
              Log In
            </Button>
          </form>
        </div>

        <p className="login__signup">
          Don't have an account?{" "}
          <Link to="/signup">Sign up for free</Link>
        </p>
      </div>
    </div>
  )
}
