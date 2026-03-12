import { useState } from "react";
import "../styles/login.css";

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
          Welcome back! Let&apos;s keep the momentum going.
        </p>

        <div className="login-card">
          <div className="login-tabs">
            <button type="button" className="tab active">
              Log In
            </button>
            <button type="button" className="tab">
              Sign Up
            </button>
          </div>

          <button type="button" className="google-btn">
            Continue with Google
          </button>

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

            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>
        </div>

        <p className="signup-link">
          Don&apos;t have an account? <span>Sign up for free</span>
        </p>
      </div>
    </div>
  );
}