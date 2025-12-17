import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { settingsApi } from '@/services/settingsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Bell, Shield, Palette, Eye, EyeOff } from 'lucide-react';
import type { 
  UserSettings, 
  UserProfile, 
  NotificationPreferences,
  TwoFactorSetup 
} from '@/types/settings';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London, UK' },
  { value: 'Europe/Paris', label: 'Paris, France' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
];

const DATE_FORMATS = [
  { value: 'YYYY-MM-DD', label: '2024-01-20' },
  { value: 'MM/DD/YYYY', label: '01/20/2024' },
  { value: 'DD/MM/YYYY', label: '20/01/2024' },
  { value: 'MMM DD, YYYY', label: 'Jan 20, 2024' },
  { value: 'DD MMM YYYY', label: '20 Jan 2024' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: () => settingsApi.getSettings(),
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => settingsApi.getProfile(),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => settingsApi.getNotificationPreferences(),
  });

  // Mutations
  const updateSettings = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast({ title: 'Settings updated', description: 'Your preferences have been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProfile = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateNotifications = useMutation({
    mutationFn: settingsApi.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast({ title: 'Notifications updated', description: 'Your notification preferences have been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const changePassword = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const isLoading = settingsLoading || profileLoading || notificationsLoading;

  return (
    <DashboardLayout title="Settings" description="Manage your account settings and preferences.">
      <div className="space-y-6">

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab 
                profile={profileData?.data} 
                onUpdate={(data) => updateProfile.mutate(data)}
                isLoading={updateProfile.isPending}
              />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesTab 
                settings={settingsData?.data} 
                onUpdate={(data) => updateSettings.mutate(data)}
                isLoading={updateSettings.isPending}
              />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab 
                preferences={notificationsData?.data} 
                onUpdate={(data) => updateNotifications.mutate(data)}
                isLoading={updateNotifications.isPending}
              />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab 
                onChangePassword={(data) => changePassword.mutate(data)}
                isLoading={changePassword.isPending}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

// Profile Tab Component
function ProfileTab({ 
  profile, 
  onUpdate, 
  isLoading 
}: { 
  profile?: UserProfile; 
  onUpdate: (data: Partial<UserProfile>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and profile picture.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="text-2xl">{formData.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Senior Developer"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Preferences Tab Component
function PreferencesTab({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings?: UserSettings; 
  onUpdate: (data: Partial<UserSettings>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    theme: settings?.theme || 'system',
    language: settings?.language || 'en',
    timezone: settings?.timezone || 'UTC',
    dateFormat: settings?.dateFormat || 'YYYY-MM-DD',
    weekStartsOn: settings?.weekStartsOn ?? 1,
    emailNotifications: settings?.emailNotifications ?? true,
    pushNotifications: settings?.pushNotifications ?? true,
    compactMode: settings?.compactMode ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your application experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setFormData(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={formData.dateFormat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map(fmt => (
                    <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week Starts On</Label>
              <Select
                value={String(formData.weekStartsOn)}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, weekStartsOn: Number(value) as 0 | 1 | 6 }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch
                checked={formData.pushNotifications}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Use a more compact UI layout</p>
              </div>
              <Switch
                checked={formData.compactMode}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, compactMode: checked }))
                }
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Notifications Tab Component
function NotificationsTab({ 
  preferences, 
  onUpdate, 
  isLoading 
}: { 
  preferences?: NotificationPreferences; 
  onUpdate: (data: Partial<NotificationPreferences>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<NotificationPreferences>({
    taskAssigned: preferences?.taskAssigned ?? true,
    taskCompleted: preferences?.taskCompleted ?? true,
    bugReported: preferences?.bugReported ?? true,
    bugResolved: preferences?.bugResolved ?? true,
    featureApproved: preferences?.featureApproved ?? true,
    releaseDeployed: preferences?.releaseDeployed ?? true,
    sprintStarted: preferences?.sprintStarted ?? true,
    sprintCompleted: preferences?.sprintCompleted ?? true,
    mentionedInComment: preferences?.mentionedInComment ?? true,
    weeklyDigest: preferences?.weeklyDigest ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const notificationItems = [
    { key: 'taskAssigned', label: 'Task Assigned', description: 'When a task is assigned to you' },
    { key: 'taskCompleted', label: 'Task Completed', description: 'When your task is marked complete' },
    { key: 'bugReported', label: 'Bug Reported', description: 'When a bug is reported on your product' },
    { key: 'bugResolved', label: 'Bug Resolved', description: 'When a bug is resolved' },
    { key: 'featureApproved', label: 'Feature Approved', description: 'When a feature is approved' },
    { key: 'releaseDeployed', label: 'Release Deployed', description: 'When a release is deployed' },
    { key: 'sprintStarted', label: 'Sprint Started', description: 'When a sprint starts' },
    { key: 'sprintCompleted', label: 'Sprint Completed', description: 'When a sprint completes' },
    { key: 'mentionedInComment', label: 'Mentioned', description: 'When you are mentioned in a comment' },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive weekly activity digest' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose which notifications you want to receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {notificationItems.map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={formData[item.key]}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Notifications
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Security Tab Component
function SecurityTab({ 
  onChangePassword, 
  isLoading 
}: { 
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => void;
  isLoading: boolean;
}) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onChangePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Min 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
          </p>
          <Button variant="outline">Enable 2FA</Button>
        </CardContent>
      </Card>
    </div>
  );
}
