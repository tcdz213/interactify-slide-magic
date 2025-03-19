
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Building, 
  User, 
  AlertCircle, 
  Download, 
  RefreshCcw,
  Send
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentDetailsProps {
  payment: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, isOpen, onClose }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  
  if (!payment) return null;

  const getStatusElement = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <div className="flex items-center text-green-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Payment Completed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Payment Pending</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Payment Failed</span>
          </div>
        );
      case 'refunded':
        return (
          <div className="flex items-center text-blue-600">
            <RefreshCcw className="h-4 w-4 mr-2" />
            <span>Payment Refunded</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDownloadInvoice = () => {
    setIsProcessing(true);
    
    // Simulate invoice generation
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Invoice Downloaded",
        description: `Invoice #INV-${payment.id}-${new Date().getFullYear()} has been generated.`,
      });
    }, 1500);
  };

  const handleSendInvoice = () => {
    setIsProcessing(true);
    
    // Simulate sending invoice
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Invoice Sent",
        description: `Invoice has been sent to ${payment.owner}.`,
      });
    }, 1500);
  };

  const handleProcessRefund = () => {
    setIsProcessing(true);
    
    // Simulate refund processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowRefundDialog(false);
      toast({
        title: "Refund Processed",
        description: `Refund of $${payment.amount.toFixed(2)} has been initiated.`,
      });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6 p-4 bg-muted rounded-lg">
            {getStatusElement(payment.status)}
            <div className="mt-2 text-2xl font-bold">${payment.amount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(payment.date).toLocaleDateString()} • {payment.plan} Plan
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Owner</div>
                <div className="text-sm text-muted-foreground">{payment.owner}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Training Center</div>
                <div className="text-sm text-muted-foreground">{payment.centerName}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Subscription Plan</div>
                <div className="text-sm text-muted-foreground">{payment.plan} - ${payment.amount.toFixed(2)}/month</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Payment Date</div>
                <div className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Payment Method</div>
                <div className="text-sm text-muted-foreground">
                  {payment.paymentMethod || "Credit Card"} •••• {payment.lastFour || "4242"}
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Transaction ID</div>
                <div className="text-sm text-muted-foreground">
                  {payment.transactionId || `txn_${Math.random().toString(36).substring(2, 10)}`}
                </div>
              </div>
            </div>

            {payment.status === 'refunded' && (
              <div className="flex items-start space-x-3">
                <RefreshCcw className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Refund Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showRefundDialog ? (
          <div className="p-4 bg-red-50 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Confirm Refund</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to refund ${payment.amount.toFixed(2)} to {payment.owner}? 
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                disabled={isProcessing} 
                onClick={handleProcessRefund}
              >
                {isProcessing ? "Processing..." : "Confirm Refund"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRefundDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter className="flex flex-wrap gap-2 items-center">
            {payment.status === 'completed' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadInvoice} 
                  disabled={isProcessing}
                  className="flex items-center mr-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSendInvoice} 
                  disabled={isProcessing}
                  className="flex items-center mr-2"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Email Invoice
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRefundDialog(true)} 
                  disabled={isProcessing}
                >
                  Process Refund
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
