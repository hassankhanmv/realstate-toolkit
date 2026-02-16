import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLoading } from "@/store/slices/uiSlice";
import { i18nReady } from "@/lib/i18n";

interface I18nLoaderProps {
  children: ReactNode;
}

/**
 * I18nLoader - Prevents UI from rendering until translations are loaded
 *
 * This component:
 * - Shows the global loading spinner while translations load
 * - Prevents translation keys from flashing on page load
 * - Applies correct dir/lang attributes once i18n is ready
 */
export function I18nLoader({ children }: I18nLoaderProps) {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Show loading spinner
    dispatch(setLoading(true));

    // Wait for i18n to be fully initialized
    i18nReady.then(() => {
      // Apply dir and lang attributes
      const currentLang = i18n.language || "en";
      document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = currentLang;

      // Mark as ready and hide loading spinner
      setReady(true);
      dispatch(setLoading(false));
    });
  }, [dispatch, i18n]);

  // Don't render children until i18n is ready
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
