import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Center } from "./types";
import { useWishlist } from "@/hooks/useWishlist";
import { useCourseComparison } from "@/hooks/centers";
import {
  CardImage,
  GridCardContent,
  ListCardContent,
  ListCardImage,
  FavoriteButton,
  CompareButton,
} from "./card";
import CenterCardSkeleton from "./CenterCardSkeleton";

interface CenterCardProps {
  center: Center;
  viewMode: "grid" | "list";
  isLoading?: boolean;
}

const CenterCard: React.FC<CenterCardProps> = ({
  center,
  viewMode,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavoriteItem } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison } =
    useCourseComparison();
  const isInFavorites = isFavorite(center.id);
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isCompared = isInComparison(center.id);

  // Show skeleton if loading
  if (isLoading) {
    return <CenterCardSkeleton viewMode={viewMode} />;
  }

  const handleViewDetails = (centerId: number) => {
    navigate(`/center/${centerId}`);
    toast(`Viewing details for center #${centerId}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    setError(null);

    try {
      // Simulate network delay for demonstration
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional errors (5% chance)
          if (Math.random() < 0.05) {
            reject(new Error("Network error occurred"));
          } else {
            resolve(true);
          }
        }, 500);
      });

      toggleFavoriteItem(center.id, center.name);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);

      toast.error(`Failed to update favorites: ${errorMessage}`);
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(center.id);
    } else {
      addToComparison(center);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-2">
          <ErrorAlert message={error} />
        </div>
      )}

      {viewMode === "grid" ? (
        <Card className="overflow-hidden border-0 rounded-xl shadow-sm hover-card-effect">
          <div className="relative">
            <CardImage
              center={center}
              isInFavorites={isInFavorites}
              handleToggleFavorite={handleToggleFavorite}
              isToggling={isToggling}
            />
            <div className="absolute bottom-3 right-3 z-10">
              {" "}
              <CompareButton
                isCompared={isCompared}
                onToggle={handleToggleComparison}
              />
            </div>
          </div>
          <CardContent className="p-0">
            <GridCardContent
              center={center}
              handleViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-0 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardFooter className="flex justify-end gap-2 px-6 pb-6 pt-0">
            <ListCardImage
              center={center}
              isInFavorites={isInFavorites}
              handleToggleFavorite={handleToggleFavorite}
              isToggling={isToggling}
            />
            <ListCardContent
              center={center}
              handleViewDetails={handleViewDetails}
            />
          </CardFooter>
        </Card>
      )}
    </>
  );
};

// Extract error alert to a separate component
const ErrorAlert = ({ message }: { message: string }) => {
  return (
    <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md flex items-center gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8V13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 16V16.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default CenterCard;
