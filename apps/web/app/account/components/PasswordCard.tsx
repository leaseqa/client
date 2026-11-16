"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch } from "react-redux";

import { setSession } from "@/app/store";
import { apiErrorMessage } from "@/app/lib/api/client";
import * as client from "../client";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

type Field = keyof typeof EMPTY_FORM;

export default function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);

  const updateField = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setChanged(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setChanged(false);
    if ( form.newPassword !== form.confirmPassword ) {
      setError("The new passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const user = await client.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      dispatch(setSession(user));
      setForm(EMPTY_FORM);
      setChanged(true);
    } catch ( err: unknown ) {
      setError(apiErrorMessage(err, "Failed to change password."));
    } finally {
      setSaving(false);
    }
  };

  const incomplete = !form.currentPassword || !form.newPassword || !form.confirmPassword;

  return (
    <section className="account-card" aria-labelledby="account-password-title">
      <div className="account-card-head">
        <h2 id="account-password-title" className="account-card-title">Password</h2>
        {!hasPassword && (
          <p className="account-card-sub">
            You sign in with Google, so this account has no password to change.
          </p>
        )}
      </div>

      {hasPassword && (
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="account-current-password">
            <Form.Label>Current password</Form.Label>
            <Form.Control
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={updateField("currentPassword")}
              disabled={saving}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="account-new-password">
            <Form.Label>New password</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={updateField("newPassword")}
              disabled={saving}
            />
          </Form.Group>
          <Form.Group controlId="account-confirm-password">
            <Form.Label>Confirm new password</Form.Label>
            <Form.Control
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              disabled={saving}
            />
          </Form.Group>

          {error && <p className="account-error" role="alert">{error}</p>}
          {changed && <p className="account-success" role="status">Password changed.</p>}

          <div className="account-actions">
            <button type="submit" className="btn-warm-primary" disabled={saving || incomplete}>
              {saving ? "Saving…" : "Change password"}
            </button>
          </div>
        </Form>
      )}
    </section>
  );
}
