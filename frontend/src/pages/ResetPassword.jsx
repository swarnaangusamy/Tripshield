// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Form, Container, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import api from "../api";
import { toast } from "react-toastify";
import GradientButton from "../components/GradientButton";

// Validation schema
const schema = Yup.object().shape({
  password: Yup.string()
    .required("Password required")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[0-9]/, "Must include a number")
    .matches(/[!@#$%^&*]/, "Must include a special symbol")
    .min(8, "Minimum 8 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token"); // backend not validating yet

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  // Redirect if no email in URL
  useEffect(() => {
    if (!email) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
  setLoading(true);
  try {
    const payload = {
      email,
      newPassword: data.password,
      token,   // ← ADD THIS
    };

    await api.post("/auth/reset-password", payload);

    toast.success("Password reset successful! Redirecting to login...");

    setTimeout(() => navigate("/login"), 1500);

  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Error resetting password"
    );
  } finally {
    setLoading(false);
  }
};
 
  return (
    <div className="peacock-bg py-5" style={{ minHeight: "80vh" }}>
      <Container style={{ maxWidth: 520 }}>
        <div className="glass p-4">
          <h2 className="text-center text-white fw-bold mb-3">
            Reset Your Password
          </h2>
          <p className="text-center text-white-50 mb-4">
            Enter your new password below
          </p>

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* New Password */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white fw-semibold">New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPass ? "text" : "password"}
                  placeholder="New strong password"
                  {...register("password")}
                  className="glass"
                />
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </InputGroup>
              <small className="text-danger">{errors.password?.message}</small>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white fw-semibold">
                Confirm Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                className="glass"
              />
              <small className="text-danger">
                {errors.confirmPassword?.message}
              </small>
            </Form.Group>

            <div className="d-flex justify-content-center mt-4">
              <GradientButton
                type="submit"
                className="px-5"
                disabled={!isDirty || !isValid || loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </GradientButton>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
