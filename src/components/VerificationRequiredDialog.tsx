import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface VerificationRequiredDialogProps {
  open: boolean;
  onClose: () => void;
}

export const VerificationRequiredDialog = ({ open, onClose }: VerificationRequiredDialogProps) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="shield" className="w-5 h-5 text-primary" />
            Domain Verification Required
          </DialogTitle>
          <DialogDescription>
            To create a business card, you need to verify your domain first.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert className="border-primary/50 bg-primary/10">
            <Icon name="alertTriangle" className="h-4 w-4" />
            <AlertDescription>
              Complete these steps in your profile:
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Select your business domain</li>
                <li>Choose your specialization (subcategory)</li>
                <li>Upload a verification document</li>
                <li>Wait for admin approval</li>
              </ol>
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            Once verified, your domain and subcategory will be automatically filled when creating cards.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleGoToProfile} className="flex-1 bg-gradient-primary">
            <Icon name="user" className="w-4 h-4 mr-2" />
            Go to Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
