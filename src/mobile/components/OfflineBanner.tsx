import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    return () => {
      window.removeEventListener("online", onOn);
      window.removeEventListener("offline", onOff);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 py-1.5 px-3">
      <WifiOff className="h-3 w-3" />
      Mode hors ligne — les données seront synchronisées au retour du réseau
    </div>
  );
}
