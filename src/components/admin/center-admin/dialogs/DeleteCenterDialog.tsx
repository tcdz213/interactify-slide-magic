
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCenterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  center: any;
  onConfirm: () => void;
}

const DeleteCenterDialog = ({ 
  isOpen, 
  onOpenChange, 
  center, 
  onConfirm 
}: DeleteCenterDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p className="py-4">
          Are you sure you want to delete {center?.name}? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCenterDialog;
