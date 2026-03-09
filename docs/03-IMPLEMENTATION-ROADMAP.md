# 🛠️ Plan d'Implémentation v3.0 — Multi-WMS Natif

> **Durée estimée** : 4-6 semaines
> **Équipe** : 2-3 développeurs React/TypeScript
> **Approche** : Agile 2-week sprints
> **Risque** : MOYEN (refactor majeur mais prévisible)

---

## 📋 Phase 0 — Préparation & Planning (1 semaine)

### Semaine 1: Analyse & Design

#### 1.1 Audit Code Existant
```bash
# Exécuter:
- Lines of code: wc -l src/**/*.tsx
- Component count: find src/components -name "*.tsx" | wc -l
- Routes count: grep -r "Route path=" src/app/routes/
- Tests: find src --name "*.test.*" | wc -l
- Data models: grep -r "interface.*{" src/lib/types.ts

# Expected output:
# ~15K LOC, ~80 components, ~25 routes, ~50 tests
```

#### 1.2 Mapping Instance → Routes

```typescript
// Créer matrix:
type InstanceMapping = {
  "alger-construction": {
    url: "/alger/",
    layoutId: "warehouse-layout",
    features: ["stock", "po", "shipping", "picking"]
  },
  "condor": {
    url: "/condor/",
    layoutId: "supplier-warehouse-layout", // 🆕
    features: ["stock", "po", "shipping", "picking", "incoming-po"] // 🆕
  }
}
```

#### 1.3 Créer Documentation Design

Fichiers à créer:
- `ARCHITECTURE_v3.0.md` ← Vue d'ensemble technique
- `MIGRATION_GUIDE.md` ← Comment migrer v2→v3
- `DB_SCHEMA_v3.0.sql` ← Schema si futur backend
- `API_ENDPOINTS_v3.0.md` ← Endpoints futurs

---

## 🏗️ Phase 1 — Infrastructure de Base (1 semaine)

### Semaine 2: Setup WMS Instance Layer

#### 1.1 Créer Model `WMSInstance`

**Fichier:** `src/wms/core/types/wms-instance.ts`

```typescript
export interface WMSInstance {
  // Identifiants
  id: string;                        // "alger-construction", "condor"
  name: string;                      // "Entrepôt Alger Construction"
  code: string;                       // "ALGER", "COND"
  
  // Métadonnées
  type: "warehouse" | "supplier";
  tenantId: string;                  // "T-ENT-01"
  status: "active" | "trial" | "suspended";
  
  // Configuration
  config: {
    language: "fr" | "en" | "ar";
    timezone: "Africa/Algiers";
    currency: "DZD";
    country: "DZ";
  };
  
  // Relations
  warehouseIds: string[];            // IDs entrepôts physiques
  staffCount: number;
  
  // URLs & Routing
  baseUrl: string;                   // "/alger/" ou "/condor/"
  layoutId: string;                  // Template layout
  
  // Métadonnées abonnement
  subscriptionPlan: "standard" | "pro" | "enterprise" | "trial";
  createdAt: Date;
  updatedAt: Date;
}

// Helper
export function getWMSRoute(instance: WMSInstance, path: string): string {
  return `${instance.baseUrl}${path}`;
}
```

#### 1.2 Créer `InstanceContext`

**Fichier:** `src/contexts/InstanceContext.tsx`

```typescript
import React, { createContext, useContext } from "react";
import { WMSInstance } from "../wms/core/types/wms-instance";

interface InstanceContextType {
  instance: WMSInstance | null;
  instanceId: string;
  isMultiInstance: boolean; // Can user switch instances?
  availableInstances: WMSInstance[]; // All instances user can access
  
  switchInstance: (instanceId: string) => Promise<void>;
  getCurrentScope: () => { instanceId: string; tenantId: string };
}

export const InstanceContext = createContext<InstanceContextType | undefined>(undefined);

export function useInstance() {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error("useInstance must be used within InstanceProvider");
  }
  return context;
}

export function InstanceProvider({ children }) {
  // Implementation
}
```

#### 1.3 Modifier `AuthContext`

**Fichier:** `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  // Existant
  user: User;
  isAuthenticated: boolean;
  
  // 🆕 Multi-WMS
  wmsInstanceId: string;           // Instance active
  wmsInstance: WMSInstance | null; // Données instance
  availableInstances: WMSInstance[]; // Instances accessibles
  
  // 🆕 Helper
  canAccessInstance: (instanceId: string) => boolean;
  getCurrentScope: () => { wmsInstanceId: string; tenantId: string };
}

// Dans le provider:
function AuthProvider({ children }) {
  // Au login:
  const [user, setUser] = useState<User | null>(null);
  const [wmsInstanceId, setWmsInstanceId] = useState<string>("");
  
  const login = async (pin: string) => {
    const user = await authenticateUser(pin);
    
    // 🆕 Détecter les instances accessibles
    const instances = await fetchUserWMSInstances(user.id);
    const defaultInstance = instances[0]; // Ou basé sur dernière session
    
    setUser(user);
    setWmsInstanceId(defaultInstance.id);
    // ... rest
  };
}
```

#### 1.4 Adapter `WMSDataContext`

**Fichier:** `src/contexts/WMSDataContext.tsx`

```typescript
interface WMSDataContextType {
  // Données filtrées par instance + tenant
  data: {
    products: Product[];
    purchaseOrders: PO[];
    salesOrders: SalesOrder[];
    stock: StockLevel[];
    // ...
  };
  
  // Scope actuel
  scope: {
    wmsInstanceId: string;
    tenantId: string;
    warehouseId?: string;
  };
  
  // Opérations toujours scopées
  createPO: (po: Partial<PO>) => Promise<PO>; // Auto-set scope
  updateStock: (level: StockLevel) => Promise<void>;
  // ...
}

// Dans provider:
function WMSDataProvider({ children }) {
  const { wmsInstanceId } = useAuth();
  const [data, setData] = useState({});
  
  useEffect(() => {
    // 🆕 Charger données filtrées par instance
    async function loadData() {
      const filtered = await mockData.filterByScope({
        wmsInstanceId,
        tenantId: user.tenantId
      });
      setData(filtered);
    }
    loadData();
  }, [wmsInstanceId]);
  
  // Toutes les opérations incluent automatiquement wmsInstanceId
  const createPO = async (poData) => {
    return {
      ...poData,
      wmsInstanceId, // 🆕 Auto-set
      tenantId: user.tenantId // Auto-set
    };
  };
}
```

---

## 🎯 Phase 2 — Routing Multi-Instance (1-2 semaines)

### Semaine 3: Refactoriser Routes

#### 2.1 Routes Génériques

**Fichier:** `src/app/routes/wmsInstanceRoutes.tsx`

```typescript
import { lazy } from "react";

// Template route pour tout WMS instance
export function createWMSInstanceRoutes(instance: WMSInstance) {
  return {
    path: instance.baseUrl,
    element: <WMSInstanceLayout instance={instance} />,
    children: [
      {
        index: true,
        element: <Dashboard />, // Component partagé
      },
      {
        path: "products",
        element: <ProductListPage />,
      },
      {
        path: "stock-dashboard",
        element: <StockDashboard />,
      },
      {
        path: "purchase-orders",
        element: <PurchaseOrderListPage />,
      },
      // 🆕 Features spécifiques fournisseur
      instance.type === "supplier" && {
        path: "incoming-pos", // NOUVEAU
        element: <IncomingPOListPage />,
      },
      // ... rest
    ].filter(Boolean),
  };
}
```

#### 2.2 Main Router Setup

**Fichier:** `src/app/App.tsx`

```typescript
import { Routes, Route } from "react-router-dom";
import { createWMSInstanceRoutes } from "./routes/wmsInstanceRoutes";

export function App() {
  const { isAuthenticated, availableInstances } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          {/* Owner portail */}
          <Route path="/owner/*" element={<OwnerDashboard />} />
          
          {/* 🆕 Dynamically generate WMS routes */}
          {availableInstances.map((instance) => 
            <Route
              key={instance.id}
              {...createWMSInstanceRoutes(instance)}
            />
          )}
          
          {/* Mobile apps */}
          <Route path="/mobile/*" element={<MobileCommercialApp />} />
          <Route path="/delivery/*" element={<DeliveryApp />} />
        </>
      )}
      
      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

#### 2.3 Nested Routes per Instance

**Fichier:** `src/app/routes/instanceNestedRoutes.tsx`

```typescript
// Route structure per instance:
// /alger/
// /alger/dashboard
// /alger/products
// /alger/purchase-orders
// /alger/purchase-orders/PO-0100
// /alger/picking
// /alger/shipping
// /alger/stock
// /alger/accounting
// /alger/settings

// /condor/ (same + incoming)
// /condor/dashboard
// /condor/products
// /condor/incoming-pos        🆕
// /condor/incoming-pos/PO-0100 🆕
// /condor/purchase-orders
// /condor/picking
// /condor/shipping
// /condor/stock
// /condor/accounting
// /condor/settings
```

---

## 📦 Phase 3 — Features Incoming POs (1-2 semaines)

### Semaine 4-5: Implémenter Incoming POsOnly for Suppliers

#### 3.1 Types & Models

**Fichier:** `src/features/incoming-pos/types/incoming-po.ts`

```typescript
export interface IncomingPO {
  id: string;                    // "PO-0100"
  sourceWmsInstanceId: string;   // "alger-construction"
  destinationWmsInstanceId: string; // "condor"
  
  // Données PO
  poId: string;                  // ID in source WMS
  status: "pending" | "confirmed_by_supplier" | "in_transit" | "delivered" 
         | "refused" | "awaiting_approval" | "negotiating";
  
  // Contenu
  items: POItem[];
  totalHT: number;
  totalTTC: number;
  
  // Dates
  createdAt: Date;
  requiredBy: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
  
  // Supplier response
  supplierResponse?: {
    type: "confirm" | "refuse" | "counter_propose";
    message: string;
    countProposal?: POCounterProposal;
  };
  
  // Audit
  sourceWmsData: {
    clientId: string;
    clientName: string;
    contactEmail: string;
    deliveryAddress: string;
  };
}

export interface POCounterProposal {
  originalQuantity: number;
  proposedQuantity: number;
  deliveryDate1: Date;
  deliveryDate2?: Date;
  message: string;
}
```

#### 3.2 Components

**Fichier:** `src/features/incoming-pos/IncomingPOList.tsx`

```typescript
export function IncomingPOListPage() {
  const { wmsInstanceId } = useAuth();
  const { data: incomingPOs } = usePOData(wmsInstanceId);
  
  const [filter, setFilter] = useState({ status: "all" });
  
  const filtered = incomingPOs.filter(po => {
    if (filter.status === "all") return true;
    return po.status === filter.status;
  });
  
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">PO Reçues</h1>
        <p className="text-gray-600">Gérez les commandes reçues de vos clients</p>
      </header>
      
      <FilterBar
        status={filter.status}
        onChange={(s) => setFilter({ status: s })}
      />
      
      <POTable
        pos={filtered}
        onRowClick={(po) => navigate(`/condor/incoming-pos/${po.id}`)}
      />
    </div>
  );
}
```

**Fichier:** `src/features/incoming-pos/IncomingPODetail.tsx`

```typescript
export function IncomingPODetailPage({ poId }: { poId: string }) {
  const { wmsInstanceId } = useAuth();
  const [po, setPO] = useState<IncomingPO | null>(null);
  const [actionMode, setActionMode] = useState<"view" | "confirm" | "refuse" | "modify">("view");
  
  return (
    <div className="p-6">
      <PODetailHeader po={po} />
      
      <section className="grid grid-cols-2 gap-6 mt-6">
        <PODetailSection po={po} />
        <StockCheckSection po={po} wmsId={wmsInstanceId} /> {/* 🆕 */}
      </section>
      
      {actionMode === "view" && (
        <ActionButtons
          onConfirm={() => setActionMode("confirm")}
          onRefuse={() => setActionMode("refuse")}
          onModify={() => setActionMode("modify")}
        />
      )}
      
      {actionMode === "confirm" && (
        <ConfirmPOPanel
          po={po}
          onSubmit={(data) => submitConfirmation(po.id, data)}
        />
      )}
      
      {actionMode === "refuse" && (
        <RefusePOPanel
          po={po}
          onSubmit={(data) => submitRefusal(po.id, data)}
        />
      )}
      
      {actionMode === "modify" && (
        <ModifyPOPanel
          po={po}
          onSubmit={(data) => submitModification(po.id, data)}
        />
      )}
    </div>
  );
}
```

#### 3.3 Business Logic

**Fichier:** `src/wms/core/PORouter.ts`

```typescript
export class PORouter {
  // Route PO vers le bon WMS
  async routePO(po: PO): Promise<void> {
    const destinationInstance = await getWMSInstance(po.destinationWmsId);
    
    // Créer IncomingPO dans instance de destination
    const incomingPO: IncomingPO = {
      id: po.id,
      sourceWmsInstanceId: po.sourceWmsInstanceId,
      destinationWmsInstanceId: po.destinationWmsInstanceId,
      poId: po.id,
      status: "pending",
      items: po.items,
      totalHT: po.totalHT,
      totalTTC: po.totalTTC,
      createdAt: new Date(),
      requiredBy: po.requiredByDate,
      sourceWmsData: {
        clientId: po.clientId,
        clientName: po.clientName,
        contactEmail: po.contactEmail,
        deliveryAddress: po.deliveryAddress,
      },
    };
    
    // Stocker dans destination WMS
    await mockData.addIncomingPO(incomingPO, destinationInstance.id);
    
    // Notifier destination
    await notificationBus.emit("po.incoming", {
      wmsInstanceId: destinationInstance.id,
      po: incomingPO,
    });
  }
  
  // Supplier confirme PO
  async confirmPO(
    incomingPOId: string, 
    supplierWmsId: string, 
    response: ConfirmationData
  ): Promise<void> {
    // Mettre à jour statut dans destination WMS
    await mockData.updateIncomingPO(incomingPOId, {
      status: "confirmed_by_supplier",
      confirmedAt: new Date(),
      supplierResponse: {
        type: "confirm",
        message: response.notes,
      },
    });
    
    // Créer picking task dans supplier WMS
    await createPickingTask(supplierWmsId, incomingPOId);
    
    // Notifier source WMS
    const incomingPO = await mockData.getIncomingPO(incomingPOId);
    await notificationBus.emit("po.confirmed_by_supplier", {
      wmsInstanceId: incomingPO.sourceWmsInstanceId,
      po: incomingPO,
    });
  }
  
  // Supplier refuse PO
  async refusePO(
    incomingPOId: string, 
    supplierWmsId: string, 
    response: RefusalData
  ): Promise<void> {
    await mockData.updateIncomingPO(incomingPOId, {
      status: "refused",
      supplierResponse: {
        type: "refuse",
        message: response.reason,
      },
    });
    
    // Notifier source
    const incomingPO = await mockData.getIncomingPO(incomingPOId);
    await notificationBus.emit("po.refused_by_supplier", {
      wmsInstanceId: incomingPO.sourceWmsInstanceId,
      po: incomingPO,
      alternatives: response.suggestedAlternatives,
    });
  }
  
  // Supplier contre-propose
  async counterProposePO(
    incomingPOId: string, 
    supplierWmsId: string, 
    proposal: CounterProposal
  ): Promise<void> {
    await mockData.updateIncomingPO(incomingPOId, {
      status: "awaiting_customer_approval",
      supplierResponse: {
        type: "counter_propose",
        message: proposal.message,
        countProposal: {
          originalQuantity: proposal.originalQty,
          proposedQuantity: proposal.proposedQty,
          deliveryDate1: proposal.date1,
          deliveryDate2: proposal.date2,
          message: proposal.message,
        },
      },
    });
    
    // Notifier source
    const incomingPO = await mockData.getIncomingPO(incomingPOId);
    await notificationBus.emit("po.counter_proposal", {
      wmsInstanceId: incomingPO.sourceWmsInstanceId,
      po: incomingPO,
      proposal,
    });
  }
}
```

#### 3.4 POSearchEngine

**Fichier:** `src/wms/cross-wms/POSearchEngine.ts`

```typescript
export class POSearchEngine {
  // Supplier voit toutes les PO le concernant
  async searchIncomingPOs(
    supplierWmsId: string
  ): Promise<IncomingPO[]> {
    return mockData.query<IncomingPO>({
      destinationWmsInstanceId: supplierWmsId,
    });
  }
  
  // Dashboard widget "combien j'ai de PO en attente"
  async getPOStats(supplierWmsId: string) {
    const pos = await this.searchIncomingPOs(supplierWmsId);
    
    return {
      total: pos.length,
      pending: pos.filter(p => p.status === "pending").length,
      confirmed: pos.filter(p => p.status === "confirmed_by_supplier").length,
      negotiating: pos.filter(p => p.status === "awaiting_customer_approval").length,
      refused: pos.filter(p => p.status === "refused").length,
    };
  }
  
  // Chercher PO d'un client spécifique
  async searchPOFromClient(
    supplierWmsId: string,
    clientWmsId: string
  ): Promise<IncomingPO[]> {
    return mockData.query<IncomingPO>({
      destinationWmsInstanceId: supplierWmsId,
      sourceWmsInstanceId: clientWmsId,
    });
  }
}
```

---

## 💾 Phase 4 — Data & Storage (1 semaine)

### Semaine 6: Adapter Couche Données

#### 4.1 Adapter `mockData.ts`

**Fichier:** `src/data/mockData.ts`

```typescript
// 🆕 Structure par WMS instance
const mockDataByInstance = {
  "alger-construction": {
    products: [...],
    purchaseOrders: [...],
    salesOrders: [...],
    incomingPOs: [], // 🆕
    stock: [...],
    users: [...],
  },
  "condor": {
    products: [...],
    purchaseOrders: [...], // PO qu'il émet
    salesOrders: [...],    // Commandes reçues (= PO entrantes)
    incomingPOs: [...],    // PO reçues 🆕
    stock: [...],
    users: [...],
  },
  // ...
};

// Helper: Filter by scope
export function filterByScope(
  scope: { wmsInstanceId: string; tenantId: string }
): WMSData {
  const data = mockDataByInstance[scope.wmsInstanceId];
  
  return {
    products: data.products.filter(p => p.tenantId === scope.tenantId),
    purchaseOrders: data.purchaseOrders.filter(po => po.tenantId === scope.tenantId),
    // ... rest
  };
}

// 🆕 Incoming POs
export function getIncomingPOs(
  wmsInstanceId: string,
  tenantId: string
): IncomingPO[] {
  return (
    mockDataByInstance[wmsInstanceId]?.incomingPOs || []
  ).filter(po => po.destinationWmsInstanceId === wmsInstanceId);
}

export function updateIncomingPO(
  poId: string,
  updates: Partial<IncomingPO>
): void {
  const data = Object.values(mockDataByInstance).flatMap(i => i.incomingPOs);
  const po = data.find(p => p.id === poId);
  if (po) {
    Object.assign(po, { ...updates, updatedAt: new Date() });
  }
}
```

#### 4.2 IndexedDB Structure (Futur)

```sql
-- Tables multi-tenant
CREATE TABLE wms_instances (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- 'warehouse' | 'supplier'
  tenant_id UUID REFERENCES tenants(id),
  base_url VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE incoming_pos (
  id VARCHAR(50) PRIMARY KEY,
  wms_instance_id UUID REFERENCES wms_instances(id),
  source_wms_instance_id UUID REFERENCES wms_instances(id),
  status VARCHAR(50),
  total_ht DECIMAL,
  total_ttc DECIMAL,
  created_at TIMESTAMP,
  required_by TIMESTAMP,
  
  -- Isolation multitenante
  UNIQUE(id, wms_instance_id)
);

CREATE TABLE incoming_po_items (
  id UUID PRIMARY KEY,
  incoming_po_id VARCHAR(50) REFERENCES incoming_pos(id),
  product_id VARCHAR(50),
  quantity DECIMAL,
  unit_price DECIMAL,
  wms_instance_id UUID REFERENCES wms_instances(id)
);

-- Index pour performance
CREATE INDEX idx_incoming_po_destination ON incoming_pos(wms_instance_id, status);
CREATE INDEX idx_incoming_po_source ON incoming_pos(source_wms_instance_id);
```

---

## ✅ Phase 5 — Testing (1 semaine)

### Semaine 7: Tests Multi-WMS

#### 5.1 Test Isolation

**Fichier:** `src/wms/core/__tests__/multi-wms-isolation.test.ts`

```typescript
describe("Multi-WMS Isolation", () => {
  it("should isolate data between instances", () => {
    const algerData = filterByScope({
      wmsInstanceId: "alger-construction",
      tenantId: "T-ENT-01",
    });
    
    const condorData = filterByScope({
      wmsInstanceId: "condor",
      tenantId: "T-FRN-01",
    });
    
    // Alger ne voit PAS les produits Condor
    const algerProducts = algerData.products.map(p => p.id);
    const condorProducts = condorData.products.map(p => p.id);
    
    expect(intersection(algerProducts, condorProducts)).toHaveLength(0);
  });
  
  it("should not allow cross-WMS access", () => {
    const user = { wmsInstanceId: "condor", tenantId: "T-FRN-01" };
    
    // User Condor tente accéder Alger stock
    expect(() => {
      filterByScope({
        wmsInstanceId: "alger-construction",
        tenantId: "T-ENT-01",
      });
    }).toThrow("Access denied");
  });
});
```

#### 5.2 Test Incoming POs

**Fichier:** `src/features/incoming-pos/__tests__/incoming-po.test.ts`

```typescript
describe("Incoming POs", () => {
  it("should create incoming PO when source WMS creates PO", async () => {
    // Alger crée PO vers Condor
    const po = await createPO({
      sourceWmsId: "alger-construction",
      destinationWmsId: "condor",
      items: [{ productId: "cement", qty: 500 }],
    });
    
    // Condor voit la PO entrante
    const condorIncoming = getIncomingPOs("condor", "T-FRN-01");
    expect(condorIncoming).toContainEqual(expect.objectContaining({
      id: po.id,
      status: "pending",
    }));
  });
  
  it("should confirm PO and create picking task", async () => {
    const po = await createPO({...});
    
    // Condor confirme
    await confirmPO(po.id, "condor", { notes: "OK" });
    
    // Vérifier statut
    const updated = getIncomingPOs("condor", "T-FRN-01")[0];
    expect(updated.status).toBe("confirmed_by_supplier");
    
    // Picking task créé
    const tasks = getPickingTasks("condor");
    expect(tasks).toHaveLength(1);
  });
});
```

---

## 🚀 Phase 6 — Intégration & Déploiement (1-2 semaines)

### Semaine 8-9: Assembler & Déployer

#### 6.1 Checklist Pré-Prod

- [ ] Tous les tests passent (100%)
- [ ] Performance: Temps réponse < 2s
- [ ] Isolation multi-WMS vérifiée
- [ ] Audit trail complet
- [ ] Documentation utilisateur
- [ ] Onboarding Condor réussi
- [ ] Fallback sur v2.0 en cas problème

#### 6.2 Rollout Plan

```
Week 1 (Beta):
├─ Feature flags: `multiWmsEnabled = true` pour 1% users
├─ Monitor: Erreurs, performance, data integrity
└─ Test: Instance Condor seule

Week 2 (RC):
├─ 10% users
├─ Tous les rôles testés
└─ Cross-WMS transactions validées

Week 3 (Prod):
├─ 100% users
├─ Architecture v3.0 stable
└─ v2.0 deprecated (backward compat 30j)
```

---

## 📊 Estimations Détaillées

| Phase | Tâche | Durée | Personne |
|-------|-------|-------|----------|
| **0** | Planning + Design | 3j | Lead |
| **1** | WMSInstance + Contexts | 3j | Dev 1 |
| **2** | Routes multi-instance | 4j | Dev 1 + 2 |
| **3** | Incoming POs features | 6j | Dev 2 + 3 |
| **4** | Data layer | 3j | Dev 1 |
| **5** | Testing | 5j | Dev 3 (QA) |
| **6** | Intégration | 5j | All |
| **Buffer** | Imprévus | 3j | — |
| **TOTAL** | | **32j = 6.4 semaines** | |

**Équipe suggérée:** 2-3 devs React/TS + 1 QA

---

## 🎯 Success Criteria

### Fonctionnel
- ✅ Condor a WMS complet (pas portail léger)
- ✅ Incoming PO dashboard 100% fonctionnel
- ✅ Négociation PO fonctionne (confirm, refuse, modify)
- ✅ Facturation Condor indépendante
- ✅ Cross-WMS transactions (Alger → Condor) OK

### Technique
- ✅ Code couverture: >80%
- ✅ Performance: <2s latency
- ✅ Isolation: 100% data separation
- ✅ Audit: Tous les changements loggés
- ✅ Backward compat: v2.0 routes encore fonctionnelles 30j

### Business
- ✅ Condor onboarding complet
- ✅ Aucune perte de data
- ✅ Zéro downtime migration
- ✅ Owner voit revenue Condor agrégé
- ✅ Prêt à onboard 5+ fournisseurs similaires

