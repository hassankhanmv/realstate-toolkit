import type { Store } from "@reduxjs/toolkit";
import i18next from "i18next";
import { validation } from "./validation";
import { setLoading, addToast, removeToast } from "../store/slices/uiSlice";

declare global {
  interface Window {
    App: {
      store: Store;
      validation: typeof validation;
      translateStatic: (key: string, options?: any) => string;
      actions: {
        setLoading: (isLoading: boolean) => void;
        addToast: (toast: Omit<Parameters<typeof addToast>[0], "id">) => void;
        removeToast: (id: string) => void;
      };
    };
  }
}

export const initializeGlobalApp = (store: Store) => {
  if (typeof window !== "undefined") {
    window.App = {
      store,
      validation,
      translateStatic: (key: string, options?: any) =>
        i18next.t(key, options) as string,
      actions: {
        setLoading: (isLoading: boolean) =>
          store.dispatch(setLoading(isLoading)),
        addToast: (toast: Omit<Parameters<typeof addToast>[0], "id">) =>
          store.dispatch(addToast(toast)),
        removeToast: (id: string) => store.dispatch(removeToast(id)),
      },
    };
  }
};
