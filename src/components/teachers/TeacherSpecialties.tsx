
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";

interface TeacherSpecialtiesProps {
  editMode: boolean;
  specialties: string[];
  onRemoveSpecialty?: (index: number) => void;
  newSpecialty?: string;
  setNewSpecialty?: (specialty: string) => void;
  onAddSpecialty?: () => void;
}

export const TeacherSpecialties = ({
  editMode,
  specialties,
  onRemoveSpecialty,
  newSpecialty = "",
  setNewSpecialty,
  onAddSpecialty
}: TeacherSpecialtiesProps) => {
  if (!editMode) {
    return (
      <div className="mt-4">
        <h4 className="font-medium">Specialties</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary">{specialty}</Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>Specialties</Label>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {specialties.map((specialty, index) => (
          <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
            {specialty}
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => onRemoveSpecialty?.(index)}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input 
          placeholder="Add a specialty"
          value={newSpecialty}
          onChange={(e) => setNewSpecialty?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddSpecialty?.()}
        />
        <Button type="button" onClick={onAddSpecialty}>Add</Button>
      </div>
    </div>
  );
};
