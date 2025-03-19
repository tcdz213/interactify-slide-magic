
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Center } from "@/types/center.types";

interface CenterItemProps {
  center: {
    id: number;
    name: string;
    location: string;
    description: string;
  };
  onEdit: (center: Center) => void;
  onDelete: (center: Center) => void;
}

const CenterItem = ({ center, onEdit, onDelete }: CenterItemProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-lg">{center.name}</h4>
          <p className="text-muted-foreground">{center.location}</p>
          <p className="mt-2">{center.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(center as Center)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(center as Center)}>
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CenterItem;
