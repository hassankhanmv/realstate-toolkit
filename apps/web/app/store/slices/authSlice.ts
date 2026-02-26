import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserWithProfile } from "@repo/supabase";

interface AuthState {
  user: UserWithProfile | null;
  loading: boolean;
  tableLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  tableLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserWithProfile | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTableLoading: (state, action: PayloadAction<boolean>) => {
      state.tableLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setTableLoading, setError, resetAuth } =
  authSlice.actions;

// Selectors
export const selectCanCreateProperty = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.properties?.create;
export const selectCanEditProperty = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.properties?.edit;
export const selectCanDeleteProperty = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.properties?.delete;

export const selectCanCreateLead = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.leads?.create;
export const selectCanEditLead = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.leads?.edit;
export const selectCanDeleteLead = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.leads?.delete;

export const selectCanCreateUser = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.users?.create;
export const selectCanEditUser = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.users?.edit;
export const selectCanDeleteUser = (state: { auth: AuthState }) =>
  !!state.auth.user?.profile?.permissions?.users?.delete;

export default authSlice.reducer;
