
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  Notification
} from "@/redux/slices/searchSlice";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Check, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

const NotificationsPanel = () => {
  const notifications = useSelector((state: RootState) => state.search.notifications);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
    toast({
      title: "All notifications marked as read",
    });
  };

  const confirmDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteNotification = () => {
    if (selectedNotification) {
      dispatch(deleteNotification(selectedNotification.id));
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
      
      toast({
        title: "Notification deleted",
      });
    }
  };

  const handleDeleteAllNotifications = () => {
    dispatch(deleteAllNotifications());
    setConfirmDeleteAllOpen(false);
    
    toast({
      title: "All notifications deleted",
    });
  };

  if (notifications.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <BellOff className="h-10 w-10 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No notifications</CardTitle>
          <CardDescription>
            You'll see notifications here when there are updates about your saved searches or new courses.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Stay updated on new courses and alerts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" /> Mark all as read
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfirmDeleteAllOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border rounded-lg ${notification.isRead ? 'bg-background' : 'bg-accent/20 border-accent'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {notification.type === 'new_course' && (
                          <Bell className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'alert_match' && (
                          <AlertCircle className="h-4 w-4 text-primary" />
                        )}
                        {notification.type === 'system' && (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                        )}
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => confirmDelete(notification)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Single Notification Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this notification?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Notifications Dialog */}
      <Dialog open={confirmDeleteAllOpen} onOpenChange={setConfirmDeleteAllOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Notifications</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete all notifications? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteAllOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllNotifications}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsPanel;
