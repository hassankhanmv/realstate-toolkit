import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { removeToast } from "../../store/slices/uiSlice";
import { Toaster, toast as sonnerToast } from "sonner";

export function GlobalToaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();
  const processedToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach((toast) => {
      if (!processedToasts.current.has(toast.id)) {
        processedToasts.current.add(toast.id);

        if (toast.type === "success") {
          sonnerToast.success(toast.message, { duration: toast.duration });
        } else if (toast.type === "error") {
          sonnerToast.error(toast.message, { duration: toast.duration });
        } else if (toast.type === "info") {
          sonnerToast.info(toast.message, { duration: toast.duration });
        } else if (toast.type === "warning") {
          sonnerToast.warning(toast.message, { duration: toast.duration });
        } else {
          sonnerToast(toast.message, { duration: toast.duration });
        }

        setTimeout(() => {
          dispatch(removeToast(toast.id));
          processedToasts.current.delete(toast.id);
        }, 100);
      }
    });
  }, [toasts, dispatch]);

  // richColors makes the toasts brightly colored based on their status!
  return <Toaster richColors closeButton position="top-right" />;
}