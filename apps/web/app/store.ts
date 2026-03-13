import {configureStore, createSlice, PayloadAction} from "@reduxjs/toolkit";

type Role = "tenant" | "lawyer" | "admin";

type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
};

type SessionState = {
    status: "loading" | "authenticated" | "unauthenticated" | "guest";
    user: User | null;
};

const initialSessionState: SessionState = {
    status: "loading",
    user: null,
};

const sessionSlice = createSlice({
    name: "session",
    initialState: initialSessionState,
    reducers: {
        setSession(state, action: PayloadAction<any>) {
            state.status = "authenticated";
            state.user = {
                id: action.payload._id || action.payload.id,
                name: action.payload.username || action.payload.name,
                email: action.payload.email,
                role: action.payload.role,
                avatar: "/images/NEU.png",
            };
        },
        signOut(state) {
            state.status = "unauthenticated";
            state.user = null;
        },
        signInAsDemo(state, action: PayloadAction<{ name: string; email: string; role?: Role }>) {
            state.status = "authenticated";
            state.user = {
                id: `demo-${Date.now()}`,
                name: action.payload.name,
                email: action.payload.email,
                role: action.payload.role || "tenant",
                avatar: "/images/NEU.png",
            };
        },
        setGuestSession(state) {
            state.status = "guest";
            state.user = {
                id: "guest",
                name: "Guest",
                email: "guest@leaseqa.com",
                role: "tenant",
                avatar: "/images/NEU.png",
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

export const {setSession, signOut, signInAsDemo, setGuestSession} = sessionSlice.actions;

export default store;
