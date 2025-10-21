import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/services/adminApi";
import { cardApi } from "@/services/cardApi";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Star, Trash2, Search, Calendar, User, Flag, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { BusinessCard } from "@/types/business-card";

interface Review {
  id: string;
  business_id: string;
  business_name?: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
  helpful_count?: number;
  verified_purchase?: boolean;
  is_flagged?: boolean;
  flag_reason?: string;
}

interface ReviewsTabProps {}

export const ReviewsTab = ({}: ReviewsTabProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [cardDetails, setCardDetails] = useState<Record<string, BusinessCard>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadReviews();
  }, [statusFilter, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllReviews(currentPage, 50, statusFilter);
      setReviews(data.reviews);
      setTotalPages(data.pagination.total_pages);
      setTotalReviews(data.pagination.total_reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCardDetails = async (businessId: string) => {
    if (cardDetails[businessId] || loadingDetails[businessId]) return;

    try {
      setLoadingDetails((prev) => ({ ...prev, [businessId]: true }));
      const card = await cardApi.getCard(businessId);
      setCardDetails((prev) => ({ ...prev, [businessId]: card }));
    } catch (error) {
      console.error("Error loading card details:", error);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [businessId]: false }));
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      await adminApi.deleteReview(selectedReview.id);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter((review) =>
    searchQuery
      ? review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      : true
  );

  const getFlaggedCount = () => reviews.filter(r => r.is_flagged).length;
  const getVerifiedCount = () => reviews.filter(r => r.verified_purchase).length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flagged Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{getFlaggedCount()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{getVerifiedCount()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <Tabs value={statusFilter} onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setCurrentPage(1);
              }}>
                <TabsList>
                  <TabsTrigger value="all">All ({totalReviews})</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged ({getFlaggedCount()})</TabsTrigger>
                  <TabsTrigger value="verified">Verified ({getVerifiedCount()})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          to={`/cards/${review.business_id}`}
                          className="font-medium text-primary hover:underline cursor-pointer"
                          onClick={() => loadCardDetails(review.business_id)}
                        >
                          {review.business_name || review.business_id}
                        </Link>
                        {cardDetails[review.business_id] && (
                          <div className="text-xs text-muted-foreground">
                            {cardDetails[review.business_id].domain_key}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{review.user_name}</div>
                          {review.user_email && (
                            <div className="text-xs text-muted-foreground">
                              {review.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <div className="max-w-md space-y-1">
                        <div className="font-medium text-sm">{review.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment}
                        </div>
                        {review.helpful_count && review.helpful_count > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {review.helpful_count} helpful votes
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {review.is_flagged && (
                          <Badge variant="destructive" className="gap-1">
                            <Flag className="w-3 h-3" />
                            Flagged
                          </Badge>
                        )}
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
              {selectedReview && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="font-medium">{selectedReview.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    by {selectedReview.user_name}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
