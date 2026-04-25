"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setSession, signOut } from "@/app/store";
import { Col, Form, Row, Stack } from "react-bootstrap";
import { FaEnvelope, FaIdBadge, FaRobot, FaShieldAlt, FaSignInAlt, FaUserPlus, } from "react-icons/fa";
import { Home, Scale, Shield } from "lucide-react";
import * as client from "./client";
import ActivityTimeline from "./components/ActivityTimeline";

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const session = useSelector((state: RootState) => state.session);
  const user = session.user;
  const isAuthenticated = session.status === "authenticated" && !!user;
  const isGuest = session.status === "guest";

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activityItems, setActivityItems] = useState<client.ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const loadActivity = useCallback(async () => {
    if ( !isAuthenticated ) {
      setActivityItems([]);
      setActivityError("");
      setActivityLoading(false);
      return;
    }
    setActivityLoading(true);
    setActivityError("");
    try {
      const items = await client.fetchActivity();
      setActivityItems(items);
    } catch ( err: any ) {
      setActivityError(
        err.response?.data?.error?.message || "Failed to load activity.",
      );
    } finally {
      setActivityLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const handleLogout = async () => {
    try {
      await client.logout();
    } finally {
      dispatch(signOut());
      router.push("/");
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setSaving(true);
    try {
      const response = await client.updateCurrentUser({
        username: profileForm.name,
        email: profileForm.email,
      });
      const updatedUser = (response as any)?.data || response;
      dispatch(setSession(updatedUser));
      setEditMode(false);
    } catch ( err: any ) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setError("");
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
    setEditMode(false);
  };

  return (
    <div className="mb-4">
      <section className="page-header-section" style={{ borderBottom: "none" }}>
        <div className="account-header-row">
          <div className="d-flex align-items-center gap-3">
            <div className="account-avatar">
              {user?.name?.slice(0, 2).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="qa-page-title" style={{ marginBottom: "0.25rem" }}>
                {user?.name || "Guest User"}
              </h1>
              <p className="qa-page-sub" style={{ marginBottom: 0 }}>
                {user?.email || "Not signed in"}
              </p>
              {user && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="info-role-pill text-capitalize">
                    {user.role === "lawyer" ? (
                      <Scale size={12} className="me-1"/>
                    ) : user.role === "admin" ? (
                      <Shield size={12} className="me-1"/>
                    ) : (
                      <Home size={12} className="me-1"/>
                    )}
                    {user.role}
                  </span>
                  {isGuest && <span className="info-role-pill">Read-only</span>}
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <a href="/ai-review" className="btn-warm-primary">
              <FaRobot/>
              Use AI Review
            </a>
          )}
        </div>
      </section>

      <Row className="g-4">
        <Col lg={6}>
          <div className="account-card">
            {isAuthenticated || isGuest ? (
              <div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="info-team-icon info-team-icon--olive">
                    <FaIdBadge size={18}/>
                  </div>
                  <div>
                    <div className="fw-bold">Profile overview</div>
                    <div className="text-secondary small">
                      {isGuest ? "Browsing as guest" : "Your LeaseQA identity"}
                    </div>
                  </div>
                </div>

                <Stack gap={3}>
                  <div className="account-field">
                    <FaIdBadge className="account-field-icon"/>
                    <div className="w-100">
                      <div className="fw-semibold mb-1">Name</div>
                      {editMode ? (
                        <Form.Control
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          disabled={saving}
                        />
                      ) : (
                        <div className="text-secondary small">{user?.name}</div>
                      )}
                    </div>
                  </div>

                  <div className="account-field">
                    <FaEnvelope className="account-field-icon"/>
                    <div className="w-100">
                      <div className="fw-semibold mb-1">Email</div>
                      {editMode ? (
                        <Form.Control
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          disabled={saving}
                        />
                      ) : (
                        <div className="text-secondary small">
                          {user?.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="account-field">
                    <FaShieldAlt className="account-field-icon"/>
                    <div>
                      <div className="fw-semibold">Role</div>
                      <div className="text-secondary small text-capitalize">
                        {user?.role || "tenant"}
                      </div>
                    </div>
                  </div>

                  {error && <div className="text-danger small">{error}</div>}

                  {isGuest ? (
                    <Stack gap={2}>
                      <p className="text-secondary small mb-0">
                        Sign in to edit your profile, post questions, and access
                        AI review.
                      </p>
                      <a
                        href="/auth/login"
                        className="btn-warm-primary w-100 justify-content-center"
                      >
                        <FaSignInAlt/>
                        Sign In for Full Access
                      </a>
                    </Stack>
                  ) : (
                    <div className="d-flex gap-2">
                      {!editMode ? (
                        <>
                          <button
                            className="btn-warm-outline flex-fill"
                            onClick={() => {
                              setError("");
                              setEditMode(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-warm-danger flex-fill"
                            onClick={handleLogout}
                          >
                            Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-warm-primary flex-fill"
                            disabled={saving}
                            onClick={handleSaveProfile}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="btn-warm-outline flex-fill"
                            disabled={saving}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </Stack>
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="info-team-icon info-team-icon--terra">
                    <FaShieldAlt size={18}/>
                  </div>
                  <div>
                    <div className="fw-bold">Access Control</div>
                    <div className="text-secondary small">
                      Sign in to unlock features
                    </div>
                  </div>
                </div>

                <p className="text-secondary mb-4">
                  AI review, posting questions, and attorney replies require
                  authentication.
                </p>

                <Stack gap={3}>
                  <a
                    href="/auth/login"
                    className="btn-warm-primary w-100 justify-content-center"
                  >
                    <FaSignInAlt/>
                    Sign In
                  </a>
                  <a
                    href="/auth/register"
                    className="btn-warm-outline w-100 justify-content-center"
                  >
                    <FaUserPlus/>
                    Create Account
                  </a>
                </Stack>
              </div>
            )}
          </div>
        </Col>

        {(isAuthenticated || isGuest) && (
          <Col lg={6}>
            <ActivityTimeline
              items={activityItems}
              loading={activityLoading}
              error={activityError}
              isGuest={isGuest}
              onRetry={() => {
                void loadActivity();
              }}
            />
          </Col>
        )}
      </Row>
    </div>
  );
}
