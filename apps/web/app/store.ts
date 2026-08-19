import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SessionRole = "tenant" | "lawyer" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
  avatar: string;
  lawyerVerified: boolean;
};

export type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated" | "guest";
  user: SessionUser | null;
};

const DEFAULT_AVATAR = "/images/NEU.png";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | null {
  if ( typeof value !== "string" ) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asSessionRole(value: unknown): SessionRole {
  if ( value === "lawyer" || value === "admin" || value === "tenant" ) {
    return value;
  }
  return "tenant";
}

export function parseSessionUser(payload: unknown): SessionUser | null {
  if ( !isRecord(payload) ) {
    return null;
  }
  const id = asNonEmptyString(payload._id) || asNonEmptyString(payload.id);
  if ( !id ) {
    return null;
  }
  const name =
    asNonEmptyString(payload.username) ||
    asNonEmptyString(payload.name) ||
    asNonEmptyString(payload.email) ||
    "User";
  const email = asNonEmptyString(payload.email) || "";
  return {
    id,
    name,
    email,
    role: asSessionRole(payload.role),
    avatar: asNonEmptyString(payload.avatar) || DEFAULT_AVATAR,
    lawyerVerified: payload.lawyerVerified === true,
  };
}

const initialSessionState: SessionState = {
  status: "loading",
  user: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState: initialSessionState,
  reducers: {
    setSession(state, action: PayloadAction<unknown>) {
      const user = parseSessionUser(action.payload);
      if ( !user ) {
        state.status = "unauthenticated";
        state.user = null;
        return;
      }
      state.status = "authenticated";
      state.user = user;
    },
    signOut(state) {
      state.status = "unauthenticated";
      state.user = null;
    },
    signInAsDemo(state, action: PayloadAction<{ name: string; email: string; role?: SessionRole }>) {
      state.status = "authenticated";
      state.user = {
        id: `demo-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role || "tenant",
        avatar: DEFAULT_AVATAR,
        lawyerVerified: false,
      };
    },
    setGuestSession(state) {
      state.status = "guest";
      state.user = {
        id: "guest",
        name: "Guest",
        email: "guest@leaseqa.com",
        role: "tenant",
        avatar: DEFAULT_AVATAR,
        lawyerVerified: false,
      };
    },
  },
});

const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setSession, signOut, signInAsDemo, setGuestSession } = sessionSlice.actions;

export default store;
