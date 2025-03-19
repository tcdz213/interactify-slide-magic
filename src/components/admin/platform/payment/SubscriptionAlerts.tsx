
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Send, Check } from 'lucide-react';

export const SubscriptionAlerts: React.FC = () => {
  const { toast } = useToast();
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  
  // Mock data for expiring subscriptions
  const expiringSubscriptions = [
    { id: 1, owner: 'John Smith', centerName: 'Tech Training Hub', plan: 'Premium', expiryDate: '2023-05-30', daysLeft: 3, notified: false },
    { id: 2, owner: 'Emily Davis', centerName: 'Data Science School', plan: 'Advanced', expiryDate: '2023-05-29', daysLeft: 2, notified: true },
    { id: 3, owner: 'Michael Brown', centerName: 'Code Masters Institute', plan: 'Premium', expiryDate: '2023-05-28', daysLeft: 1, notified: false },
    { id: 4, owner: 'Robert Wilson', centerName: 'Language Learning Center', plan: 'Basic', expiryDate: '2023-06-02', daysLeft: 6, notified: false },
    { id: 5, owner: 'Sarah Johnson', centerName: 'Digital Skills Academy', plan: 'Basic', expiryDate: '2023-06-01', daysLeft: 5, notified: true },
  ];

  const handleSendReminder = (index: number) => {
    setSendingIndex(index);
    
    // Simulate sending reminder
    setTimeout(() => {
      setSendingIndex(null);
      toast({
        title: "Reminder Sent",
        description: `Subscription renewal reminder sent to ${expiringSubscriptions[index].owner}.`,
      });
    }, 1500);
  };

  const handleSendAllReminders = () => {
    toast({
      title: "Sending All Reminders",
      description: "Subscription renewal reminders are being sent to all owners.",
    });
    
    // Simulate sending all reminders
    setTimeout(() => {
      toast({
        title: "Reminders Sent",
        description: "All subscription renewal reminders have been sent successfully.",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Subscription Expiry Alerts</CardTitle>
          <CardDescription>Notify center owners about upcoming subscription renewals</CardDescription>
        </div>
        <Button variant="outline" onClick={handleSendAllReminders} className="flex items-center">
          <Send className="h-4 w-4 mr-2" />
          Send All Reminders
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Training Center</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiringSubscriptions.map((subscription, index) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">{subscription.owner}</TableCell>
                <TableCell>{subscription.centerName}</TableCell>
                <TableCell>{subscription.plan}</TableCell>
                <TableCell>{new Date(subscription.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={subscription.daysLeft <= 3 ? "destructive" : "outline"}>
                    {subscription.daysLeft} {subscription.daysLeft === 1 ? "day" : "days"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subscription.notified ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span>Notified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span>Pending</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={subscription.notified || sendingIndex === index}
                    onClick={() => handleSendReminder(index)}
                  >
                    {sendingIndex === index ? "Sending..." : "Send Reminder"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
