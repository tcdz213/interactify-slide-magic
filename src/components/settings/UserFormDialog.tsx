import { useState, useEffect, forwardRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { warehouses, USER_ROLE_LABELS, GOVERNANCE_LABELS } from "@/data/mockData";
import type { User, UserRole, GovernancePermission } from "@/data/mockData";
import { Building2, Shield } from "lucide-react";

const ALL_ROLES: UserRole[] = [
  "CEO", "FinanceDirector", "OpsDirector", "RegionalManager", "WarehouseManager",
  "QCOfficer", "Supervisor", "Operator", "Driver", "Accountant", "BIAnalyst",
];

const ALL_GOVERNANCE: GovernancePermission[] = [
  "SYSTEM_ADMIN", "MANAGE_USERS", "MANAGE_ROLES", "SYSTEM_CONFIG", "AUDIT_LOG", "DATA_EXPORT", "EDITION_CONTROL",
];

const SCOPE_ROLES: UserRole[] = ["CEO", "FinanceDirector", "OpsDirector", "BIAnalyst", "Accountant"];

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (user: User) => void;
  existingIds: string[];
}

function generateId(existing: string[]) {
  let n = existing.length + 1;
  let id = `U${String(n).padStart(3, "0")}`;
  while (existing.includes(id)) {
    n++;
    id = `U${String(n).padStart(3, "0")}`;
  }
  return id;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const UserFormDialog = forwardRef<HTMLDivElement, UserFormDialogProps>(function UserFormDialog({ open, onOpenChange, user, onSave, existingIds }, ref) {
  const isEdit = !!user;

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("Operator");
  const [assignAll, setAssignAll] = useState(false);
  const [assignedWHs, setAssignedWHs] = useState<string[]>([]);
  const [approvalThreshold, setApprovalThreshold] = useState<string>("");
  const [accountabilityScope, setAccountabilityScope] = useState("");
  const [governance, setGovernance] = useState<GovernancePermission[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setAssignAll(user.assignedWarehouseIds === "all");
      setAssignedWHs(user.assignedWarehouseIds === "all" ? [] : user.assignedWarehouseIds);
      setApprovalThreshold(user.approvalThresholdPct !== null ? String(user.approvalThresholdPct) : "");
      setAccountabilityScope(user.accountabilityScope);
      setGovernance([...user.governancePermissions]);
    } else {
      setName("");
      setRole("Operator");
      setAssignAll(false);
      setAssignedWHs([]);
      setApprovalThreshold("");
      setAccountabilityScope("");
      setGovernance([]);
    }
  }, [user, open]);

  const toggleWH = (whId: string) => {
    setAssignedWHs((prev) =>
      prev.includes(whId) ? prev.filter((id) => id !== whId) : [...prev, whId]
    );
  };

  const toggleGov = (perm: GovernancePermission) => {
    setGovernance((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const isAllAccess = assignAll || SCOPE_ROLES.includes(role);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newUser: User = {
      id: user?.id ?? generateId(existingIds),
      name: name.trim(),
      role,
      roleLabel: USER_ROLE_LABELS[role],
      avatar: user?.avatar ?? getInitials(name),
      company: "Flow ERP",
      assignedWarehouseIds: isAllAccess ? "all" : assignedWHs,
      approvalThresholdPct: approvalThreshold ? Number(approvalThreshold) : null,
      canSelfApprove: false,
      accountabilityScope: accountabilityScope.trim(),
      governancePermissions: governance,
    };

    onSave(newUser);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={ref} className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Nom complet *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Rôle (Couche 1)</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{USER_ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Warehouse scope (Layer 2) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Périmètre entrepôts (Couche 2)
            </Label>
            {isAllAccess ? (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                Ce rôle a automatiquement accès à tous les entrepôts.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="assign-all"
                    checked={assignAll}
                    onCheckedChange={(c) => setAssignAll(!!c)}
                  />
                  <Label htmlFor="assign-all" className="text-sm font-normal">Accès à tous les entrepôts</Label>
                </div>
                {!assignAll && (
                  <div className="grid grid-cols-1 gap-1.5">
                    {warehouses.map((wh) => (
                      <div key={wh.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`wh-${wh.id}`}
                          checked={assignedWHs.includes(wh.id)}
                          onCheckedChange={() => toggleWH(wh.id)}
                        />
                        <Label htmlFor={`wh-${wh.id}`} className="text-sm font-normal">
                          {wh.name} — {wh.city}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Approval threshold */}
          <div className="space-y-1.5">
            <Label>Seuil d'approbation (%)</Label>
            <Input
              type="number"
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(e.target.value)}
              placeholder="Laisser vide si aucun"
              min={0}
              max={100}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">Variance max que cet utilisateur peut approuver. Vide = aucune autorité.</p>
          </div>

          {/* Accountability scope */}
          <div className="space-y-1.5">
            <Label>Périmètre de responsabilité</Label>
            <Input
              value={accountabilityScope}
              onChange={(e) => setAccountabilityScope(e.target.value)}
              placeholder="Description du périmètre..."
            />
          </div>

          <Separator />

          {/* Governance (Layer 3) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-500" />
              Gouvernance système (Couche 3)
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_GOVERNANCE.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <Checkbox
                    id={`gov-${perm}`}
                    checked={governance.includes(perm)}
                    onCheckedChange={() => toggleGov(perm)}
                  />
                  <Label htmlFor={`gov-${perm}`} className="text-xs font-normal">
                    {GOVERNANCE_LABELS[perm]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {isEdit ? "Enregistrer" : "Créer l'utilisateur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default UserFormDialog;
