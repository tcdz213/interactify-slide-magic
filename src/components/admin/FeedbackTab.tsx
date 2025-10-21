import { useState, useEffect } from "react";
import { adminApi } from "@/services/adminApi";
import { cardApi } from "@/services/cardApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MessageSquare, CheckCircle, Clock, Star, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { BusinessCard } from "@/types/business-card";

interface Feedback {
  id: string;
  card_id: string;
  card_title?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  feedback_type: string;
  subject: string;
  message: string;
  email?: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}

export const FeedbackTab = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ 
    pending: 0, 
    reviewed: 0, 
    resolved: 0, 
    average_rating: 0 
  });
  const [cardDetails, setCardDetails] = useState<BusinessCard | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, typeFilter, ratingFilter, currentPage]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllFeedback({
        page: currentPage,
        limit: 20,
        status: statusFilter as any,
        feedback_type: typeFilter as any,
        rating: ratingFilter === 'all' ? undefined : parseInt(ratingFilter),
      });
      
      setFeedback(response.feedback);
      setStats(response.stats);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCardDetails = async (cardId: string) => {
    try {
      setLoadingDetails(true);
      const card = await cardApi.getCard(cardId);
      setCardDetails(card);
    } catch (error) {
      console.error("Failed to load card details:", error);
      setCardDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFeedbackSelect = (item: Feedback) => {
    setSelectedFeedback(item);
    setCardDetails(null);
    loadCardDetails(item.card_id);
  };

  const handleUpdateStatus = async (status: 'pending' | 'reviewed' | 'resolved') => {
    if (!selectedFeedback) return;
    
    try {
      setProcessing(true);
      await adminApi.updateFeedbackStatus(selectedFeedback.id, status, adminNotes);
      setSelectedFeedback(null);
      setAdminNotes("");
      await loadFeedback();
    } catch (error) {
      console.error("Failed to update feedback:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      reviewed: { variant: "secondary", icon: Eye },
      resolved: { variant: "default", icon: CheckCircle },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getFeedbackTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      bug: "bg-red-500/10 text-red-700 dark:text-red-400",
      feature: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      improvement: "bg-green-500/10 text-green-700 dark:text-green-400",
      question: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    };
    
    return (
      <Badge variant="outline" className={colors[type] || colors.general}>
        {type}
      </Badge>
    );
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? 'fill-primary text-primary' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && feedback.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Feedback</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Reviewed</CardDescription>
            <CardTitle className="text-3xl">{stats.reviewed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-3xl">{stats.average_rating.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
          <CardDescription>Review and manage user-submitted feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found</p>
              </div>
            ) : (
              feedback.map((item) => (
                <Card key={item.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(item.status)}
                          {getFeedbackTypeBadge(item.feedback_type)}
                          {renderRating(item.rating)}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.subject}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Card: {item.card_title ? (
                              <Link to={`/card/${item.card_id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                                {item.card_title}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              <Link to={`/card/${item.card_id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                                {item.card_id}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </span>
                          <span>User: {item.user_name || item.user_id}</span>
                          {item.user_email && <span>Email: {item.user_email}</span>}
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedbackSelect(item)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Feedback</DialogTitle>
            <DialogDescription>
              Review and update feedback status
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedFeedback.status)}
                {getFeedbackTypeBadge(selectedFeedback.feedback_type)}
                {renderRating(selectedFeedback.rating)}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Subject</h4>
                <p className="text-sm">{selectedFeedback.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>

              {selectedFeedback.email && (
                <div>
                  <h4 className="font-semibold mb-2">Contact Email</h4>
                  <p className="text-sm">{selectedFeedback.email}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Card Details</h4>
                {loadingDetails ? (
                  <LoadingSpinner size="sm" />
                ) : cardDetails ? (
                  <div className="p-4 border rounded-lg space-y-2">
                    <p className="font-medium">{cardDetails.title}</p>
                    <p className="text-sm text-muted-foreground">{cardDetails.domain_key}</p>
                    {cardDetails.address && (
                      <p className="text-sm text-muted-foreground">{cardDetails.address}</p>
                    )}
                    <Link 
                      to={`/card/${selectedFeedback.card_id}`} 
                      className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                    >
                      View Card <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Card not found</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <Textarea
                  placeholder="Add notes about this feedback (optional)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedFeedback(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            {selectedFeedback?.status !== 'reviewed' && (
              <Button
                variant="secondary"
                onClick={() => handleUpdateStatus('reviewed')}
                disabled={processing}
              >
                Mark as Reviewed
              </Button>
            )}
            {selectedFeedback?.status !== 'resolved' && (
              <Button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={processing}
              >
                {processing ? "Processing..." : "Mark as Resolved"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};