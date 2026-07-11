// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import SOSButton from "../components/SOSButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sosList, setSosList] = useState([]);

  /* ---------------- Fetch Profile + SOS History ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.get("/auth/me");
        setUser(profile.data.user);

        const res = await api.get(`/sos/user/${profile.data.user.id}`);
        setSosList(res.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  if (!user)
    return (
      <div className="text-center text-white mt-5">
        <h3>Loading Dashboard...</h3>
      </div>
    );

  return (
    <div className="peacock-bg py-5" style={{ minHeight: "90vh" }}>
      <Container>

        {/* -------- Heading -------- */}
        <h2 className="text-white fw-bold text-center mb-4">
          Welcome, {user.name} 👋
        </h2>

        <div className="row g-4">

          {/* ================== LEFT: PROFILE CARD ================== */}
          <div className="col-md-8">
            <motion.div
              className="glass p-4 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-white fw-semibold mb-3">My Profile</h4>

              <p className="text-light">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="text-light">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-light">
                <strong>Phone:</strong> {user.phoneNumber}
              </p>

              <Link
                to="/profile"
                className="btn btn-gradient mt-3 px-4 py-2"
              >
                Edit Profile
              </Link>

              {/* Emergency Contacts */}
              <div className="mt-4">
                <h5 className="text-white">Emergency Contacts</h5>

                {user?.emergencyContacts?.length === 0 && (
                  <p className="text-light">No contacts added yet.</p>
                )}

                {user?.emergencyContacts?.map((c, i) => (
                  <div key={i} className="glass p-2 rounded my-2">
                    <p className="text-light mb-0">
                      <strong>{c.name}</strong> — {c.phoneNumber}
                    </p>
                    <p className="text-light small mb-0">
                      {c.relationship}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ================== RIGHT: QUICK ACTIONS ================== */}
          <div className="col-md-4">
            <motion.div
              className="glass p-4 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-white fw-semibold">Quick Actions</h4>

              <div className="mt-3">
                <SOSButton />

                <Link to="/map" className="btn btn-gradient mt-3 w-100">
                  Open Safety Map
                </Link>

                <Link
                  to="/report-incident"
                  className="btn btn-gradient-outline mt-3 w-100"
                >
                  Report Incident
                </Link>
              </div>

              {/* SOS History */}
              <div className="mt-4">
                <h5 className="text-white">Recent SOS Alerts</h5>

                {sosList.length === 0 && (
                  <p className="text-light">No recent SOS alerts.</p>
                )}

                {sosList.slice(0, 5).map((s) => (
                  <div key={s._id} className="glass p-2 rounded my-2">
                    <div className="text-light small">
                      {new Date(s.time).toLocaleString()}
                    </div>
                    <div className="text-light">{s.message}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ================== ANALYTICS PREVIEW ================== */}
          <div className="col-12">
            <motion.div
              className="glass p-4 rounded mt-4"
              whileHover={{ scale: 1.01 }}
            >
              <h4 className="text-white fw-semibold">Incident Analytics (Preview)</h4>
              <p className="text-light">Charts will be added later (Recharts).</p>
            </motion.div>
          </div>

        </div>
      </Container>
    </div>
  );
}
