// frontend/src/components/EmergencyContactBlock.jsx
import React from "react";
import { Form } from "react-bootstrap";

export default function EmergencyContactBlock({ index, register, errors, remove }) {
  return (
    <div className="glass p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="text-white">Emergency Contact {index + 1}</h5>
        {index > 0 && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => remove(index)}
          >
            Remove
          </button>
        )}
      </div>

      <div className="row mt-3">
        <div className="col-md-6 mb-3">
          <Form.Label className="text-white">Name</Form.Label>
          <Form.Control
            type="text"
            {...register(`emergencyContacts.${index}.name`)}
            className="glass"
            placeholder="Contact Name"
          />
          <small className="text-danger">
            {errors?.emergencyContacts?.[index]?.name?.message}
          </small>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Label className="text-white">Phone Number</Form.Label>
          <Form.Control
            type="text"
            {...register(`emergencyContacts.${index}.phoneNumber`)}
            className="glass"
            placeholder="9876543210"
          />
          <small className="text-danger">
            {errors?.emergencyContacts?.[index]?.phoneNumber?.message}
          </small>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Label className="text-white">Email</Form.Label>
          <Form.Control
            type="text"
            {...register(`emergencyContacts.${index}.email`)}
            className="glass"
            placeholder="contact@example.com"
          />
          <small className="text-danger">
            {errors?.emergencyContacts?.[index]?.email?.message}
          </small>
        </div>

        <div className="col-md-6 mb-3">
          <Form.Label className="text-white">Relationship</Form.Label>
          <Form.Control
            type="text"
            {...register(`emergencyContacts.${index}.relationship`)}
            className="glass"
            placeholder="Friend / Parent / Sibling"
          />
        </div>

        <div className="col-12 mb-3">
          <Form.Label className="text-white">Address</Form.Label>
          <Form.Control
            type="text"
            {...register(`emergencyContacts.${index}.address`)}
            className="glass"
            placeholder="Full Address"
          />
        </div>
      </div>
    </div>
  );
}
