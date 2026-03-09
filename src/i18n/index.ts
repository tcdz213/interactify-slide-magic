import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const savedLang = localStorage.getItem("jawda-lang") || "fr";

// Set initial direction and lang on the document
document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
document.documentElement.lang = savedLang;

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en }, ar: { translation: ar } },
  lng: savedLang,
  fallbackLng: "fr",
  interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
});

export default i18n;
