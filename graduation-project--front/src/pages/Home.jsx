import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHome,
  FaTachometerAlt,
  FaRoad,
  FaRobot,
  FaSignInAlt,
  FaUserPlus,
  FaChartLine,
  FaMapSigns
} from "react-icons/fa";
import "../styles/home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          
          <img 
            src="src\assets\logo.png"
            alt="EduGuide Logo"
            className="logo-image"
          />
          <span className="logo-text">EduPick</span>
        </div>
        
        <ul className="navbar-links">
          <li><button className="nav-link" onClick={() => navigate("/")}><FaHome /> Home</button></li>
          <li><button className="nav-link" onClick={() => navigate("/dashboard")}><FaTachometerAlt /> Dashboard</button></li>
          <li><button className="nav-link" onClick={() => navigate("/roadmap")}><FaRoad /> Roadmap</button></li>
          <li><button className="nav-link" onClick={() => navigate("/chatbot")}><FaRobot /> Chat Assistant</button></li>
          <li><button className="nav-link" onClick={() => navigate("/login")}><FaSignInAlt /> Login</button></li>
          <li><button className="nav-link signup-btn" onClick={() => navigate("/signup")}><FaUserPlus /> Sign Up</button></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>Welcome to <span className="gradient-text">EduPick</span></h1>
          <p className="hero-subtitle">Your intelligent learning companion for personalized educational guidance</p>
          
          <div className="hero-cta">
            <button className="primary-btn" onClick={() => navigate("/signup")}>
              Start Learning Free
            </button>
            <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
              Explore Dashboard
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="floating-elements">
            <div className="floating-card floating-1">
              <FaChartLine />
              <span>Progress Tracking</span>
            </div>
            <div className="floating-card floating-2">
              <FaMapSigns />
              <span>Custom Roadmaps</span>
            </div>
            <div className="floating-card floating-3">
              <FaRobot />
              <span>AI Assistant</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Home;