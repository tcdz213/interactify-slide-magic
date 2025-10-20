import { useState, useEffect } from "react";
import { adminApi, type AdminReport } from "@/services/adminApi";
import { cardApi } from "@/services/cardApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertCircle, CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { BusinessCard } from "@/types/business-card";

export const ReportsTab = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ pending: 0, resolved: 0, dismissed: 0 });
  const [cardDetails, setCardDetails] = useState<BusinessCard | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter, typeFilter, currentPage]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReports({
        page: currentPage,
        limit: 20,
        status: statusFilter as any,
        report_type: typeFilter as any,
      });
      
      setReports(response.reports);
      setStats(response.stats);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      console.error("Failed to load reports:", error);
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

  const handleReportSelect = (report: AdminReport) => {
    setSelectedReport(report);
    setCardDetails(null);
    loadCardDetails(report.card_id);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    
    try {
      setProcessing(true);
      await adminApi.updateReportStatus(selectedReport.id, "resolved", adminNotes);
      setSelectedReport(null);
      setAdminNotes("");
      await loadReports();
    } catch (error) {
      console.error("Failed to resolve report:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;
    
    try {
      setProcessing(true);
      await adminApi.updateReportStatus(selectedReport.id, "dismissed", adminNotes);
      setSelectedReport(null);
      setAdminNotes("");
      await loadReports();
    } catch (error) {
      console.error("Failed to dismiss report:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: AlertCircle },
      resolved: { variant: "default", icon: CheckCircle },
      dismissed: { variant: "secondary", icon: XCircle },
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

  const getReportTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      inappropriate: "bg-red-500/10 text-red-700 dark:text-red-400",
      incorrect: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      spam: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      copyright: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    
    return (
      <Badge variant="outline" className={colors[type] || colors.other}>
        {type}
      </Badge>
    );
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Reports</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved Reports</CardDescription>
            <CardTitle className="text-3xl">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dismissed Reports</CardDescription>
            <CardTitle className="text-3xl">{stats.dismissed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Management</CardTitle>
          <CardDescription>Review and manage user-submitted reports</CardDescription>
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
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inappropriate">Inappropriate</SelectItem>
                <SelectItem value="incorrect">Incorrect</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Card</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Reporter</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No reports found
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link 
                            to={`/card/${report.card_id}`}
                            className="font-medium hover:text-primary inline-flex items-center gap-1"
                            target="_blank"
                          >
                            {report.card_title || report.card_id}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{report.user_name || report.user_id}</td>
                        <td className="px-4 py-3">{getReportTypeBadge(report.report_type)}</td>
                        <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReportSelect(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Review the details and take appropriate action
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {loadingDetails ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Card</p>
                      <Link 
                        to={`/card/${selectedReport.card_id}`}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        target="_blank"
                      >
                        {cardDetails?.title || selectedReport.card_title || selectedReport.card_id}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      {cardDetails && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {cardDetails.domain_key} • {cardDetails.address?.split(',')[0] || 'No location'}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Reporter</p>
                      <p className="text-sm text-muted-foreground">{selectedReport.user_name || selectedReport.user_id}</p>
                      {selectedReport.user_email && (
                        <p className="text-xs text-muted-foreground">{selectedReport.user_email}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Report Type</p>
                      {getReportTypeBadge(selectedReport.report_type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Status</p>
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                </>
              )}

              {selectedReport.details && (
                <div>
                  <p className="text-sm font-medium mb-1">Details</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedReport.details}
                  </p>
                </div>
              )}

              {selectedReport.status === "pending" && (
                <div>
                  <p className="text-sm font-medium mb-2">Admin Notes (Optional)</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>
              )}

              {selectedReport.admin_notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Admin Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedReport.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedReport?.status === "pending" && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleDismiss}
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
              <Button
                onClick={handleResolve}
                disabled={processing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
