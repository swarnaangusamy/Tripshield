// EmergencyContactModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function EmergencyContactModal({
  show,
  initialContact = null,
  mode = "edit",
  onClose,
  onSave
}) {
  const [contact, setContact] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    relationship: "",
    address: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialContact) {
      setContact({
        name: initialContact.name || "",
        phoneNumber: initialContact.phoneNumber || "",
        email: initialContact.email || "",
        relationship: initialContact.relationship || "",
        address: initialContact.address || ""
      });
    } else {
      setContact({
        name: "",
        phoneNumber: "",
        email: "",
        relationship: "",
        address: ""
      });
    }
    setErrors({});
  }, [initialContact, show]);

  const validate = () => {
    let err = {};

    if (!contact.name.trim()) err.name = "Name is required";

    if (!/^[0-9]{10}$/.test(contact.phoneNumber))
      err.phoneNumber = "Enter valid 10-digit phone number";

    if (!contact.email.trim()) {
      err.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) err.email = "Invalid email";
    }

    if (!contact.relationship.trim())
      err.relationship = "Relationship is required";

    if (!contact.address.trim())
      err.address = "Address is required";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(contact);
  };

  const update = (k, v) => {
    setContact(prev => ({ ...prev, [k]: v }));
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "add" ? "Add Contact" : "Edit Contact"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={contact.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <small className="text-danger">{errors.name}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              value={contact.phoneNumber}
              onChange={(e) => update("phoneNumber", e.target.value)}
            />
            <small className="text-danger">{errors.phoneNumber}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={contact.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <small className="text-danger">{errors.email}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Relationship</Form.Label>
            <Form.Control
              value={contact.relationship}
              onChange={(e) => update("relationship", e.target.value)}
            />
            <small className="text-danger">{errors.relationship}</small>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={contact.address}
              onChange={(e) => update("address", e.target.value)}
            />
            <small className="text-danger">{errors.address}</small>
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
