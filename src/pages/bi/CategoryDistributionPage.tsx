import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useWMSData } from "@/contexts/WMSDataContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Treemap,
} from "recharts";

const COLORS = [
  "hsl(30, 60%, 50%)",   // Construction
  "hsl(120, 40%, 45%)",  // Food
  "hsl(220, 60%, 55%)",  // Tech
  "hsl(45, 80%, 50%)",   // Energy
  "hsl(280, 50%, 55%)",
  "hsl(0, 60%, 50%)",
  "hsl(180, 50%, 45%)",
  "hsl(330, 55%, 50%)",
];

const CAT_COLORS = [
  "hsl(200, 60%, 50%)", "hsl(160, 50%, 45%)", "hsl(30, 60%, 50%)",
  "hsl(280, 50%, 50%)", "hsl(0, 50%, 50%)", "hsl(120, 40%, 45%)",
  "hsl(45, 70%, 50%)", "hsl(220, 60%, 55%)", "hsl(340, 50%, 50%)",
  "hsl(90, 40%, 45%)", "hsl(260, 40%, 55%)", "hsl(15, 60%, 50%)",
];

export default function CategoryDistributionPage() {
  const { products, sectors, productCategories, subCategories, inventory } = useWMSData();

  const activeProducts = useMemo(() => products.filter(p => !p.isDeleted && p.isActive), [products]);

  // Build category → sector map
  const catToSector = useMemo(() => {
    const map = new Map<string, string>();
    productCategories.forEach(c => map.set(c.name, c.sectorId));
    return map;
  }, [productCategories]);

  // Products by sector
  const bySector = useMemo(() => {
    const map = new Map<string, number>();
    activeProducts.forEach(p => {
      const sectorId = catToSector.get(p.category) ?? "unknown";
      map.set(sectorId, (map.get(sectorId) ?? 0) + 1);
    });
    return sectors
      .filter(s => s.status === "Active")
      .map((s, i) => ({
        name: s.name,
        icon: s.icon,
        value: map.get(s.id) ?? 0,
        fill: COLORS[i % COLORS.length],
      }))
      .filter(d => d.value > 0);
  }, [activeProducts, sectors, catToSector]);

  // Products by category (top 15)
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    activeProducts.forEach(p => {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [activeProducts]);

  // Stock value by sector
  const stockBySector = useMemo(() => {
    const map = new Map<string, number>();
    activeProducts.forEach(p => {
      const sectorId = catToSector.get(p.category) ?? "unknown";
      const stock = inventory.filter(i => i.productId === p.id).reduce((s, i) => s + i.qtyOnHand, 0);
      const value = stock * p.unitCost;
      map.set(sectorId, (map.get(sectorId) ?? 0) + value);
    });
    return sectors
      .filter(s => s.status === "Active")
      .map((s, i) => ({
        name: s.name,
        icon: s.icon,
        value: Math.round((map.get(s.id) ?? 0) / 1000),
        fill: COLORS[i % COLORS.length],
      }))
      .filter(d => d.value > 0);
  }, [activeProducts, sectors, catToSector, inventory]);

  // Subcategory distribution (treemap data)
  const treemapData = useMemo(() => {
    const catMap = new Map<string, { name: string; children: { name: string; size: number }[] }>();
    activeProducts.forEach(p => {
      if (!catMap.has(p.category)) {
        catMap.set(p.category, { name: p.category, children: [] });
      }
      const cat = catMap.get(p.category)!;
      const subName = (() => {
        if (p.subcategoryId) {
          const sc = subCategories.find(s => s.id === p.subcategoryId);
          return sc?.name ?? "Autre";
        }
        return "Non classé";
      })();
      const existing = cat.children.find(c => c.name === subName);
      if (existing) existing.size++;
      else cat.children.push({ name: subName, size: 1 });
    });
    return [...catMap.values()];
  }, [activeProducts, subCategories]);

  // Flat treemap for recharts
  const flatTreemap = useMemo(() => {
    return treemapData.flatMap(cat =>
      cat.children.map(sub => ({
        name: `${cat.name} › ${sub.name}`,
        size: sub.size,
      }))
    );
  }, [treemapData]);

  // Summary KPIs
  const totalSectors = bySector.length;
  const totalCategories = byCategory.length;
  const totalSubcats = useMemo(() => {
    const usedSubs = new Set(activeProducts.map(p => p.subcategoryId).filter(Boolean));
    return usedSubs.size;
  }, [activeProducts]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Répartition par catégorie</h1>
          <p className="text-sm text-muted-foreground">
            Analyse BI — {activeProducts.length} produits actifs
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Secteurs actifs" value={totalSectors} />
        <KPI label="Catégories utilisées" value={totalCategories} />
        <KPI label="Sous-catégories" value={totalSubcats} />
        <KPI label="Produits actifs" value={activeProducts.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie: Products by Sector */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Produits par secteur</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution sectorielle</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={bySector}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name.split(" ")[0]} (${value})`}
                labelLine={false}
              >
                {bySector.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _n: string, props: any) => [`${v} produits`, props.payload.icon + " " + props.payload.name]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {bySector.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                <span>{s.icon} {s.name}</span>
                <span className="font-semibold">({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar: Stock Value by Sector */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-1">Valeur stock par secteur</h3>
          <p className="text-xs text-muted-foreground mb-4">En milliers DZD</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockBySector}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()}k DZD`, "Valeur"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stockBySector.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar: Products by Category (full width) */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-1">Produits par catégorie</h3>
        <p className="text-xs text-muted-foreground mb-4">Top {byCategory.length} catégories</p>
        <ResponsiveContainer width="100%" height={Math.max(250, byCategory.length * 28)}>
          <BarChart data={byCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
            <Tooltip
              formatter={(v: number) => [`${v} produits`, "Quantité"]}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {byCategory.map((_, i) => (
                <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sectors.filter(s => s.status === "Active").map((sector, si) => {
          const sectorCats = productCategories.filter(c => c.sectorId === sector.id && !c.isDeleted);
          const sectorProds = activeProducts.filter(p => catToSector.get(p.category) === sector.id);
          return (
            <div key={sector.id} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{sector.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{sector.name}</p>
                  <p className="text-[10px] text-muted-foreground">{sectorCats.length} catégories · {sectorProds.length} produits</p>
                </div>
              </div>
              <div className="space-y-1">
                {sectorCats.slice(0, 5).map(cat => {
                  const catCount = sectorProds.filter(p => p.category === cat.name).length;
                  const pct = sectorProds.length > 0 ? (catCount / sectorProds.length) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground truncate">{cat.name}</span>
                        <span className="font-semibold">{catCount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: COLORS[si % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
                {sectorCats.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center">+{sectorCats.length - 5} autres</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card rounded-lg p-3 border border-border/50 hover:shadow-md transition-shadow">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
