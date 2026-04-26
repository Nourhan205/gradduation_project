import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaTachometerAlt,
  FaRoad,
  FaRobot,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
  FaChartLine,
  FaMapSigns,
  FaBalanceScale
} from "react-icons/fa";
import "../styles/home.css";
import { FaClipboardList } from "react-icons/fa";
function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home-container">

      {/* ================= Navbar ================= */}
      <nav className="home-navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <img src="src/assets/logo.png" alt="EduPick Logo" className="logo-image" />
          <span className="logo-text">EduPick</span>
        </div>

        <div className="navbar-actions">
          <button className="nav-link" onClick={() => navigate("/login")}>
            <FaSignInAlt /> Login
          </button>

          <button className="nav-link signup-btn" onClick={() => navigate("/signup")}>
            <FaUserPlus /> Sign Up
          </button>

          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* ================= Side Menu ================= */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>
          <FaTimes />
        </button>

        <ul>
          <li onClick={() => navigate("/dashboard")}>
            <FaTachometerAlt /> Dashboard
          </li>

          <li onClick={() => navigate("/roadmap")}>
            <FaRoad /> Roadmap
          </li>

          <li onClick={() => navigate("/ComparisonTool")}>
            <FaBalanceScale /> Comparison Tool
          </li>

          <li onClick={() => navigate("/chatbot")}>
            <FaRobot /> AI Assistant
          </li>
          <li onClick={() => navigate("/test")}>
            <FaClipboardList /> Test Track
          </li>
        </ul>
      </div>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {/* ================= Hero Section (UNCHANGED) ================= */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>
            Welcome to <span className="gradient-text">EduPick</span>
          </h1>

          <p className="hero-subtitle">
            Your intelligent learning companion for personalized educational guidance
          </p>

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
