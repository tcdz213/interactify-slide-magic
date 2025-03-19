
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, X } from "lucide-react";
import { Center } from "@/types/center.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CentersListProps {
  centers: Center[];
  onEdit: (center: Center) => void;
  onDelete: (center: Center) => void;
  onVerify: (id: number) => void;
  viewMode: "grid" | "list";
}

const CentersList = ({ centers, onEdit, onDelete, onVerify, viewMode }: CentersListProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: 
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  if (centers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No training centers found. Try adjusting your search or filters.
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centers.map((center) => (
          <Card key={center.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{center.name}</h3>
                  <Badge className={getStatusClass(center.status)}>{center.status}</Badge>
                </div>
                
                <div className="mb-1 text-sm text-muted-foreground">
                  <span className="font-medium">Location:</span> {center.location}
                </div>
                
                {center.category && (
                  <div className="mb-1 text-sm text-muted-foreground">
                    <span className="font-medium">Category:</span> {center.category}
                  </div>
                )}
                
                {center.description && (
                  <div className="my-2 text-sm">
                    {center.description}
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <Button 
                    variant={center.verified ? "default" : "outline"} 
                    size="sm"
                    onClick={() => onVerify(center.id)}
                    className="text-xs"
                  >
                    {center.verified ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Verified
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" /> Unverified
                      </>
                    )}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(center)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(center)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-5 font-semibold p-4 border-b">
        <div>Name</div>
        <div>Location</div>
        <div>Status</div>
        <div>Verification</div>
        <div className="text-right">Actions</div>
      </div>
      
      {centers.map((center) => (
        <div key={center.id} className="grid grid-cols-5 p-4 border-b last:border-0 items-center">
          <div className="font-medium">
            {center.name}
            {center.category && (
              <div className="text-xs text-muted-foreground mt-1">{center.category}</div>
            )}
          </div>
          <div>{center.location}</div>
          <div>
            <Badge className={`${getStatusClass(center.status)}`}>
              {center.status}
            </Badge>
          </div>
          <div>
            <Button 
              variant={center.verified ? "default" : "outline"} 
              size="sm"
              onClick={() => onVerify(center.id)}
            >
              {center.verified ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Verified
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" /> Unverified
                </>
              )}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(center)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onDelete(center)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CentersList;
