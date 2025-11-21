import React from "react";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      {/* ------------------ NAVBAR ------------------ */}
      <nav className="navbar">
        <div className="nav-logo">TripShield</div>

        <ul className="nav-links">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Features</a>
          </li>
          <li>
            <a href="#">Safety Map</a>
          </li>
          <li>
            <a href="#">Chatbot</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
          <li>
            <a href="#">Login</a>
          </li>
        </ul>
      </nav>

      {/* ------------------ HERO ------------------ */}
      <section className="hero-section">
        <div className="hero-text">
          <h1 className="title">Travel Safe, Travel Smart.</h1>
          <p className="subtitle">
            Real-time protection, AI-powered guidance, and instant SOS support.
          </p>
          <button className="cta-btn">Explore Now</button>
        </div>

        <div className="carousel">
          <div className="carousel-track">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
              alt="travel1"
            />
            <img
              src="https://images.unsplash.com/photo-1473635863681-4767ff7f9b0b?w=800"
              alt="travel2"
            />
            <img
              src="https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=800"
              alt="travel3"
            />
          </div>
        </div>
      </section>

      {/* ------------------ FEATURES ------------------ */}
      <section className="features-section">
        <h2 className="section-title">What TripShield Offers</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>SOS Alerts</h3>
            <p>One-tap emergency alerts with live location.</p>
          </div>
          <div className="feature-card">
            <h3>Risk Analysis</h3>
            <p>AI-based safety prediction for safe journeys.</p>
          </div>
          <div className="feature-card">
            <h3>Nearby Help</h3>
            <p>Find hospitals, police stations & emergency centers.</p>
          </div>
          <div className="feature-card">
            <h3>Travel Assistant</h3>
            <p>AI chatbot to guide your trips smartly.</p>
          </div>
        </div>
      </section>

      {/* ------------------ FOOTER ------------------ */}
      <footer className="footer">
        <p>© 2025 TripShield. All Rights Reserved.</p>
      </footer>

      {/* ------------------ SOS FLOATING BUTTON ------------------ */}
      <button className="sos-btn">SOS</button>
    </div>
  );
};

export default HomePage;
