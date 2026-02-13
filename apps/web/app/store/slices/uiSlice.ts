import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface UiState {
  isLoading: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  isLoading: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Math.random().toString(36).substring(7);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload,
      );
    },
  },
});

export const { setLoading, addToast, removeToast } = uiSlice.actions;

export default uiSlice.reducer;
