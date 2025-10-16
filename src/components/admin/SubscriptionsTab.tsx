import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packageApi } from "@/services/packageApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Mail, 
  TrendingUp, 
  Download, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function SubscriptionsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [reminderUserId, setReminderUserId] = useState<string | null>(null);
  const [upgradeUserId, setUpgradeUserId] = useState<string | null>(null);
  const [selectedTargetPackage, setSelectedTargetPackage] = useState<string>("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const queryClient = useQueryClient();

  const { data: allSubscriptions, isLoading: loadingSubs } = useQuery({
    queryKey: ['admin-all-subscriptions'],
    queryFn: () => packageApi.getAllSubscriptions(1, 100),
  });

  const { data: packages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => packageApi.getAllPackages(),
  });

  const { data: usageStats } = useQuery({
    queryKey: ['plan-usage-stats'],
    queryFn: () => packageApi.getPlanUsageStats(),
  });

  const { data: revenueReport } = useQuery({
    queryKey: ['revenue-report', dateRange],
    queryFn: () => packageApi.getRevenueReport(dateRange.start, dateRange.end),
  });

  const { data: packageSubscribers, isLoading: loadingPackageSubs } = useQuery({
    queryKey: ['package-subscribers', selectedPackageId],
    queryFn: () => selectedPackageId ? packageApi.getSubscribersByPackage(selectedPackageId) : null,
    enabled: !!selectedPackageId,
  });

  const sendReminderMutation = useMutation({
    mutationFn: (userId: string) => {
      const subscription = allSubscriptions?.data.find(s => s.userId === userId);
      return packageApi.sendRenewalReminder(userId, subscription?.packageId || '');
    },
    onSuccess: () => {
      toast.success('Renewal reminder sent');
      setReminderUserId(null);
    },
    onError: () => toast.error('Failed to send reminder'),
  });

  const sendUpgradeMutation = useMutation({
    mutationFn: ({ userId, packageId }: { userId: string; packageId: string }) =>
      packageApi.sendUpgradeOffer(userId, packageId),
    onSuccess: () => {
      toast.success('Upgrade offer sent');
      setUpgradeUserId(null);
    },
    onError: () => toast.error('Failed to send upgrade offer'),
  });

  const handleExportBilling = async () => {
    try {
      const blob = await packageApi.exportBillingData(dateRange.start, dateRange.end);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Billing data exported');
    } catch (error) {
      toast.error('Failed to export billing data');
    }
  };

  const filteredSubscriptions = allSubscriptions?.data.filter(sub =>
    sub.userId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loadingSubs) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueReport?.totalRevenue?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.totalSubscribers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueReport?.monthlyRevenue?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueReport?.growthRate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.byTier?.map((tier: any) => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{tier.tier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {tier.count} subscribers ({tier.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <span className="font-medium">${tier.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredSubscriptions.map((sub: any) => (
              <Card key={sub.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="font-medium">{sub.userId}</div>
                    <div className="text-sm text-muted-foreground">
                      Plan: {sub.package?.name} • Status: 
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Period: {format(new Date(sub.currentPeriodStart), 'MMM dd, yyyy')} - 
                      {format(new Date(sub.currentPeriodEnd), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReminderUserId(sub.userId)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Remind
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUpgradeUserId(sub.userId)}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleExportBilling} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Billing Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueReport?.byPackage?.map((pkg: any) => (
                  <div key={pkg.packageId} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{pkg.packageName}</div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.subscriberCount} subscribers
                      </div>
                    </div>
                    <div className="text-lg font-bold">${pkg.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Reminder Dialog */}
      <Dialog open={!!reminderUserId} onOpenChange={() => setReminderUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Renewal Reminder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to send a renewal reminder to this user?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReminderUserId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => reminderUserId && sendReminderMutation.mutate(reminderUserId)}
              disabled={sendReminderMutation.isPending}
            >
              {sendReminderMutation.isPending ? <LoadingSpinner size="sm" /> : 'Send'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Upgrade Offer Dialog */}
      <Dialog open={!!upgradeUserId} onOpenChange={() => setUpgradeUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Upgrade Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Package</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedTargetPackage}
                onChange={(e) => setSelectedTargetPackage(e.target.value)}
              >
                <option value="">Select package...</option>
                {packages?.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ${pkg.price}/{pkg.interval}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpgradeUserId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => upgradeUserId && sendUpgradeMutation.mutate({ 
                  userId: upgradeUserId, 
                  packageId: selectedTargetPackage 
                })}
                disabled={sendUpgradeMutation.isPending || !selectedTargetPackage}
              >
                {sendUpgradeMutation.isPending ? <LoadingSpinner size="sm" /> : 'Send Offer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
