import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSOS = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("⚠️ Please login to send SOS alerts.");
      return navigate("/login");
    }
    navigate("/sos");
  };

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      className="glass navbar-dark shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          TripShield
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(expanded ? false : true)}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Home</Nav.Link>

            <Nav.Link as={Link} to="/map" onClick={() => setExpanded(false)}>Map</Nav.Link>

            <Nav.Link as={Link} to="/report" onClick={() => setExpanded(false)}>Report</Nav.Link>

            <Nav.Link as={Link} to="/analytics" onClick={() => setExpanded(false)}>Analytics</Nav.Link>

            <Nav.Link as={Link} to="/chatbot" onClick={() => setExpanded(false)}>Chatbot</Nav.Link>

            <Nav.Link as={Link} to="/profile" onClick={() => setExpanded(false)}>Login</Nav.Link>

            <Button className="btn btn-danger px-3 fw-bold" onClick={handleSOS}>
              SOS
            </Button>

            <span className="text-white small d-none d-md-block">{time}</span>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
