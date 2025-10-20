import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AiOutlineFlag, AiOutlineMessage, AiOutlineSend, AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";

const Flag = AiOutlineFlag;
const MessageSquare = AiOutlineMessage;
const Send = AiOutlineSend;
const CheckCircle = AiOutlineCheckCircle;
const X = AiOutlineClose;
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { reportsApi, CreateReportData } from "@/services/reportsApi";
import { errorHandler } from "@/utils/errorHandler";

interface ReportModalProps {
  cardId: string;
  cardTitle: string;
}

const reportTypes = [
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    description: "Contains offensive or inappropriate information"
  },
  {
    id: "incorrect",
    label: "Incorrect Information",
    description: "Contact details or business info is wrong"
  },
  {
    id: "spam",
    label: "Spam or Fake",
    description: "This appears to be spam or a fake business"
  },
  {
    id: "copyright",
    label: "Copyright Issues",
    description: "Uses copyrighted content without permission"
  },
  {
    id: "other",
    label: "Other",
    description: "Something else that needs attention"
  }
];

export const ReportModal = ({ cardId, cardTitle }: ReportModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType) {
      toast({
        title: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData: CreateReportData = {
        card_id: cardId,
        report_type: reportType as CreateReportData['report_type'],
        details: details || undefined,
      };

      await reportsApi.createReport(reportData);
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Report submitted successfully",
        description: "Thank you for helping us improve the platform"
      });

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false);
        setReportType("");
        setDetails("");
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Failed to submit report:', error);
      
      toast({
        title: "Failed to submit report",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const isMobile = useIsMobile();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="px-2 sm:px-3 hover-scale">
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline sm:ml-2">Report</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={`${isMobile ? 'h-[95vh] rounded-t-xl' : 'w-full max-w-lg'} p-0 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <SheetTitle className="flex items-center gap-2 text-left">
              <Flag className="w-5 h-5 text-destructive" />
              Report Business Card
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-6">
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">Report Submitted</h3>
                <p className="text-muted-foreground text-lg">
                  Thank you for your feedback. Our team will review this report.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 py-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reporting: <strong className="text-foreground">{cardTitle}</strong>
                  </p>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">What's the issue?</Label>
                  <RadioGroup value={reportType} onValueChange={setReportType} className="space-y-3">
                    {reportTypes.map((type) => (
                      <Card key={type.id} className={`cursor-pointer transition-all duration-200 hover-scale ${
                        reportType === type.id ? 'ring-2 ring-primary bg-primary/10 border-primary' : 'hover:border-primary/50 hover:bg-accent/5'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <RadioGroupItem value={type.id} id={type.id} className="mt-1 scale-110" />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor={type.id} className="font-semibold cursor-pointer text-base leading-none">
                                {type.label}
                              </Label>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="details" className="text-lg font-semibold mb-3 block">
                    Additional details (optional)
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Please provide any additional information that might help us understand the issue..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="min-h-[120px] resize-none text-base"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {details.length}/500 characters
                  </p>
                </div>
              </form>
            )}
          </div>

          {!isSubmitted && (
            <div className="px-6 py-4 border-t bg-background/95 backdrop-blur-sm">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-12 text-base"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 h-12 text-base font-semibold"
                  disabled={isSubmitting || !reportType}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};