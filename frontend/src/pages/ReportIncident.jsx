// frontend/src/pages/ReportIncident.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ReportIncident() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [file, setFile] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  // Get live location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => toast.warn("Unable to access location")
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !severity) {
      toast.error("Type & Severity required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("severity", severity);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);

    if (coords.latitude) formData.append("latitude", coords.latitude);
    if (coords.longitude) formData.append("longitude", coords.longitude);

    if (file) formData.append("image", file);

    try {
      await api.post("/incidents/report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("🚨 Incident Reported Successfully!");

      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      toast.error("Failed to submit incident");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="peacock-bg py-5" style={{ minHeight: "85vh" }}>
      <Container style={{ maxWidth: "650px" }}>
        <div className="glass p-4 rounded">
          <h2 className="text-white fw-bold mb-4">Report an Incident</h2>

          <Form onSubmit={handleSubmit}>
            {/* Incident Type */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Incident Type</Form.Label>
              <Form.Select
                className="glass"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option>Accident</option>
                <option>Harassment</option>
                <option>Medical Emergency</option>
                <option>Fire</option>
                <option>Natural Disaster</option>
                <option>Suspicious Activity</option>
                <option>Other</option>
              </Form.Select>
            </Form.Group>

            {/* Severity */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Severity</Form.Label>
              <Form.Select
                className="glass"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="">Select Severity</option>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Critical</option>
              </Form.Select>
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="glass"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Date */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Date</Form.Label>
              <Form.Control
                className="glass"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>

            {/* Time */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Time</Form.Label>
              <Form.Control
                className="glass"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Form.Group>

            {/* File Upload */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Upload Image (optional)</Form.Label>
              <Form.Control
                type="file"
                className="glass"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Form.Group>

            {/* Location */}
            <div className="text-white-50 small mb-3">
              Location:{" "}
              {coords.latitude
                ? `${coords.latitude}, ${coords.longitude}`
                : "Detecting..."}
            </div>

            <Button
              type="submit"
              className="btn-gradient w-100 mt-3"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Submit Incident"}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}
