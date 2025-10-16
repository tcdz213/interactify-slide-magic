import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@/components/ui/icon";

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
}

export const BackButton = ({ fallbackPath = "/home", label = "Back" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="gap-2 hover:bg-muted/50 transition-all active:scale-95"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};
