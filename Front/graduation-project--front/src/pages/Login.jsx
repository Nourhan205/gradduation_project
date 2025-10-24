import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/common.css';
import '../styles/auth.css';
import logo from '../assets/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", { // <-- Flask backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", "dummy-token"); // placeholder token
        toast.success(data.message || "Login successful!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/Dashboard"), 2000);
      } else {
        toast.error(data.error || "Login failed! Check your credentials.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch {
      toast.error("Network error. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
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
        <h2>Welcome back!</h2>
        <p>We're excited to see you again at <strong>EduPick</strong>.</p>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit">Login</button>
        </form>

        <div className="auth-links">
          <Link to="/ForgetPassword" className="auth-link">Forgot Password?</Link>
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
