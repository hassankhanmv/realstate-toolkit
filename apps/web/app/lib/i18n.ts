import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    defaultNS: "common",
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    ns: ["common"],
    fallbackNS: "common",
  });

// Export a promise that resolves when i18n is fully initialized
export const i18nReady = new Promise<void>((resolve) => {
  if (i18n.isInitialized) {
    resolve();
  } else {
    i18n.on("initialized", () => {
      resolve();
    });
  }
});

export default i18n;
