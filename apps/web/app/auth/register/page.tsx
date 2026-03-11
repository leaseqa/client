"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSession } from "@/app/store";
import { Alert, Form, Modal } from "react-bootstrap";
import * as client from "../client";
import PageLoadingState from "@/components/ui/PageLoadingState";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const user = await client.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "tenant",
      });
      dispatch(setSession(user.data || user));
      setShowSuccess(true);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.message ||
        "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoadingState message="Creating account..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container-narrow">
        <section className="page-header-section auth-header-section">
          <h1 className="auth-title">Create Account</h1>
          <p className="qa-page-sub">Join the LeaseQA community.</p>
        </section>

        <div className="auth-card">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <button
              type="submit"
              className="btn-warm-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </Form>

          <div className="text-center text-secondary small">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "var(--site-accent)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account Created!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Your account was created successfully.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-warm-outline"
            onClick={() => setShowSuccess(false)}
          >
            Close
          </button>
          <button
            className="btn-warm-primary"
            onClick={() => router.push("/account")}
          >
            Go to Account
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
