/**
 * Supplier Profile — Company info, banking, contact.
 */
import { useState } from "react";
import { Building2, Mail, Phone, MapPin, CreditCard, FileText, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SUPPLIER_PROFILE } from "@/supplier/data/mockSupplierData";
import { PageShell } from "@/shared/components";

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState(SUPPLIER_PROFILE);
  const [editing, setEditing] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setProfile((prev) => ({
      ...prev,
      contactName: fd.get("contactName") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      address: fd.get("address") as string,
    }));
    setEditing(false);
    toast({ title: "Profil mis à jour" });
  };

  return (
    <PageShell title="Mon Profil" description={profile.companyName}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" /> Informations entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du contact</Label>
                  <Input name="contactName" defaultValue={profile.contactName} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={profile.email} required />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input name="phone" defaultValue={profile.phone} required />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input name="address" defaultValue={profile.address} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm"><Save className="h-3.5 w-3.5 mr-1" /> Enregistrer</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {profile.contactName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{profile.contactName}</p>
                    <p className="text-sm text-muted-foreground">{profile.companyName}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] bg-success/10 text-success border-success/30">
                      {profile.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.address}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Modifier</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banking & Tax */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" /> Informations bancaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">RIB / Compte bancaire</p>
                <p className="font-mono text-xs bg-muted/50 rounded-lg p-3">{profile.rib}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">NIF (Identifiant fiscal)</p>
                <p className="font-mono text-xs bg-muted/50 rounded-lg p-3">{profile.taxId}</p>
              </div>
            </div>
            <div className="pt-2 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone</span>
                <span className="font-medium">{profile.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Catégorie</span>
                <span className="font-medium">{profile.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Note</span>
                <span className="font-bold text-primary">{profile.rating}/5 ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
