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
    <div className="page-login">
      <div className="login-container">
        <h1 className="login-title">Job When?</h1>
        <p className="login-subtitle">
          Welcome back! Let's keep the momentum going.
        </p>

        <div className="login-card">
          <div className="login-tabs">
            <Button type="button" className="login__tab login__tab--active">
              Log In
            </Button>
            <Link to="/signup" className="tab">
              Sign Up
            </Link>
          </div>

          <Button variant="ghost" fullWidth className="login__google">
            Continue with Google
          </Button>

          <div className="divider">
            <span>or use email</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
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

            <a href="#" className="forgot-password">
              Forgot Password
            </a>

            <Button variant="primary" fullWidth type="submit">
              Log In
            </Button>
          </form>
        </div>

        <p className="signup-link">
          Don't have an account?{" "}
        <Link to="/signup">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}