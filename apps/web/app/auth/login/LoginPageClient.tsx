"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Alert, Form } from "react-bootstrap";

import { apiErrorMessage, oauthUrl } from "@/app/lib/api/client";
import { setGuestSession, setSession } from "@/app/store";
import PageLoadingState from "@/components/ui/PageLoadingState";

import * as client from "../client";
import { User } from "lucide-react";
import GoogleMark from "@/components/ui/GoogleMark";

type LoginPageClientProps = {
  safeNextHref: string | null;
};

export default function LoginPageClient({
  safeNextHref,
}: LoginPageClientProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await client.login(formData);
      localStorage.removeItem("guest_session");
      dispatch(setSession(user.data || user));
      router.push(safeNextHref || "/account");
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("guest_session", "true");
    dispatch(setGuestSession());
    router.push(safeNextHref || "/qa");
  };

  if (loading) {
    return <PageLoadingState message="Signing in..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container-narrow">
        <section className="page-header-section auth-header-section">
          <h1 className="auth-title">Sign in</h1>
          <p className="qa-page-sub">Sign in to continue to LeaseQA.</p>
        </section>

        <div className="auth-card">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <button
              type="submit"
              className="btn-warm-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="auth-divider">or</div>

            <a
              href={oauthUrl("google")}
              className="btn-warm-outline w-100 mb-3 d-block text-center text-decoration-none"
            >
              <GoogleMark size={20} className="me-2" />
              Continue with Google
            </a>

            <button
              type="button"
              className="btn-warm-outline w-100 mb-3"
              onClick={handleGuestLogin}
            >
              <User size={20} className="me-2" />
              Continue as Guest
            </button>
          </Form>

          <div className="text-center text-secondary small">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              style={{
                color: "var(--site-accent)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
