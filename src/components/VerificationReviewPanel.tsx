import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { verificationApi, type VerificationRequest } from "@/services/verificationApi";
import { useToast } from "@/hooks/use-toast";

export const VerificationReviewPanel = () => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    setLoading(true);
    const data = await verificationApi.getAllVerifications();
    setVerifications(data);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setIsProcessing(true);
    const result = await verificationApi.approveUserVerification(selectedVerification.user_id, reviewNotes);
    
    if (result.success) {
      toast({
        title: "Verification Approved",
        description: "User has been verified successfully",
      });
      setSelectedVerification(null);
      setReviewNotes("");
      await loadVerifications();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve verification",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    
    if (!reviewNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide rejection reason",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const result = await verificationApi.rejectUserVerification(selectedVerification.user_id, reviewNotes);
    
    if (result.success) {
      toast({
        title: "Verification Rejected",
        description: "User has been notified",
      });
      setSelectedVerification(null);
      setReviewNotes("");
      await loadVerifications();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject verification",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500/50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500/50">Rejected</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = verifications.filter(v => v.verification_status === 'pending').length;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Verification Requests</h3>
            <p className="text-sm text-muted-foreground mt-1">Review provider verification documents</p>
          </div>
          <Badge variant="default" className="bg-yellow-500">
            {pendingCount} Pending
          </Badge>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Icon name="loader" className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : verifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No verification requests found
                      </TableCell>
                    </TableRow>
                   ) : (
                    verifications.map((verification) => (
                      <TableRow key={verification.user_id}>
                        <TableCell className="font-medium">{verification.user_name}</TableCell>
                        <TableCell className="text-muted-foreground">{verification.user_email}</TableCell>
                        <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(verification.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>1 file</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVerification(verification);
                              setReviewNotes(verification.verification_notes || "");
                            }}
                          >
                            <Icon name="eye" className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={(open) => {
        if (!open) {
          setSelectedVerification(null);
          setReviewNotes("");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Review Verification Request</span>
              {selectedVerification && getStatusBadge(selectedVerification.verification_status)}
            </DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedVerification.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedVerification.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {new Date(selectedVerification.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedVerification.verification_status}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Document</p>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="image" className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Verification Document</p>
                        <p className="text-xs text-muted-foreground">{selectedVerification.document_type}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedVerification.document_url, '_blank')}
                    >
                      <Icon name="externalLink" className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Domain:</strong> {selectedVerification.domain_key}</p>
                    <p><strong>Subcategory:</strong> {selectedVerification.subcategory_key}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Review Notes {selectedVerification.verification_status === 'pending' && '(Required for rejection)'}
                </label>
                <Textarea
                  placeholder="Add notes about this verification request..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  disabled={selectedVerification.verification_status !== 'pending'}
                />
              </div>

              {selectedVerification.verification_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVerification(null)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    <Icon name="xCircle" className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-gradient-primary"
                  >
                    <Icon name="checkCircle" className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
