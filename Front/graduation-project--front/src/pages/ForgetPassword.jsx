import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ أضف useNavigate
import "../styles/common.css";
import "../styles/auth.css";
import logo from "../assets/logo.png";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ لاستخدام التنقل بعد النجاح

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ خزن الإيميل علشان تستخدمه في صفحة Verify
        localStorage.setItem("resetEmail", email);

        setMessage("Verification code sent! Redirecting...");
        // ✅ انقل المستخدم بعد 1.5 ثانية لصفحة verify-code
        setTimeout(() => navigate("/verification"), 1500);
      } else {
        setMessage(data.error || "Something went wrong. Try again later.");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="logo-container">
          <img src={logo} alt="EduPick Logo" className="auth-logo" />
          <h1 className="site-name">EduPick</h1>
        </div>
      </div>

      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to reset your password</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <div className="auth-links">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
