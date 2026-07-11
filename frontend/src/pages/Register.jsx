// frontend/src/pages/Register.jsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form, Container } from "react-bootstrap";
import * as Yup from "yup";
import api from "../api";
import { useNavigate } from "react-router-dom";
import GradientButton from "../components/GradientButton";
import EmergencyContactBlock from "../components/EmergencyContactBlock";

// ------------------- Validation Schema -------------------
const schema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit phone number")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  bloodGroup: Yup.string().required("Blood group required"),

  password: Yup.string()
    .required("Password required")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[0-9]/, "Must include a number")
    .matches(/[!@#$%^&*]/, "Must include a special symbol")
    .min(8, "Must be at least 8 characters"),

  emergencyContacts: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Name required"),
        phoneNumber: Yup.string()
          .matches(/^[0-9]{10}$/, "Invalid phone")
          .required("Phone required"),
        email: Yup.string().email("Invalid email").required("Email required"),
        relationship: Yup.string().required("Relationship required"),
        address: Yup.string().required("Address required"),
      })
    )
    .min(1, "Add at least one emergency contact"),
});

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      emergencyContacts: [
        {
          name: "",
          phoneNumber: "",
          email: "",
          relationship: "",
          address: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  // ------------------- Submit Handler -------------------
const onSubmit = async (data) => {
  console.log("🔗 sending request to:", "/auth/register");
console.log("🏠 baseURL from api.js:", api.defaults.baseURL);

  console.log("🔔 onSubmit called with data:", data); // <<-- debug
  try {
    const res = await api.post("/auth/register", data);
    console.log("✅ register response:", res.data); // debug
    alert("Registration Successful!");
    navigate("/login");
  } catch (err) {
    console.error("❌ register error (axios):", err?.response || err.message || err);
    alert(err.response?.data?.message || "Error registering");
  }
};


  return (
    <div className="peacock-bg py-5">
      <Container style={{ maxWidth: "850px" }}>
        <div className="glass p-4">
          <h2 className="text-center text-white fw-bold mb-4">
            Create Your Account
          </h2>

          {/* ------------------- Form Start ------------------- */}
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* User Details */}
            <h4 className="text-white mt-3">User Details</h4>
            <hr className="text-white" />

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register("name")}
                  className="glass"
                  placeholder="John Doe"
                />
                <small className="text-danger">{errors.name?.message}</small>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  {...register("phoneNumber")}
                  className="glass"
                  placeholder="9876543210"
                />
                <small className="text-danger">
                  {errors.phoneNumber?.message}
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Email</Form.Label>
                <Form.Control
                  type="email"
                  {...register("email")}
                  className="glass"
                  placeholder="you@example.com"
                />
                <small className="text-danger">{errors.email?.message}</small>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  {...register("dateOfBirth")}
                  className="glass"
                />
                <small className="text-danger">
                  {errors.dateOfBirth?.message}
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Blood Group</Form.Label>
                <Form.Control
                  type="text"
                  {...register("bloodGroup")}
                  className="glass"
                  placeholder="O+ / B- / AB+"
                />
                <small className="text-danger">
                  {errors.bloodGroup?.message}
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control
                  type="password"
                  {...register("password")}
                  className="glass"
                />
                <small className="text-danger">
                  {errors.password?.message}
                </small>
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <h4 className="text-white mt-4">Emergency Contacts</h4>
            <hr className="text-white" />

            {fields.map((field, index) => (
              <EmergencyContactBlock
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                remove={remove}
              />
            ))}

            <button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  phoneNumber: "",
                  email: "",
                  relationship: "",
                  address: "",
                })
              }
              className="btn btn-gradient-outline mb-3"
            >
              + Add Contact
            </button>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-3 mt-4">
              <GradientButton
  type="submit"
  className="px-5"
  onClick={() => console.log("👉 Register button clicked")}
>
  Register
</GradientButton>


              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => reset()}
              >
                Reset
              </button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
