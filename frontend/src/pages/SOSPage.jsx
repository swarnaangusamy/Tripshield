// frontend/src/pages/SOSPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function SOSPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [emergencyType, setEmergencyType] = useState("General Emergency");
  const navigate = useNavigate();

  const startSOS = async () => {
    // Check if logged in
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      toast.error("Please login to send SOS");
      navigate("/login");
      return;
    }

    setShowConfirm(true);
  };

  const handleSendSOS = async () => {
    setSending(true);

    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }

    // GET LIVE LOCATION
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        console.log("📍 Live location:", lat, lng);

        try {
          const res = await api.post("/sos/send", {
            emergencyType,
            latitude: lat,
            longitude: lng,
          });

          toast.success("🚨 SOS Alert Sent Successfully!", {
            autoClose: 2500,
          });
        } catch (error) {
          console.error(error);
          toast.error("Failed to send SOS");
        }

        setSending(false);
        setShowConfirm(false);
        setCountdown(3);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to access location — enable GPS");
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div
      className="peacock-bg d-flex justify-content-center align-items-center"
      style={{ minHeight: "85vh" }}
    >
      <div className="glass p-5 text-center rounded" style={{ width: 400 }}>
        <h2 className="text-white fw-bold mb-4">Emergency SOS</h2>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={startSOS}
          className="btn btn-danger fw-bold rounded-circle shadow-lg"
          style={{
            width: 200,
            height: 200,
            fontSize: 35,
            border: "4px solid rgba(255,255,255,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          SOS
        </motion.button>

        <p className="text-white-50 mt-4">
          Press the SOS button to instantly alert your emergency contacts.
        </p>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send SOS Alert?</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <Form.Select
            className="mb-3"
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
          >
            <option>General Emergency</option>
            <option>Medical Emergency</option>
            <option>Accident</option>
            <option>Harassment / Threat</option>
            <option>Fire Emergency</option>
            <option>Natural Disaster</option>
          </Form.Select>

          {!sending ? (
            <p>
              This will notify all emergency contacts through <br />{" "}
              <strong>EMAIL</strong> 📧
            </p>
          ) : (
            <>
              <Spinner animation="border" className="mb-3" />
              <h4>Sending in {countdown}...</h4>
            </>
          )}
        </Modal.Body>

        {!sending && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSendSOS}>
              Send SOS
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}
