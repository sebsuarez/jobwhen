// pages/Login.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

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

          <Button variant="ghost" fullWidth className="login__google">
            Continue with Google
          </Button>

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