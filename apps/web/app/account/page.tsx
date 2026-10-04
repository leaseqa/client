"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setSession, signOut } from "@/app/store";
import { Col, Form, Row, Stack } from "react-bootstrap";
import { apiErrorMessage } from "@/app/lib/api/client";
import * as client from "./client";
import ActivityTimeline from "./components/ActivityTimeline";
import { initialsFor } from "@/app/lib/initials";

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
    } catch ( err: unknown ) {
      setActivityError(
        apiErrorMessage(err, "Failed to load activity."),
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
    <div className="account-page">
      <section className="page-header-section">
        <div className="account-header-row">
          <div className="account-identity">
            <div className="account-avatar" aria-hidden="true">
              {initialsFor(user?.name)}
            </div>
            <div>
              <h1 className="qa-page-title">{user?.name || "Guest user"}</h1>
              <p className="qa-page-sub">{user?.email || "Not signed in"}</p>
              {user && (
                <div className="account-badges">
                  <span className="info-role-pill text-capitalize">{user.role}</span>
                  {isGuest && <span className="info-role-pill">Read-only</span>}
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && (
            // While the profile form is open, Save is the one primary action.
            <Link href="/ai-review" className={editMode ? "btn-warm-outline" : "btn-warm-primary"}>
              Review my lease
            </Link>
          )}
        </div>
      </section>

      <Row className="g-5">
        <Col lg={6}>
          <section className="account-card" aria-labelledby="account-profile-title">
            {isAuthenticated || isGuest ? (
              <div>
                <div className="account-card-head">
                  <h2 id="account-profile-title" className="account-card-title">Profile</h2>
                  <p className="account-card-sub">
                    {isGuest ? "Browsing as guest" : "Your LeaseQA identity"}
                  </p>
                </div>

                <Stack gap={0} className="account-fields">
                  <div className="account-field">
                    <div className="account-field-label">Name</div>
                    {editMode ? (
                      <Form.Control
                        aria-label="Name"
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
                      <div className="account-field-value">{user?.name}</div>
                    )}
                  </div>

                  <div className="account-field">
                    <div className="account-field-label">Email</div>
                    {editMode ? (
                      <Form.Control
                        aria-label="Email"
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
                      <div className="account-field-value">{user?.email}</div>
                    )}
                  </div>

                  <div className="account-field">
                    <div className="account-field-label">Role</div>
                    <div className="account-field-value text-capitalize">
                      {user?.role || "tenant"}
                    </div>
                  </div>
                </Stack>

                {error && <p className="account-error">{error}</p>}

                {isGuest ? (
                  <div className="account-actions account-actions-stacked">
                    <p className="account-card-sub">
                      Sign in to edit your profile, post questions, and access
                      lease review.
                    </p>
                    <Link href="/auth/login" className="btn-warm-primary">
                      Sign in for full access
                    </Link>
                  </div>
                ) : (
                  <div className="account-actions">
                    {!editMode ? (
                      <>
                        <button
                          className="btn-warm-outline"
                          onClick={() => {
                            setError("");
                            setEditMode(true);
                          }}
                        >
                          Edit profile
                        </button>
                        <button
                          className="btn-warm-highlight"
                          onClick={handleLogout}
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-warm-primary"
                          disabled={saving}
                          onClick={handleSaveProfile}
                        >
                          {saving ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          className="btn-warm-outline"
                          disabled={saving}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="account-card-head">
                  <h2 id="account-profile-title" className="account-card-title">Sign in</h2>
                  <p className="account-card-sub">
                    Lease review, posting questions, and attorney replies
                    require sign-in.
                  </p>
                </div>

                <div className="account-actions account-actions-stacked">
                  <Link href="/auth/login" className="btn-warm-primary">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="btn-warm-outline">
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </section>
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
