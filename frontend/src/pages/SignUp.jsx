// pages/SignUp.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";
import "../styles/signup.css";

export default function SignUp() {
  const [role, setRole] = useState("jobseeker");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register clicked");
  };

  return (
    <div className="login">
      <div className="login__container">
        <h1 className="login__title">Job When?</h1>
        <p className="login__subtitle">
          Welcome back! Let's keep the momentum going.
        </p>

        <div className={`signup-layout ${role === "mentor" ? "mentor-mode" : ""}`}>
          <div className="login__card signup-main-card">
            <div className="login__tabs">
              <Link to="/" className="login__tab">
                Log In
              </Link>
              <Link to="/signup" className="login__tab login__tab--active">
                Sign Up
              </Link>
            </div>

            <button type="button" className="btn btn--ghost btn--full login__google">
              Sign Up with Google
            </button>

            <div className="login__divider">
              <span>or use email</span>
            </div>

            <p className="register-label">Register as:</p>

            <div className="role-toggle">
              <button
                className={role === "jobseeker" ? "role active" : "role"}
                onClick={() => setRole("jobseeker")}
                type="button"
              >
                Job Seeker
              </button>

              <button
                className={role === "mentor" ? "role active" : "role"}
                onClick={() => setRole("mentor")}
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

                {role === "jobseeker" && (
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
                {role === "mentor" ? "Submit application for approval" : "Register"}
              </button>
            </form>
          </div>

          {role === "mentor" && (
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
  );
}