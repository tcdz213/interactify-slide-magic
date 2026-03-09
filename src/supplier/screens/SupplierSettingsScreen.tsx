import { useState } from "react";
import { Building2, Mail, Phone, MapPin, CreditCard, FileText, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { SUPPLIER_PROFILE } from "../data/mockSupplierData";
import { useSupplierAuth } from "../components/SupplierAuthGuard";
import { useNavigate } from "react-router-dom";

export default function SupplierSettingsScreen() {
  const { logout } = useSupplierAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...SUPPLIER_PROFILE });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, newPO: true, payment: true, quality: true });

  const handleSave = () => toast({ title: "Paramètres sauvegardés" });
  const handleLogout = () => { logout(); navigate("/supplier/login", { replace: true }); };

  return (
    <div className="p-4 space-y-4 pb-6">
      <h1 className="text-lg font-bold">Paramètres</h1>

      {/* Company Info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Entreprise</h2>
        <Field icon={Building2} label="Raison sociale" value={profile.companyName} onChange={(v) => setProfile({ ...profile, companyName: v })} />
        <Field icon={Mail} label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
        <Field icon={Phone} label="Téléphone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
        <Field icon={MapPin} label="Adresse" value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} />
      </div>

      {/* Banking */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" /> Coordonnées bancaires</h2>
        <Field icon={CreditCard} label="RIB" value={profile.rib} onChange={(v) => setProfile({ ...profile, rib: v })} />
        <Field icon={FileText} label="NIF" value={profile.taxId} onChange={(v) => setProfile({ ...profile, taxId: v })} />
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Préférences de notification</h2>
        <ToggleRow label="Notifications email" checked={notifPrefs.email} onChange={(v) => setNotifPrefs({ ...notifPrefs, email: v })} />
        <ToggleRow label="Notifications SMS" checked={notifPrefs.sms} onChange={(v) => setNotifPrefs({ ...notifPrefs, sms: v })} />
        <ToggleRow label="Nouvelles commandes" checked={notifPrefs.newPO} onChange={(v) => setNotifPrefs({ ...notifPrefs, newPO: v })} />
        <ToggleRow label="Paiements reçus" checked={notifPrefs.payment} onChange={(v) => setNotifPrefs({ ...notifPrefs, payment: v })} />
        <ToggleRow label="Réclamations qualité" checked={notifPrefs.quality} onChange={(v) => setNotifPrefs({ ...notifPrefs, quality: v })} />
      </div>

      <Button className="w-full gap-2" onClick={handleSave}>
        <Save className="h-4 w-4" /> Sauvegarder
      </Button>

      <Button variant="outline" className="w-full gap-2 text-destructive" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Se déconnecter
      </Button>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange }: { icon: React.ElementType; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        <Icon className="h-3 w-3" /> {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm" />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
