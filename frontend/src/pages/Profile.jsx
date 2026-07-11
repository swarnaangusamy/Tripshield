// Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Spinner, Button } from "react-bootstrap";
import EmergencyContactModal from "../components/EmergencyContactModal";
import EditProfileModal from "../components/EditProfileModal";
import { toast } from "react-toastify";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [ecModalOpen, setEcModalOpen] = useState(false);
  const [ecMode, setEcMode] = useState("edit"); // "edit" or "add"
  const [ecIndex, setEcIndex] = useState(null);
  const [ecInitial, setEcInitial] = useState(null);

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const navigate = useNavigate();

  // load profile + sos
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me");
        const u = res.data.user;
        setUser(u);

        if (u?._id) {
          const sosRes = await api.get(`/sos/user/${u._id}`);
          setSosList(sosRes.data);
        }
      } catch (err) {
        console.error("Error loading profile", err);
        toast.error("Failed to load profile. Please login again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // OPEN add contact
  const handleAddContact = () => {
    setEcMode("add");
    setEcIndex(null);
    setEcInitial(null);
    setEcModalOpen(true);
  };

  // OPEN edit contact
  const handleEditContact = (index) => {
    setEcMode("edit");
    setEcIndex(index);
    setEcInitial(user.emergencyContacts[index]);
    setEcModalOpen(true);
  };

  // SAVE contact (both add and edit)
  const handleSaveContact = async (contact) => {
    // build updated contacts array
    const current = Array.isArray(user.emergencyContacts) ? [...user.emergencyContacts] : [];
    if (ecMode === "edit" && ecIndex !== null) {
      current[ecIndex] = contact;
    } else {
      current.push(contact);
    }

    try {
      const res = await api.put("/auth/update", { emergencyContacts: current });
      setUser(res.data.user);
      toast.success("Contacts updated");
      setEcModalOpen(false);
    } catch (err) {
      console.error("Update contact error", err);
      toast.error(err?.response?.data?.message || "Failed to update contact");
    }
  };

  // DELETE contact
  const handleDeleteContact = async (index) => {
    if (!confirm("Delete this contact?")) return;
    const current = [...(user.emergencyContacts || [])];
    current.splice(index, 1);

    try {
      const res = await api.put("/auth/update", { emergencyContacts: current });
      setUser(res.data.user);
      toast.success("Contact deleted");
    } catch (err) {
      console.error("Delete contact error", err);
      toast.error("Failed to delete contact");
    }
  };

  // EDIT PROFILE SAVE
  const handleSaveProfile = async (profileForm) => {
    try {
      const res = await api.put("/auth/update", profileForm);
      setUser(res.data.user);
      toast.success("Profile updated");
      setEditProfileOpen(false);
    } catch (err) {
      console.error("Save profile error", err);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white mt-5">
        <Spinner animation="border" variant="light" /> Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-5 text-white">
        <p>No user found. Please login.</p>
      </div>
    );
  }

  return (
    <div className="peacock-bg py-5" style={{ minHeight: "85vh" }}>
      <div className="container">
        {/* header */}
        <div className="glass p-4 mb-4 rounded d-flex justify-content-between align-items-center">
          <h2 className="text-white fw-bold">My Profile</h2>
          <div className="d-flex gap-2">
            <Button variant="outline-light" onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="row g-4">
          {/* user info */}
          <div className="col-lg-8">
            <div className="glass p-4 rounded">
              <h4 className="text-white mb-3">User Details</h4>
              <p className="text-white"><strong>Name:</strong> {user.name}</p>
              <p className="text-white"><strong>Email:</strong> {user.email}</p>
              <p className="text-white"><strong>Phone:</strong> {user.phoneNumber}</p>
              <p className="text-white"><strong>DOB:</strong> {user.dateOfBirth ? user.dateOfBirth.slice(0,10) : "N/A"}</p>
              <p className="text-white"><strong>Blood Group:</strong> {user.bloodGroup || "N/A"}</p>

              <hr className="text-white mt-4" />

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="text-white mb-0">Emergency Contacts</h5>
                <Button variant="success" size="sm" onClick={handleAddContact}>+ Add</Button>
              </div>

              {(!user.emergencyContacts || user.emergencyContacts.length === 0) && (
                <p className="text-white-50">No emergency contacts added.</p>
              )}

              {(user.emergencyContacts || []).map((c, i) => (
                <div key={i} className="glass p-3 rounded mb-3">
                  <p className="text-white m-0"><strong>{c.name}</strong> <span className="text-white-50">({c.relationship})</span></p>
                  <p className="text-white-50 m-0">{c.phoneNumber}</p>
                  <p className="text-white-50 m-0">{c.email}</p>
                  <p className="text-white-50 m-0 small">{c.address}</p>

                  <div className="mt-2 d-flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleEditContact(i)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteContact(i)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* quick actions + sos */}
          <div className="col-lg-4">
            <div className="glass p-4 rounded mb-4">
              <h4 className="text-white mb-3">Quick Actions</h4>
              <Button className="w-100 mb-2" onClick={() => window.location.href = "/map"}>Open Map</Button>
              <Button className="w-100" variant="outline-light" onClick={() => window.location.href = "/analytics"}>Analytics</Button>
            </div>

            <div className="glass p-4 rounded">
              <h5 className="text-white mb-3">Recent SOS Alerts</h5>
              {(sosList || []).length === 0 ? (
                <p className="text-white-50">No SOS history.</p>
              ) : (
                (sosList || []).slice(0,5).map(s => (
                  <div key={s._id} className="glass p-3 rounded mb-3">
                    <p className="text-white-50 small m-0">{new Date(s.time).toLocaleString()}</p>
                    <p className="text-white m-0">{s.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Modal */}
      <EmergencyContactModal
        show={ecModalOpen}
        initialContact={ecInitial}
        mode={ecMode}
        onClose={() => setEcModalOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        show={editProfileOpen}
        user={user}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
