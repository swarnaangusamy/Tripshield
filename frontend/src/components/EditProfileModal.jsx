// EditProfileModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function EditProfileModal({ show, user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    bloodGroup: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
        bloodGroup: user.bloodGroup || ""
      });
    }
    setErrors({});
  }, [user, show]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    let err = {};

    if (!form.name.trim()) err.name = "Name is required";

    if (!/^[0-9]{10}$/.test(form.phoneNumber))
      err.phoneNumber = "Enter valid 10-digit phone number";

    if (!form.email.trim()) {
      err.email = "Email is required";
    } else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(form.email)) err.email = "Invalid email address";
    }

    if (!form.dateOfBirth)
      err.dateOfBirth = "Date of birth required";

    if (!form.bloodGroup.trim())
      err.bloodGroup = "Blood group required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <small className="text-danger">{errors.name}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              value={form.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
            />
            <small className="text-danger">{errors.phoneNumber}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <small className="text-danger">{errors.email}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
            <small className="text-danger">{errors.dateOfBirth}</small>
          </Form.Group>

          <Form.Group>
            <Form.Label>Blood Group</Form.Label>
            <Form.Control
              value={form.bloodGroup}
              onChange={(e) => update("bloodGroup", e.target.value)}
            />
            <small className="text-danger">{errors.bloodGroup}</small>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
