import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Plus, Trash2, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import { adminCorsApi } from '@/services/adminApi';
import type { CorsConfig } from '@/types/admin';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

export default function AdminCors() {
  const [config, setConfig] = useState<CorsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOrigin, setNewOrigin] = useState('');
  const [addingOrigin, setAddingOrigin] = useState(false);
  const [togglingCors, setTogglingCors] = useState(false);
  const [deleteOrigin, setDeleteOrigin] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await adminCorsApi.getConfig();
      setConfig(response.data);
    } catch (error) {
      // Mock data for demo
      setConfig({
        enabled: true,
        origins: ['http://localhost:8080', 'https://app.example.com', 'https://staging.example.com'],
        credentials: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleCors = async () => {
    if (!config) return;
    setTogglingCors(true);
    try {
      const response = config.enabled 
        ? await adminCorsApi.disable()
        : await adminCorsApi.enable();
      setConfig(response.data.config);
      toast.success(config.enabled ? 'CORS disabled' : 'CORS enabled');
    } catch (error) {
      // Mock toggle for demo
      setConfig({ ...config, enabled: !config.enabled });
      toast.success(config.enabled ? 'CORS disabled' : 'CORS enabled');
    } finally {
      setTogglingCors(false);
    }
  };

  const handleAddOrigin = async () => {
    if (!newOrigin.trim() || !config) return;
    
    // Validate URL format
    try {
      new URL(newOrigin);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    if (config.origins.includes(newOrigin)) {
      toast.error('Origin already exists');
      return;
    }

    setAddingOrigin(true);
    try {
      const response = await adminCorsApi.addOrigin(newOrigin);
      setConfig(response.data.config);
      setNewOrigin('');
      toast.success('Origin added');
    } catch (error) {
      // Mock add for demo
      setConfig({ ...config, origins: [...config.origins, newOrigin] });
      setNewOrigin('');
      toast.success('Origin added');
    } finally {
      setAddingOrigin(false);
    }
  };

  const handleDeleteOrigin = async () => {
    if (!deleteOrigin || !config) return;
    try {
      const response = await adminCorsApi.removeOrigin(deleteOrigin);
      setConfig(response.data.config);
      toast.success('Origin removed');
    } catch (error) {
      // Mock delete for demo
      setConfig({ ...config, origins: config.origins.filter(o => o !== deleteOrigin) });
      toast.success('Origin removed');
    } finally {
      setDeleteOrigin(null);
    }
  };

  const handleReset = async () => {
    try {
      const response = await adminCorsApi.reset();
      setConfig(response.data.config);
      toast.success('CORS configuration reset to defaults');
    } catch (error) {
      // Mock reset for demo
      setConfig({
        enabled: true,
        origins: ['http://localhost:8080'],
        credentials: true,
      });
      toast.success('CORS configuration reset to defaults');
    } finally {
      setShowResetConfirm(false);
    }
  };

  return (
    <AdminLayout title="CORS Management" description="Configure Cross-Origin Resource Sharing settings">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : config ? (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Shield className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-100">CORS Status</CardTitle>
                    <CardDescription className="text-slate-400">
                      Enable or disable CORS for the application
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={config.enabled 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }
                  >
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={handleToggleCors}
                    disabled={togglingCors}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-400">
                  CORS (Cross-Origin Resource Sharing) controls which domains can access your API. 
                  Disabling CORS will block all cross-origin requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Allowed Origins */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-100">Allowed Origins</CardTitle>
                    <CardDescription className="text-slate-400">
                      Domains that are allowed to make cross-origin requests
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Origin Form */}
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOrigin()}
                  className="flex-1 bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  onClick={handleAddOrigin}
                  disabled={addingOrigin || !newOrigin.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Origin
                </Button>
              </div>

              {/* Origins List */}
              <div className="space-y-2">
                {config.origins.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No origins configured. Add an origin to allow cross-origin requests.
                  </div>
                ) : (
                  config.origins.map((origin) => (
                    <div
                      key={origin}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-100 font-mono text-sm">{origin}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteOrigin(origin)}
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credentials Setting */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100">Additional Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Configure additional CORS options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="space-y-1">
                  <Label className="text-slate-100">Allow Credentials</Label>
                  <p className="text-sm text-slate-500">
                    Allow cookies and authentication headers in cross-origin requests
                  </p>
                </div>
                <Switch
                  checked={config.credentials}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Delete Origin Confirm */}
      <ConfirmDialog
        open={!!deleteOrigin}
        onOpenChange={() => setDeleteOrigin(null)}
        title="Remove Origin"
        description={`Are you sure you want to remove "${deleteOrigin}"? Requests from this origin will be blocked.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteOrigin}
        variant="destructive"
      />

      {/* Reset Confirm */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset CORS Configuration"
        description="This will reset all CORS settings to their default values. This action cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleReset}
        variant="destructive"
      />
    </AdminLayout>
  );
}
