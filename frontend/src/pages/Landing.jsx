// frontend/src/pages/Landing.jsx
import React from "react";
import HeroCarousel from "../components/HeroCarousel";
import FeatureCard from "../components/FeatureCard";
import GradientButton from "../components/GradientButton";
import { Container, Row, Col } from "react-bootstrap";
import { FaMapMarkedAlt, FaShieldAlt, FaPhoneAlt, FaChartBar, FaRocket } from "react-icons/fa";
import ScrollWrapper from "../components/ScrollWrapper";

export default function Landing() {
  const features = [
    { icon: <FaShieldAlt size={20} color="white" />, title: "Real-time SOS", text: "One tap SOS sends SMS & email to contacts and logs alert history." },
    { icon: <FaMapMarkedAlt size={20} color="white" />, title: "Nearby Help Centers", text: "Locate hospitals, police, and fire stations on an interactive map." },
    { icon: <FaPhoneAlt size={20} color="white" />, title: "Emergency Contacts", text: "Manage multiple emergency contacts with easy editing." },
    { icon: <FaChartBar size={20} color="white" />, title: "Analytics & Safety Score", text: "View incident trends, heatmaps and region safety scores." },
    { icon: <FaRocket size={20} color="white" />, title: "Fast Reporting", text: "Report incidents with optional images and precise location." },
  ];

  return (
    <div>
      <HeroCarousel />

      <section id="features" className="py-5">
        <Container>
          <ScrollWrapper className="mb-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-white">Core Features</h2>
              <p className="text-muted-soft">Everything you need to travel safer and smarter.</p>
            </div>
          </ScrollWrapper>

          <Row className="g-4">
            {features.map((f, i) => (
              <Col xs={12} md={6} lg={4} key={i}>
                <ScrollWrapper>
                  <FeatureCard icon={f.icon} title={f.title} text={f.text} />
                </ScrollWrapper>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-5">
            <GradientButton to="/register" className="me-2">Create Account</GradientButton>
            <GradientButton to="/analytics" className="btn-gradient-outline">Explore Analytics Dashboard</GradientButton>
          </div>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <ScrollWrapper>
                <div className="glass p-4">
                  <h3 className="text-white">Community Safety Matters</h3>
                  <p className="text-muted-soft">
                    Share incident reports and help build a safer travel network. Your reports power analytics and safety predictions.
                  </p>
                  <GradientButton to="/report">Report an Incident</GradientButton>
                </div>
              </ScrollWrapper>
            </Col>
            <Col md={6}>
              <ScrollWrapper>
                <div className="glass p-3 d-flex justify-content-center" style={{height:220}}>
                  <div className="text-muted-soft">
                    {/* placeholder image / mock chart */}
                    <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="260" height="160" rx="12" fill="rgba(255,255,255,0.02)"/>
                      <g transform="translate(12,12)">
                        <rect x="0" y="40" width="12" height="96" rx="3" fill="#0E9AA7"/>
                        <rect x="28" y="20" width="12" height="116" rx="3" fill="#046D63"/>
                        <rect x="56" y="60" width="12" height="76" rx="3" fill="#29C2B2"/>
                        <rect x="84" y="10" width="12" height="126" rx="3" fill="#05223B"/>
                        <rect x="112" y="80" width="12" height="56" rx="3" fill="#0E9AA7"/>
                      </g>
                    </svg>
                  </div>
                </div>
              </ScrollWrapper>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
