import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, PackageTier } from "@/types/package";
import { useAdminPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/use-package";
import { packageApi } from "@/services/packageApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Check, X, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { toast } from "sonner";

export const PackagesTab = () => {
  const { data: packages, isLoading } = useAdminPackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [schedulingPackage, setSchedulingPackage] = useState<Package | null>(null);
  const [scheduleData, setScheduleData] = useState({ activateAt: '', deactivateAt: '' });

  const [formData, setFormData] = useState({
    name: "",
    tier: "basic" as PackageTier,
    price: 0,
    currency: "USD",
    interval: "month" as "month" | "year",
    description: "",
    isActive: true,
    features: {
      maxCards: 1,
      maxBoosts: 0,
      canExploreCards: true,
      prioritySupport: false,
      verificationBadge: false,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      tier: "basic",
      price: 0,
      currency: "USD",
      interval: "month",
      description: "",
      isActive: true,
      features: {
        maxCards: 1,
        maxBoosts: 0,
        canExploreCards: true,
        prioritySupport: false,
        verificationBadge: false,
        advancedAnalytics: false,
        customBranding: false,
        apiAccess: false,
      },
    });
  };

  const handleCreate = async () => {
    await createPackage.mutateAsync(formData);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;
    await updatePackage.mutateAsync({ id: editingPackage.id, data: formData });
    setEditingPackage(null);
    resetForm();
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      tier: pkg.tier,
      price: pkg.price,
      currency: pkg.currency,
      interval: pkg.interval,
      description: pkg.description,
      isActive: pkg.isActive,
      features: pkg.features,
    });
  };

  const handleDelete = async () => {
    if (!deletingPackage) return;
    await deletePackage.mutateAsync(deletingPackage.id);
    setDeletingPackage(null);
  };

  const schedulePackageMutation = useMutation({
    mutationFn: ({ id, activateAt, deactivateAt }: { id: string; activateAt?: string; deactivateAt?: string }) =>
      packageApi.schedulePackage(id, activateAt, deactivateAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      toast.success('Package scheduled successfully');
      setSchedulingPackage(null);
      setScheduleData({ activateAt: '', deactivateAt: '' });
    },
    onError: () => toast.error('Failed to schedule package'),
  });

  const handleSchedule = async () => {
    if (!schedulingPackage) return;
    await schedulePackageMutation.mutateAsync({
      id: schedulingPackage.id,
      activateAt: scheduleData.activateAt || undefined,
      deactivateAt: scheduleData.deactivateAt || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="packages" className="space-y-6">
      <TabsList>
        <TabsTrigger value="packages">Packages</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions & Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="packages" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Package Management</h2>
            <p className="text-muted-foreground">Create and manage subscription packages</p>
          </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <PackageForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleCreate}
              isSubmitting={createPackage.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className={!pkg.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {pkg.name}
                    {!pkg.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </CardTitle>
                  <CardDescription className="capitalize">{pkg.tier} Plan</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSchedulingPackage(pkg);
                    setScheduleData({ 
                      activateAt: pkg.scheduledActivateAt || '', 
                      deactivateAt: pkg.scheduledDeactivateAt || '' 
                    });
                  }}>
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingPackage(pkg)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {pkg.price > 0 ? `${pkg.currency} ${pkg.price}` : "Free"}
                {pkg.price > 0 && <span className="text-sm text-muted-foreground">/{pkg.interval}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {pkg.features.maxCards} Cards
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {pkg.features.maxBoosts} Boosts/month
                  </li>
                  {pkg.features.prioritySupport && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Priority Support
                    </li>
                  )}
                  {pkg.features.verificationBadge && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Verification Badge
                    </li>
                  )}
                  {pkg.features.advancedAnalytics && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Advanced Analytics
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <PackageForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleUpdate}
            isSubmitting={updatePackage.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPackage?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!schedulingPackage} onOpenChange={(open) => !open && setSchedulingPackage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Package: {schedulingPackage?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activate At (Optional)</Label>
              <Input
                type="datetime-local"
                value={scheduleData.activateAt}
                onChange={(e) => setScheduleData({ ...scheduleData, activateAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Package will automatically become active at this time
              </p>
            </div>
            <div>
              <Label>Deactivate At (Optional)</Label>
              <Input
                type="datetime-local"
                value={scheduleData.deactivateAt}
                onChange={(e) => setScheduleData({ ...scheduleData, deactivateAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Package will automatically become inactive at this time
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSchedulingPackage(null)}>
                Cancel
              </Button>
              <Button onClick={handleSchedule} disabled={schedulePackageMutation.isPending}>
                {schedulePackageMutation.isPending ? <LoadingSpinner size="sm" /> : 'Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </TabsContent>

      <TabsContent value="subscriptions">
        <SubscriptionsTab />
      </TabsContent>
    </Tabs>
  );
};

interface PackageFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const PackageForm = ({ formData, setFormData, onSubmit, isSubmitting }: PackageFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Premium Plan"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tier">Tier</Label>
          <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interval">Billing</Label>
          <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Package description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxCards">Max Cards</Label>
          <Input
            id="maxCards"
            type="number"
            value={formData.features.maxCards}
            onChange={(e) => setFormData({ 
              ...formData, 
              features: { ...formData.features, maxCards: parseInt(e.target.value) } 
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxBoosts">Max Boosts/Month</Label>
          <Input
            id="maxBoosts"
            type="number"
            value={formData.features.maxBoosts}
            onChange={(e) => setFormData({ 
              ...formData, 
              features: { ...formData.features, maxBoosts: parseInt(e.target.value) } 
            })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Features</Label>
        {Object.entries(formData.features)
          .filter(([key]) => !['maxCards', 'maxBoosts'].includes(key))
          .map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="capitalize cursor-pointer">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Switch
                id={key}
                checked={value as boolean}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  features: { ...formData.features, [key]: checked }
                })}
              />
            </div>
          ))}
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive" className="cursor-pointer">Active Package</Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Package
        </Button>
      </div>
    </div>
  );
};
