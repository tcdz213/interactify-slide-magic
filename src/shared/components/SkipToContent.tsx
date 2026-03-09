/**
 * Phase M2 — Skip to content link for keyboard navigation.
 */
import { useTranslation } from "react-i18next";

export default function SkipToContent() {
  const { t } = useTranslation();
  return (
    <a href="#main-content" className="skip-to-content">
      {t("common.skipToContent", "Aller au contenu principal")}
    </a>
  );
}
