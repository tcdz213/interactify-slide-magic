import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiOutlineMessage, AiOutlineSend, AiOutlineCheckCircle, AiOutlineStar } from "react-icons/ai";

const MessageSquare = AiOutlineMessage;
const Send = AiOutlineSend;
const CheckCircle = AiOutlineCheckCircle;
const Star = AiOutlineStar;
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackModalProps {
  cardId: string;
  cardTitle: string;
}

const feedbackTypes = [
  { id: "general", label: "General Feedback", icon: "💭" },
  { id: "improvement", label: "Suggestion for Improvement", icon: "💡" },
  { id: "bug", label: "Bug Report", icon: "🐛" },
  { id: "feature", label: "Feature Request", icon: "✨" },
];

export const FeedbackModal = ({ cardId, cardTitle }: FeedbackModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("general");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Please provide your feedback",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Feedback submitted successfully",
        description: "Thank you for your valuable feedback!"
      });

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackType("general");
        setEmail("");
        setSubject("");
        setMessage("");
        setRating(0);
        setIsOpen(false);
      }, 2000);
    }, 1500);
  };

  const StarRating = () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="p-2 hover-scale transition-all rounded-lg hover:bg-accent"
        >
          <Star
            className={`w-7 h-7 ${
              star <= rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const isMobile = useIsMobile();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="px-2 sm:px-3 hover-scale">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline sm:ml-2">Feedback</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={`${isMobile ? 'h-[95vh] rounded-t-xl' : 'w-full max-w-lg'} p-0 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <SheetTitle className="flex items-center gap-2 text-left">
              <MessageSquare className="w-5 h-5 text-primary" />
              Share Your Feedback
            </SheetTitle>
            <SheetDescription className="text-left text-muted-foreground">
              Help us improve by sharing your thoughts and suggestions.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-6">
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">Thank You!</h3>
                <p className="text-muted-foreground text-lg">
                  Your feedback helps us improve the platform for everyone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 py-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Feedback for: <strong className="text-foreground">{cardTitle}</strong>
                  </p>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Overall Rating (optional)</Label>
                  <div className="flex flex-col gap-3">
                    <StarRating />
                    {rating > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {rating} out of 5 stars
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Feedback Type</Label>
                  <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="space-y-3">
                    {feedbackTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 hover-scale ${
                          feedbackType === type.id
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-accent/5'
                        }`}
                      >
                        <RadioGroupItem value={type.id} id={type.id} className="scale-110" />
                        <Label htmlFor={type.id} className="cursor-pointer flex items-center gap-3 text-base flex-1">
                          <span className="text-xl">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-base font-medium mb-2 block">Your Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-base font-medium mb-2 block">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your feedback"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-12 text-base"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-lg font-semibold mb-3 block">
                    Your Feedback <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please share your thoughts, suggestions, or report any issues..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[140px] resize-none text-base"
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {message.length}/1000 characters
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
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Feedback
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