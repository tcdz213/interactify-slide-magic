import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Printer, FileText, Crown } from "lucide-react";
import { BusinessCardDisplay } from "@/types/business-card";
import { printCard, exportCardAsPDF, exportCardAsVCard } from "@/utils/cardExport";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ExportCardMenuProps {
  card: BusinessCardDisplay;
  isPro: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const ExportCardMenu = ({ 
  card, 
  isPro, 
  variant = "outline",
  size = "sm",
  className 
}: ExportCardMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to print business cards",
        variant: "destructive"
      });
      return;
    }

    try {
      printCard(card);
      toast({
        title: "Print Ready",
        description: "Opening print dialog..."
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: error instanceof Error ? error.message : "Failed to print card",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to export as PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      exportCardAsPDF(card);
      toast({
        title: "Export Successful",
        description: "Business card exported as HTML (save as PDF from browser)"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export card",
        variant: "destructive"
      });
    }
  };

  const handleExportVCard = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to export as vCard",
        variant: "destructive"
      });
      return;
    }

    try {
      exportCardAsVCard(card);
      toast({
        title: "Export Successful",
        description: "Contact exported as vCard"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vCard",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
          {isPro && <Crown className="w-3 h-3 ml-1 text-yellow-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
          <Printer className="w-4 h-4 mr-2" />
          <span>Print Card</span>
          {!isPro && <Crown className="w-3 h-3 ml-auto text-yellow-500" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          <span>Export as PDF</span>
          {!isPro && <Crown className="w-3 h-3 ml-auto text-yellow-500" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportVCard} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          <span>Export as vCard</span>
          {!isPro && <Crown className="w-3 h-3 ml-auto text-yellow-500" />}
        </DropdownMenuItem>

        {!isPro && (
          <div className="px-2 py-3 border-t mt-2">
            <Badge variant="outline" className="w-full justify-center text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Pro Feature
            </Badge>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Upgrade to unlock export features
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
