import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, Flag, RotateCcw, Calendar, BarChart3, Download, Tags, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminCard, adminApi } from "@/services/adminApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface CardsTabProps {
  cards: AdminCard[];
  onRefresh: () => Promise<void>;
}

export const CardsTab = ({ cards, onRefresh }: CardsTabProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterView, setFilterView] = useState<"all" | "active" | "flagged" | "deleted">("all");
  const [deleteCardDialog, setDeleteCardDialog] = useState<{ open: boolean; card: AdminCard | null }>({ 
    open: false, 
    card: null 
  });
  const [flagDialog, setFlagDialog] = useState<{ open: boolean; card: AdminCard | null }>({ 
    open: false, 
    card: null 
  });
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; card: AdminCard | null }>({ 
    open: false, 
    card: null 
  });
  const [tagsDialog, setTagsDialog] = useState<{ open: boolean; card: AdminCard | null }>({ 
    open: false, 
    card: null 
  });
  const [analyticsDialog, setAnalyticsDialog] = useState<{ open: boolean; card: AdminCard | null }>({ 
    open: false, 
    card: null 
  });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [flagReason, setFlagReason] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [newTags, setNewTags] = useState("");

  const getFilteredCards = () => {
    let filtered = cards.filter((card) =>
      card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (filterView) {
      case "active":
        return filtered.filter(card => !card.deleted_at && !card.is_flagged);
      case "flagged":
        return filtered.filter(card => card.is_flagged);
      case "deleted":
        return filtered.filter(card => card.deleted_at);
      default:
        return filtered;
    }
  };

  const filteredCards = getFilteredCards();

  const handleViewCard = (cardId: string) => {
    navigate(`/card/${cardId}`);
  };

  const handleDeleteCard = async (permanent: boolean = false) => {
    if (!deleteCardDialog.card) return;
    
    try {
      setActionLoading(true);
      await adminApi.deleteCard(deleteCardDialog.card.id, permanent);
      await onRefresh();
      setDeleteCardDialog({ open: false, card: null });
    } catch (error) {
      console.error('Failed to delete card:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreCard = async (cardId: string) => {
    try {
      setActionLoading(true);
      await adminApi.restoreCard(cardId);
      await onRefresh();
    } catch (error) {
      console.error('Failed to restore card:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlagCard = async () => {
    if (!flagDialog.card) return;
    
    try {
      setActionLoading(true);
      const shouldFlag = !flagDialog.card.is_flagged;
      await adminApi.toggleCardFlag(flagDialog.card.id, shouldFlag, shouldFlag ? flagReason : undefined);
      await onRefresh();
      setFlagDialog({ open: false, card: null });
      setFlagReason("");
    } catch (error) {
      console.error('Failed to flag card:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleCard = async () => {
    if (!scheduleDialog.card) return;
    
    try {
      setActionLoading(true);
      await adminApi.scheduleCard(
        scheduleDialog.card.id, 
        publishDate || undefined, 
        expireDate || undefined
      );
      await onRefresh();
      setScheduleDialog({ open: false, card: null });
      setPublishDate("");
      setExpireDate("");
    } catch (error) {
      console.error('Failed to schedule card:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTags = async () => {
    if (!tagsDialog.card) return;
    
    try {
      setActionLoading(true);
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      await adminApi.updateCardTags(tagsDialog.card.id, tags);
      await onRefresh();
      setTagsDialog({ open: false, card: null });
      setNewTags("");
    } catch (error) {
      console.error('Failed to update tags:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCards = async () => {
    try {
      setActionLoading(true);
      const filters = {
        flagged: filterView === "flagged" ? true : undefined,
        deleted: filterView === "deleted" ? true : undefined,
      };
      const blob = await adminApi.exportCards(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cards-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Cards exported successfully"
      });
    } catch (error) {
      console.error('Failed to export cards:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = cards.filter(c => !c.deleted_at && !c.is_flagged).length;
  const flaggedCount = cards.filter(c => c.is_flagged).length;
  const deletedCount = cards.filter(c => c.deleted_at).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleExportCards} disabled={actionLoading} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs value={filterView} onValueChange={(v) => setFilterView(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({cards.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flaggedCount})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({deletedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filterView} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.title}</TableCell>
                      <TableCell>{card.company}</TableCell>
                      <TableCell>{card.domain}</TableCell>
                      <TableCell>
                        {card.tags && card.tags.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {card.tags.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                            {card.tags.length > 2 && <Badge variant="outline" className="text-xs">+{card.tags.length - 2}</Badge>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No tags</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {card.deleted_at && (
                            <Badge variant="destructive">Deleted</Badge>
                          )}
                          {card.is_flagged && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                          {!card.deleted_at && !card.is_flagged && (
                            <Badge variant={card.is_public ? 'default' : 'secondary'}>
                              {card.is_public ? 'Public' : 'Private'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{card.view_count || 0}</TableCell>
                      <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {card.deleted_at ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRestoreCard(card.id)}
                              disabled={actionLoading}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewCard(card.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setFlagDialog({ open: true, card })}
                              >
                                <Flag className={`w-4 h-4 ${card.is_flagged ? 'fill-destructive text-destructive' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTagsDialog({ open: true, card });
                                  setNewTags(card.tags?.join(', ') || '');
                                }}
                              >
                                <Tags className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setScheduleDialog({ open: true, card })}
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteCardDialog({ open: true, card })}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Card Dialog */}
      <Dialog open={deleteCardDialog.open} onOpenChange={(open) => setDeleteCardDialog({ open, card: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              {deleteCardDialog.card?.deleted_at 
                ? "This card is already in trash. Do you want to permanently delete it?"
                : "Do you want to move this card to trash or permanently delete it?"
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCardDialog({ open: false, card: null })}>
              Cancel
            </Button>
            {!deleteCardDialog.card?.deleted_at && (
              <Button variant="secondary" onClick={() => handleDeleteCard(false)} disabled={actionLoading}>
                Move to Trash
              </Button>
            )}
            <Button variant="destructive" onClick={() => handleDeleteCard(true)} disabled={actionLoading}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Card Dialog */}
      <Dialog open={flagDialog.open} onOpenChange={(open) => setFlagDialog({ open, card: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{flagDialog.card?.is_flagged ? "Unflag" : "Flag"} Card</DialogTitle>
            <DialogDescription>
              {flagDialog.card?.is_flagged 
                ? "Remove the flag from this card?"
                : "Flag this card as inappropriate or requiring review."
              }
            </DialogDescription>
          </DialogHeader>
          {!flagDialog.card?.is_flagged && (
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter reason for flagging..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialog({ open: false, card: null })}>
              Cancel
            </Button>
            <Button onClick={handleFlagCard} disabled={actionLoading}>
              {flagDialog.card?.is_flagged ? "Unflag" : "Flag"} Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Card Dialog */}
      <Dialog open={scheduleDialog.open} onOpenChange={(open) => setScheduleDialog({ open, card: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Card</DialogTitle>
            <DialogDescription>
              Set publishing and expiration dates for this card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Publish Date (optional)</Label>
              <Input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expire Date (optional)</Label>
              <Input
                type="datetime-local"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog({ open: false, card: null })}>
              Cancel
            </Button>
            <Button onClick={handleScheduleCard} disabled={actionLoading}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Dialog */}
      <Dialog open={tagsDialog.open} onOpenChange={(open) => setTagsDialog({ open, card: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add or update tags for this card (comma-separated).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="e.g. premium, verified, featured"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsDialog({ open: false, card: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTags} disabled={actionLoading}>
              Update Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};