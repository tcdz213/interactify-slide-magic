import React from "react";
import { Badge } from "@/components/ui/badge";
import { Center, featureLabels } from "../types";
import { CurrencyDisplay } from "@/components/home";
import { ShareButton, ViewDetailsButton } from "./";
import { useCourseComparison } from "@/hooks/centers";
import { CompareButton } from "@/components/centers/card";
interface ListCardContentProps {
  center: Center;
  handleViewDetails: (centerId: number) => void;
}

const ListCardContent: React.FC<ListCardContentProps> = ({
  center,
  handleViewDetails,
}) => {
  const { addToComparison, removeFromComparison, isInComparison } =
    useCourseComparison();
  const isCompared = isInComparison(center.id);
  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(center.id);
    } else {
      addToComparison(center);
    }
  };
  return (
    <div className="p-5 md:w-2/3 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-medium">{center.name}</h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <svg
              className="h-3.5 w-3.5 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{center.location}</span>
            <Badge variant="outline" className="ml-3 bg-primary/5">
              {center.category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center bg-primary/5 text-primary text-sm px-2 py-1 rounded-md">
          <svg
            className="h-3.5 w-3.5 fill-current mr-1"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
              fill="currentColor"
            />
          </svg>
          <span>
            {center.rating} ({center.reviews} reviews)
          </span>
        </div>
      </div>

      <p className="text-muted-foreground mt-3 mb-4">{center.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {center.features.map((feature) => (
          <Badge
            key={feature}
            variant="outline"
            className="text-xs rounded-full px-2 py-0 bg-primary/5"
          >
            {featureLabels[feature]}
          </Badge>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-primary font-medium text-lg">
          <CurrencyDisplay amount={center.price} currency={center.currency} />
        </div>
        <div className="flex space-x-2">
          <CompareButton
            isCompared={isCompared}
            onToggle={handleToggleComparison}
          />
          <ShareButton
            centerId={center.id}
            centerName={center.name}
            size="sm"
            variant="subtle"
          />
          <ViewDetailsButton onClick={() => handleViewDetails(center.id)} />
        </div>
      </div>
    </div>
  );
};

export default ListCardContent;
