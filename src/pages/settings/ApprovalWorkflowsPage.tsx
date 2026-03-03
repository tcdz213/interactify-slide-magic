import { useState } from "react";
import { ShieldCheck, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type DocumentType = "GRN" | "PurchaseOrder" | "SalesOrder" | "StockAdjustment" | "StockTransfer" | "CycleCount" | "Invoice" | "Payment" | "Return";

interface ApprovalStep {
  id: string;
  role: string;
  conditionField: "value" | "variance" | "always";
  conditionOperator: ">" | "<" | ">=" | "<=" | "=";
  conditionValue: number;
}

interface WorkflowConfig {
  documentType: DocumentType;
  label: string;
  enabled: boolean;
  autoApproveBelow: number;
  requireDualApproval: boolean;
  steps: ApprovalStep[];
}

const DOC_LABELS: Record<DocumentType, string> = {
  GRN: "Bon de Réception (GRN)",
  PurchaseOrder: "Bon de Commande (PO)",
  SalesOrder: "Commande Client",
  StockAdjustment: "Ajustement de Stock",
  StockTransfer: "Transfert de Stock",
  CycleCount: "Comptage Cyclique",
  Invoice: "Facture",
  Payment: "Paiement",
  Return: "Retour (RMA)",
};

const ROLES = ["WarehouseManager", "RegionalManager", "OpsDirector", "FinanceDirector", "CEO"];

const initialWorkflows: WorkflowConfig[] = [
  {
    documentType: "GRN", label: DOC_LABELS.GRN, enabled: true, autoApproveBelow: 100000, requireDualApproval: false,
    steps: [
      { id: "1", role: "WarehouseManager", conditionField: "value", conditionOperator: "<=", conditionValue: 500000 },
      { id: "2", role: "OpsDirector", conditionField: "value", conditionOperator: ">", conditionValue: 500000 },
    ],
  },
  {
    documentType: "PurchaseOrder", label: DOC_LABELS.PurchaseOrder, enabled: true, autoApproveBelow: 50000, requireDualApproval: true,
    steps: [
      { id: "1", role: "OpsDirector", conditionField: "value", conditionOperator: "<=", conditionValue: 2000000 },
      { id: "2", role: "CEO", conditionField: "value", conditionOperator: ">", conditionValue: 2000000 },
    ],
  },
  {
    documentType: "StockAdjustment", label: DOC_LABELS.StockAdjustment, enabled: true, autoApproveBelow: 0, requireDualApproval: false,
    steps: [
      { id: "1", role: "WarehouseManager", conditionField: "variance", conditionOperator: "<=", conditionValue: 2 },
      { id: "2", role: "FinanceDirector", conditionField: "variance", conditionOperator: "<=", conditionValue: 5 },
      { id: "3", role: "CEO", conditionField: "variance", conditionOperator: ">", conditionValue: 5 },
    ],
  },
  {
    documentType: "SalesOrder", label: DOC_LABELS.SalesOrder, enabled: true, autoApproveBelow: 200000, requireDualApproval: false,
    steps: [
      { id: "1", role: "RegionalManager", conditionField: "value", conditionOperator: "<=", conditionValue: 1000000 },
      { id: "2", role: "OpsDirector", conditionField: "value", conditionOperator: ">", conditionValue: 1000000 },
    ],
  },
  {
    documentType: "Invoice", label: DOC_LABELS.Invoice, enabled: true, autoApproveBelow: 0, requireDualApproval: false,
    steps: [
      { id: "1", role: "FinanceDirector", conditionField: "always", conditionOperator: ">=", conditionValue: 0 },
    ],
  },
  {
    documentType: "Return", label: DOC_LABELS.Return, enabled: true, autoApproveBelow: 5000, requireDualApproval: false,
    steps: [
      { id: "1", role: "WarehouseManager", conditionField: "value", conditionOperator: "<=", conditionValue: 50000 },
      { id: "2", role: "OpsDirector", conditionField: "value", conditionOperator: ">", conditionValue: 50000 },
    ],
  },
];

export default function ApprovalWorkflowsPage() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>(initialWorkflows);
  const [expandedDoc, setExpandedDoc] = useState<DocumentType | null>(null);

  const updateWorkflow = (docType: DocumentType, updates: Partial<WorkflowConfig>) => {
    setWorkflows((prev) => prev.map((w) => (w.documentType === docType ? { ...w, ...updates } : w)));
  };

  const addStep = (docType: DocumentType) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.documentType !== docType) return w;
        const newId = String(w.steps.length + 1);
        return { ...w, steps: [...w.steps, { id: newId, role: "WarehouseManager", conditionField: "always" as const, conditionOperator: ">=" as const, conditionValue: 0 }] };
      })
    );
  };

  const removeStep = (docType: DocumentType, stepId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.documentType === docType ? { ...w, steps: w.steps.filter((s) => s.id !== stepId) } : w))
    );
  };

  const updateStep = (docType: DocumentType, stepId: string, updates: Partial<ApprovalStep>) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.documentType === docType
          ? { ...w, steps: w.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)) }
          : w
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Workflows enregistrés", description: "Les circuits d'approbation ont été mis à jour." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Workflows d'Approbation</h1>
            <p className="text-sm text-muted-foreground">Configurer les circuits d'approbation par type de document</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          {saved ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          {saved ? "Enregistré ✓" : "Enregistrer"}
        </Button>
      </div>

      <div className="space-y-3">
        {workflows.map((wf) => {
          const isExpanded = expandedDoc === wf.documentType;
          return (
            <Card key={wf.documentType} className={wf.enabled ? "" : "opacity-60"}>
              <CardHeader
                className="cursor-pointer pb-3"
                onClick={() => setExpandedDoc(isExpanded ? null : wf.documentType)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {wf.label}
                    <span className="text-[10px] font-mono text-muted-foreground">({wf.steps.length} étapes)</span>
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={wf.enabled}
                      onCheckedChange={(v) => updateWorkflow(wf.documentType, { enabled: v })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Auto-approbation si valeur inférieure à (DZD)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={wf.autoApproveBelow}
                        onChange={(e) => updateWorkflow(wf.documentType, { autoApproveBelow: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <Switch
                        checked={wf.requireDualApproval}
                        onCheckedChange={(v) => updateWorkflow(wf.documentType, { requireDualApproval: v })}
                      />
                      <Label className="text-xs">Double approbation requise</Label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold">Étapes d'approbation</Label>
                      <Button variant="outline" size="xs" onClick={() => addStep(wf.documentType)}>
                        <Plus className="h-3 w-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {wf.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2">
                          <span className="text-xs font-bold text-muted-foreground w-6">{idx + 1}.</span>
                          <Select value={step.role} onValueChange={(v) => updateStep(wf.documentType, step.id, { role: v })}>
                            <SelectTrigger className="h-8 text-xs w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">si</span>
                          <Select
                            value={step.conditionField}
                            onValueChange={(v) => updateStep(wf.documentType, step.id, { conditionField: v as ApprovalStep["conditionField"] })}
                          >
                            <SelectTrigger className="h-8 text-xs w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="value">Valeur</SelectItem>
                              <SelectItem value="variance">Variance %</SelectItem>
                              <SelectItem value="always">Toujours</SelectItem>
                            </SelectContent>
                          </Select>
                          {step.conditionField !== "always" && (
                            <>
                              <Select
                                value={step.conditionOperator}
                                onValueChange={(v) => updateStep(wf.documentType, step.id, { conditionOperator: v as ApprovalStep["conditionOperator"] })}
                              >
                                <SelectTrigger className="h-8 text-xs w-16">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[">", "<", ">=", "<=", "="].map((op) => (
                                    <SelectItem key={op} value={op}>{op}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                className="h-8 text-xs w-24"
                                value={step.conditionValue}
                                onChange={(e) => updateStep(wf.documentType, step.id, { conditionValue: Number(e.target.value) || 0 })}
                              />
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-auto"
                            onClick={() => removeStep(wf.documentType, step.id)}
                            disabled={wf.steps.length <= 1}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
