import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, Package, Users, FileText, CornerDownLeft,
  ArrowUp, ArrowDown, Plus, ClipboardList, Truck, BarChart3,
  Zap, Clock, X, Hash } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWMSData } from "@/contexts/WMSDataContext";
import { cn } from "@/lib/utils";

/* ── Types ── */
type SearchHit = {
  type: "order" | "grn" | "customer" | "product";
  id: string;
  label: string;
  sub?: string;
  path: string;
};

type QuickAction = {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bg: string;
};

/* ── Metadata ── */
const TYPE_META: Record<SearchHit["type"], {icon: React.ElementType;label: string;color: string;bg: string;}> = {
  order: { icon: ShoppingCart, label: "Commande", color: "text-info", bg: "bg-info/10" },
  grn: { icon: Package, label: "GRN", color: "text-success", bg: "bg-success/10" },
  customer: { icon: Users, label: "Client", color: "text-accent-purple", bg: "bg-accent-purple/10" },
  product: { icon: FileText, label: "Produit", color: "text-accent-orange", bg: "bg-accent-orange/10" }
};

const QUICK_ACTIONS: QuickAction[] = [
{ key: "new-po", label: "Nouveau bon de commande", icon: Plus, path: "/wms/purchase-orders", color: "text-primary", bg: "bg-primary/10" },
{ key: "new-order", label: "Nouvelle commande vente", icon: ShoppingCart, path: "/sales/orders", color: "text-info", bg: "bg-info/10" },
{ key: "cycle", label: "Inventaire tournant", icon: ClipboardList, path: "/wms/cycle-count", color: "text-warning", bg: "bg-warning/10" },
{ key: "transfer", label: "Transfert de stock", icon: Truck, path: "/wms/transfers", color: "text-accent-purple", bg: "bg-accent-purple/10" },
{ key: "reports", label: "Rapports & BI", icon: BarChart3, path: "/reports", color: "text-destructive", bg: "bg-destructive/10" }];


/* ── Component ── */
export default function SpotlightSearch() {
  const navigate = useNavigate();
  const { salesOrders, grns, customers, products } = useWMSData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recents, setRecents] = useState<SearchHit[]>(() => {
    try {return JSON.parse(localStorage.getItem("jawda-recent-search") ?? "[]");}
    catch {return [];}
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Keyboard shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {e.preventDefault();setOpen((p) => !p);}
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {setQuery("");setSelectedIdx(0);setTimeout(() => inputRef.current?.focus(), 50);}
  }, [open]);

  /* Search logic */
  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchHit[] = [];
    salesOrders.forEach((o) => {
      if (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      out.push({ type: "order", id: o.id, label: `${o.id} — ${o.customerName}`, sub: o.status, path: "/sales/orders" });
    });
    grns.forEach((g) => {
      if (g.id.toLowerCase().includes(q) || g.vendorName.toLowerCase().includes(q))
      out.push({ type: "grn", id: g.id, label: `${g.id} — ${g.vendorName}`, sub: g.status, path: "/wms/grn" });
    });
    customers.forEach((c) => {
      if (c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      out.push({ type: "customer", id: c.id, label: c.name, sub: c.id, path: "/sales/customers" });
    });
    products.forEach((p) => {
      if (p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.sku && p.sku.toLowerCase().includes(q))
      out.push({ type: "product", id: p.id, label: p.name, sub: p.sku, path: "/wms/inventory" });
    });
    return out.slice(0, 8);
  }, [query, salesOrders, grns, customers, products]);

  /* Filtered quick actions */
  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  const isSearching = query.length >= 2;
  const hasRecents = recents.length > 0;

  /* Build a flat selectable list for keyboard navigation */
  const selectableCount = isSearching ?
  hits.length :
  (hasRecents ? recents.length : 0) + filteredActions.length;

  const handleSelect = useCallback((h: SearchHit) => {
    setOpen(false);
    setQuery("");
    const updated = [h, ...recents.filter((r) => r.id !== h.id)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem("jawda-recent-search", JSON.stringify(updated));
    requestAnimationFrame(() => navigate(h.path));
  }, [navigate, recents]);

  const handleActionSelect = useCallback((a: QuickAction) => {
    setOpen(false);
    setQuery("");
    requestAnimationFrame(() => navigate(a.path));
  }, [navigate]);

  const clearRecents = useCallback(() => {
    setRecents([]);
    localStorage.removeItem("jawda-recent-search");
  }, []);

  /* Keyboard nav */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {setOpen(false);return;}
    if (e.key === "ArrowDown") {e.preventDefault();setSelectedIdx((i) => Math.min(i + 1, selectableCount - 1));}
    if (e.key === "ArrowUp") {e.preventDefault();setSelectedIdx((i) => Math.max(i - 1, 0));}
    if (e.key === "Enter" && selectableCount > 0) {
      if (isSearching) {
        if (hits[selectedIdx]) handleSelect(hits[selectedIdx]);
      } else {
        const recentLen = hasRecents ? recents.length : 0;
        if (selectedIdx < recentLen) handleSelect(recents[selectedIdx]);else
        {
          const actionIdx = selectedIdx - recentLen;
          if (filteredActions[actionIdx]) handleActionSelect(filteredActions[actionIdx]);
        }
      }
    }
  };

  /* Scroll selected into view */
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  let flatIdx = 0;

  return (
    <>
      {/* Trigger — mobile icon */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Search">
        
        <Search className="h-4 w-4" />
      </button>
      {/* Trigger — desktop bar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2.5 h-9 w-72 rounded-xl border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm transition-all group">
        
        <Search className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-80 transition-opacity" />
        <span className="flex-1 text-start truncate">Rechercher ou lancer une action...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md border border-border/80 bg-background/80 px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Spotlight overlay */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}>
          
            <div className="fixed inset-0 bg-background/60 backdrop-blur-[20px] pointer-events-none" />

            <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="relative z-10 w-full max-w-[640px] rounded-2xl border border-border/40 bg-popover/95 backdrop-blur-xl overflow-hidden my-px py-[10px]"
            style={{ boxShadow: "0 24px 80px -12px hsl(var(--foreground) / 0.15), 0 0 0 1px hsl(var(--border) / 0.1)" }}
            onClick={(e) => e.stopPropagation()}>
            
              {/* Input */}
              <div className="flex items-center gap-3 px-6 border-b border-border/30">
                <Search className={cn(
                "h-5.5 w-5.5 shrink-0 transition-colors duration-200",
                query.length > 0 ? "text-primary" : "text-muted-foreground/40"
              )} />
                <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {setQuery(e.target.value);setSelectedIdx(0);}}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher commande, produit, client… ou action"
                className="flex-1 h-16 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/35 outline-none" />
              
                {query.length > 0 &&
              <button
                onClick={() => {setQuery("");setSelectedIdx(0);inputRef.current?.focus();}}
                className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/50"
                aria-label="Clear search">
                
                    <X className="h-3.5 w-3.5" />
                  </button>
              }
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/50"
                  aria-label="Close search">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results area */}
              <div ref={listRef} className="max-h-[420px] overflow-y-auto p-2">
                {isSearching ? (
              /* Search results */
              hits.length === 0 ?
              <div className="py-12 text-center">
                      <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground/50">
                        Aucun résultat pour « <span className="text-foreground/60 font-medium">{query}</span> »
                      </p>
                      <p className="text-xs text-muted-foreground/30 mt-1">Essayez un autre terme</p>
                    </div> :

              <>
                      <SectionLabel icon={Hash} label={`${hits.length} résultat${hits.length > 1 ? "s" : ""}`} />
                      <ul>
                        {hits.map((h) => {
                    const idx = flatIdx++;
                    const meta = TYPE_META[h.type];
                    const Icon = meta.icon;
                    return (
                      <li key={`${h.type}-${h.id}`}>
                              <button
                          type="button"
                          data-idx={idx}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-all duration-100",
                            idx === selectedIdx ?
                            "bg-primary/8 ring-1 ring-primary/20" :
                            "hover:bg-muted/40"
                          )}
                          onClick={() => handleSelect(h)}
                          onMouseEnter={() => setSelectedIdx(idx)}>
                          
                                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", meta.bg)}>
                                  <Icon className={cn("h-4 w-4", meta.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{h.label}</p>
                                  {h.sub &&
                            <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{h.sub}</p>
                            }
                                </div>
                                <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-lg font-semibold shrink-0 border",
                            meta.bg, meta.color, "border-transparent"
                          )}>
                                  {meta.label}
                                </span>
                                {idx === selectedIdx &&
                          <CornerDownLeft className="h-3 w-3 text-primary shrink-0" />
                          }
                              </button>
                            </li>);

                  })}
                      </ul>
                    </>) : (


              /* Default: recents + quick actions */
              <>
                    {/* Recents */}
                    {hasRecents &&
                <>
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <SectionLabel icon={Clock} label="Récents" />
                          <button
                      onClick={clearRecents}
                      className="text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                      
                            Effacer
                          </button>
                        </div>
                        <ul>
                          {recents.map((h) => {
                      const idx = flatIdx++;
                      const meta = TYPE_META[h.type];
                      const Icon = meta.icon;
                      return (
                        <li key={`recent-${h.type}-${h.id}`}>
                                <button
                            type="button"
                            data-idx={idx}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-start transition-all duration-100",
                              idx === selectedIdx ?
                              "bg-primary/8 ring-1 ring-primary/20" :
                              "hover:bg-muted/40"
                            )}
                            onClick={() => handleSelect(h)}
                            onMouseEnter={() => setSelectedIdx(idx)}>
                            
                                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", meta.bg)}>
                                    <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                                  </div>
                                  <span className="flex-1 text-sm text-foreground/80 truncate">{h.label}</span>
                                  <span className="text-[10px] text-muted-foreground/40">{meta.label}</span>
                                </button>
                              </li>);

                    })}
                        </ul>
                        
                      </>
                }

                    {/* Quick actions */}
                    {filteredActions.length > 0 &&
                <>
                        <SectionLabel icon={Zap} label="Actions rapides" className="px-3 py-1.5" />
                        <ul>
                          {filteredActions.map((a) => {
                      const idx = flatIdx++;
                      const Icon = a.icon;
                      return (
                        <li key={a.key}>
                                


















                          
                              </li>);

                    })}
                        </ul>
                      </>
                }

                    {/* Empty state */}
                    {!hasRecents && filteredActions.length === 0 &&
                <div className="py-12 text-center">
                        <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground/40">Tapez pour rechercher</p>
                      </div>
                }
                  </>)
              }
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-5 px-4 py-2 border-t border-border/20 bg-muted/20">
                <FooterHint>
                  <ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" />
                  <span>naviguer</span>
                </FooterHint>
                <FooterHint>
                  <CornerDownLeft className="h-3 w-3" />
                  <span>ouvrir</span>
                </FooterHint>
                <FooterHint>
                  <kbd className="px-1 py-px rounded border border-border/40 bg-background/60 text-[9px] font-mono">esc</kbd>
                  <span>fermer</span>
                </FooterHint>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}

/* ── Helpers ── */
function SectionLabel({ icon: Icon, label, className }: {icon: React.ElementType;label: string;className?: string;}) {
  return (
    <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 py-1", className)}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>);


}

function FooterHint({ children }: {children: React.ReactNode;}) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/35">
      {children}
    </span>);

}