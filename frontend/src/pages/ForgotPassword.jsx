import React, { useState } from "react";
import { Form, Container, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import api from "../api";
import GradientButton from "../components/GradientButton";
import { toast } from "react-toastify";

// Validation
const schema = Yup.object().shape({
  email: Yup.string().email("Valid email required").required("Email required"),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/auth/request-reset", data);
      toast.success("Reset email sent! Check your inbox.");
      reset();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Error sending reset email"
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
            Forgot Password?
          </h2>
          <p className="text-center text-white-50 mb-4">
            Enter your email to receive a password reset link
          </p>

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="glass"
              />
              <small className="text-danger">{errors.email?.message}</small>
            </Form.Group>

            <div className="d-flex justify-content-center mt-4">
              <GradientButton
                type="submit"
                className="px-5"
                disabled={!isValid || !isDirty || loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Sending...
                  </>
                ) : (
                  "Send Link"
                )}
              </GradientButton>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
}
