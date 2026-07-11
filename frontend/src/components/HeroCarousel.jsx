// frontend/src/components/HeroCarousel.jsx
import React from "react";
import { Carousel, Container, Row, Col } from "react-bootstrap";
import GradientButton from "./GradientButton";
import { motion } from "framer-motion";

const slideText = [
  {
    title: "TripShield — Your Smart Travel Safety Companion",
    subtitle:
      "Real-time SOS alerts, safety predictions, nearby help centers and travel assistance — all in your pocket.",
    cta: "Get Started",
  },
  {
    title: "Find Nearest Aid — Fast",
    subtitle:
      "Locate hospitals, police stations, and emergency services around you with clustered peacock-themed markers.",
    cta: "View Map",
  },
  {
    title: "Report Incidents & Improve Safety",
    subtitle:
      "Report incidents easily and help the community. See analytics and stay informed to travel safer.",
    cta: "Report Now",
  },
];

export default function HeroCarousel() {
  return (
    <section className="peacock-bg position-relative hero-height">
      <div className="container h-100 d-flex align-items-center">
        <Carousel indicators={false} controls interval={6000} className="w-100">
          {slideText.map((s, idx) => (
            <Carousel.Item key={idx}>
              <Container>
                <Row className="align-items-center">
                  <Col md={7}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="hero-caption glass p-4 halo"
                    >
                      <h1 className="display-6 fw-bold">{s.title}</h1>
                      <p className="text-muted-soft mb-3">{s.subtitle}</p>
                      <div className="d-flex gap-2">
                        <GradientButton to="/register">{s.cta}</GradientButton>
                        <a href="#features" className="btn btn-gradient-outline btn">
                          Learn More
                        </a>
                      </div>
                    </motion.div>
                  </Col>
                  <Col md={5} className="d-none d-md-flex justify-content-center">
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.9 }}
                      className="glass p-3"
                      style={{ width: 300, height: 220 }}
                    >
                      {/* Decorative card / mock device */}
                      <div className="d-flex flex-column h-100 justify-content-center align-items-center text-center">
                        <div className="mb-2">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="white" strokeWidth="0.8" />
                          </svg>
                        </div>
                        <div className="text-white small">Safety · Map · SOS</div>
                      </div>
                    </motion.div>
                  </Col>
                </Row>
              </Container>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* subtle overlay gradient waves */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(3,18,18,0.05), transparent 30%)"
      }} />
    </section>
  );
}
