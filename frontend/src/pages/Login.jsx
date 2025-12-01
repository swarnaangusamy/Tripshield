// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Form, Container, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import GradientButton from "../components/GradientButton";
import { toast } from "react-toastify";

// ---------------- Validation Schema ----------------
const schema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email").required("Email required"),
  password: Yup.string().required("Password required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "", remember: false }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const { remember } = data;

    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data;

      if (!token) {
        toast.error("No token returned — login failed");
        setLoading(false);
        return;
      }

      // Store token — depends on Remember Me
      if (remember) {
        localStorage.setItem("token", token); // persistent
      } else {
        sessionStorage.setItem("token", token); // clears when tab closes
      }

      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Invalid credentials";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    toast.info("Form cleared");
  };

  return (
    <div className="peacock-bg py-5" style={{ minHeight: "80vh" }}>
      <Container style={{ maxWidth: 520 }}>
        <div className="glass p-4">
          <h2 className="text-center text-white fw-bold mb-3">Welcome Back</h2>
          <p className="text-center text-white-50 mb-4">
            Login to access your TripShield dashboard
          </p>

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="glass"
              />
              <small className="text-danger">{errors.email?.message}</small>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label className="text-white fw-semibold">Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  {...register("password")}
                  className="glass"
                />
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </InputGroup>
              <small className="text-danger">{errors.password?.message}</small>
            </Form.Group>

            {/* Remember Me */}
            <Form.Group className="d-flex align-items-center gap-2 mb-3">
              <input type="checkbox" {...register("remember")} />
              <label className="text-white">Remember Me</label>
            </Form.Group>

            {/* Forgot link */}
            <div className="d-flex justify-content-between mb-3">
              <Link to="/forgot-password" className="text-white-50 small">
                Forgot password?
              </Link>
              <Link to="/register" className="text-white small">
                Create account
              </Link>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-3 mt-3">
              <GradientButton
                type="submit"
                className="px-5"
                disabled={!isValid || !isDirty || loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </GradientButton>

              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={handleReset}
                disabled={loading}
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
