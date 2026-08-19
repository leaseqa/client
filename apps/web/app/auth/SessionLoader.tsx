"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setGuestSession, setSession, signOut } from "@/app/store";
import { unwrapData } from "@/app/lib/api/client";
import * as client from "./client";

export default function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const user = await client.fetchSession();
        if ( user && typeof user === "object" ) {
          dispatch(setSession(unwrapData(user)));
          localStorage.removeItem("guest_session");
        }
      } catch {
        const isGuest = localStorage.getItem("guest_session") === "true";
        if ( isGuest ) {
          dispatch(setGuestSession());
        } else {
          dispatch(signOut());
        }
      } finally {
        setReady(true);
      }
    };

    loadSession();
  }, [dispatch]);

  if ( !ready ) {
    return null;
  }

  return <div>{children}</div>;
}
