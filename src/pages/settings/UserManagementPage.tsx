import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { users as initialUsers, warehouses, USER_ROLE_LEVEL, GOVERNANCE_LABELS } from "@/data/mockData";
import type { User, UserRole, GovernancePermission } from "@/data/mockData";
import {
    getRoleBadgeStyle,
    getWarehouseBadgeStyle,
    getWarehouseShortName,
    APPROVAL_TIERS,
    ROLE_PERMISSIONS_DISPLAY,
    type DocumentType,
} from "@/lib/rbac";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
    Building2, ShieldCheck, ShieldOff, Users2, ChevronRight,
    CheckCircle2, XCircle, AlertTriangle, Info, Crown, Lock,
    Plus, Pencil, Trash2, Search, Filter, Download,
    Eye, ChevronDown, BarChart3, Shield, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import UserFormDialog from "@/components/settings/UserFormDialog";
import DeleteUserDialog from "@/components/settings/DeleteUserDialog";
import { Card, CardContent } from "@/components/ui/card";

// ── Permission row ─────────────────────────────────────────────────────────
function PermCheck({ allowed }: { allowed: boolean }) {
    return allowed
        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        : <XCircle className="h-4 w-4 text-slate-300" />;
}

// ── User detail panel ──────────────────────────────────────────────────────
function UserDetailPanel({ user, onClose, t }: { user: User; onClose: () => void; t: (key: string, opts?: any) => string }) {
    const DOC_LABELS: Record<DocumentType, string> = {
        grn: "GRN",
        stockAdjustment: t("userManagement.document") + " — Stock",
        stockTransfer: t("common.warehouse") + " Transfer",
        cycleCount: t("nav.cycleCount"),
        purchaseOrder: t("nav.purchaseOrders"),
        salesOrder: t("nav.orders"),
        invoice: t("nav.invoices"),
        payment: t("nav.payments"),
        writeOff: "Write-off",
    };

    const docs: DocumentType[] = ["grn", "stockAdjustment", "stockTransfer", "cycleCount", "purchaseOrder", "salesOrder", "invoice", "payment", "writeOff"];
    const perms = ROLE_PERMISSIONS_DISPLAY[user.role];
    const isFullAccess = user.assignedWarehouseIds === "all";
    const assignedWHs = isFullAccess ? warehouses : warehouses.filter((wh) => (user.assignedWarehouseIds as string[]).includes(wh.id));

    return (
        <div className="rounded-xl border border-primary/20 bg-card p-5 space-y-5 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{user.avatar}</div>
                    <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border", getRoleBadgeStyle(user.role))}>{user.roleLabel}</span>
                            <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none rounded-lg hover:bg-muted p-1 transition-colors">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-4">
                    {/* Accountability */}
                    <div className="rounded-lg bg-muted/40 border border-border p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-0.5 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> {t("userManagement.responsibilityScope")}</p>
                        <p className="text-xs">{user.accountabilityScope}</p>
                    </div>

                    {/* Assigned warehouses */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("userManagement.assignedWarehouses")}</p>
                        <div className="flex flex-wrap gap-2">
                            {isFullAccess && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                                    <Building2 className="h-3.5 w-3.5" /> {t("userManagement.allWarehousesAccess")}
                                </span>
                            )}
                            {assignedWHs.map((wh) => (
                                <div key={wh.id} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border", getWarehouseBadgeStyle(wh.id))}>
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span className="font-semibold">{getWarehouseShortName(wh.id)}</span>
                                    <span className="text-[10px] opacity-70">— {wh.city}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Approval threshold */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("userManagement.approvalThreshold")}</p>
                        {user.approvalThresholdPct !== null ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                                <ShieldCheck className="h-3.5 w-3.5" /> {t("userManagement.upTo", { pct: user.approvalThresholdPct })}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                                <ShieldOff className="h-3.5 w-3.5" /> {t("userManagement.noAuthority")}
                            </span>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{t("userManagement.selfApproval")} : <strong className="text-destructive">{t("userManagement.alwaysForbidden")}</strong></p>
                    </div>

                    {/* Governance */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Crown className="h-3 w-3" /> {t("userManagement.governanceLayer3")}</p>
                        {user.governancePermissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {user.governancePermissions.map((perm) => (
                                    <span key={perm} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border", perm === "SYSTEM_ADMIN" ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-violet-50 text-violet-700 border-violet-200")}>
                                        {perm === "SYSTEM_ADMIN" ? <Crown className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                        {GOVERNANCE_LABELS[perm]}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-500 border-slate-200">
                                <ShieldOff className="h-3.5 w-3.5" /> {t("userManagement.operationalOnly")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right column — Permission matrix */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("userManagement.permissionMatrix")}</p>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left font-semibold px-3 py-2">{t("userManagement.document")}</th>
                                    <th className="text-center font-semibold px-2 py-2">{t("userManagement.read")}</th>
                                    <th className="text-center font-semibold px-2 py-2">{t("userManagement.create")}</th>
                                    <th className="text-center font-semibold px-2 py-2">{t("userManagement.approve")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((doc, i) => (
                                    <tr key={doc} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                                        <td className="px-3 py-1.5 font-medium text-foreground/80">{DOC_LABELS[doc]}</td>
                                        <td className="px-2 py-1.5 text-center"><PermCheck allowed={perms.read.includes(doc)} /></td>
                                        <td className="px-2 py-1.5 text-center"><PermCheck allowed={perms.create.includes(doc)} /></td>
                                        <td className="px-2 py-1.5 text-center"><PermCheck allowed={perms.approve.includes(doc)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function UserManagementPage() {
    const [usersList, setUsersList] = useState<User[]>([...initialUsers]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"hierarchy" | "users" | "governance">("users");
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [whFilter, setWhFilter] = useState<string>("all");
    const { t } = useTranslation();
    const { hasGovernance, isSystemAdmin } = useAuth();
    const { toast } = useToast();

    const canManageUsers = isSystemAdmin || hasGovernance("MANAGE_USERS") || hasGovernance("SYSTEM_ADMIN");

    // ── Hierarchy levels for the org tree ─────────────────────────────────────
    const LEVEL_CONFIG = [
        { level: 1, label: t("userManagement.hierarchy") + " — L1", color: "bg-purple-500", textColor: "text-purple-700", borderColor: "border-purple-200", bgColor: "bg-purple-50/50" },
        { level: 2, label: t("userManagement.hierarchy") + " — L2", color: "bg-indigo-500", textColor: "text-indigo-700", borderColor: "border-indigo-200", bgColor: "bg-indigo-50/50" },
        { level: 3, label: t("userManagement.hierarchy") + " — L3", color: "bg-blue-500", textColor: "text-blue-700", borderColor: "border-blue-200", bgColor: "bg-blue-50/50" },
        { level: 4, label: t("userManagement.hierarchy") + " — L4", color: "bg-cyan-500", textColor: "text-cyan-700", borderColor: "border-cyan-200", bgColor: "bg-cyan-50/50" },
        { level: 5, label: t("userManagement.hierarchy") + " — L5", color: "bg-slate-400", textColor: "text-slate-700", borderColor: "border-slate-200", bgColor: "bg-slate-50/50" },
    ];

    const filteredUsers = useMemo(() => {
        let result = [...usersList].sort((a, b) => USER_ROLE_LEVEL[a.role] - USER_ROLE_LEVEL[b.role]);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.roleLabel.toLowerCase().includes(q));
        }
        if (roleFilter !== "all") {
            result = result.filter((u) => u.role === roleFilter);
        }
        if (whFilter !== "all") {
            result = result.filter((u) => u.assignedWarehouseIds === "all" || (Array.isArray(u.assignedWarehouseIds) && u.assignedWarehouseIds.includes(whFilter)));
        }
        return result;
    }, [usersList, searchQuery, roleFilter, whFilter]);

    const sortedUsers = [...usersList].sort((a, b) => USER_ROLE_LEVEL[a.role] - USER_ROLE_LEVEL[b.role]);

    // Stats
    const stats = useMemo(() => ({
        total: usersList.length,
        withApproval: usersList.filter((u) => u.approvalThresholdPct !== null).length,
        withGov: usersList.filter((u) => u.governancePermissions.length > 0).length,
        roles: new Set(usersList.map((u) => u.role)).size,
    }), [usersList]);

    const handleSaveUser = (user: User) => {
        setUsersList((prev) => {
            const idx = prev.findIndex((u) => u.id === user.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = user;
                toast({ title: t("userManagement.userModified"), description: t("userManagement.userModifiedDesc", { name: user.name }) });
                return updated;
            }
            toast({ title: t("userManagement.userCreated"), description: t("userManagement.userCreatedDesc", { name: user.name }) });
            return [...prev, user];
        });
        setSelectedUser(null);
    };

    const handleDeleteUser = (userId: string) => {
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) setSelectedUser(null);
        toast({ title: t("userManagement.userDeleted"), description: t("userManagement.userDeletedDesc"), variant: "destructive" });
    };

    const openEdit = (user: User) => { setEditingUser(user); setFormOpen(true); };
    const openCreate = () => { setEditingUser(null); setFormOpen(true); };
    const openDelete = (user: User) => { setDeletingUser(user); setDeleteOpen(true); };

    const uniqueRoles = [...new Set(usersList.map((u) => u.role))].sort((a, b) => USER_ROLE_LEVEL[a] - USER_ROLE_LEVEL[b]);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                        <Users2 className="h-6 w-6 text-primary" />
                        {t("userManagement.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {t("userManagement.subtitle")}
                    </p>
                </div>
                {canManageUsers && (
                    <Button onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        {t("userManagement.addUser")}
                    </Button>
                )}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-blue-200/50 bg-blue-50/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Users2 className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                            <p className="text-xs text-blue-600">{t("userManagement.users")}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200/50 bg-emerald-50/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-emerald-600" />
                        <div>
                            <p className="text-2xl font-bold text-emerald-700">{stats.roles}</p>
                            <p className="text-xs text-emerald-600">{t("userManagement.distinctRoles")}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-200/50 bg-amber-50/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-amber-600" />
                        <div>
                            <p className="text-2xl font-bold text-amber-700">{stats.withApproval}</p>
                            <p className="text-xs text-amber-600">{t("userManagement.withApproval")}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-200/50 bg-purple-50/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Crown className="h-8 w-8 text-purple-600" />
                        <div>
                            <p className="text-2xl font-bold text-purple-700">{stats.withGov}</p>
                            <p className="text-xs text-purple-600">{t("userManagement.withGovernance")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-border">
                <div className="flex gap-1">
                    {(["users", "hierarchy", "governance"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {{ hierarchy: `🏢 ${t("userManagement.hierarchy")}`, users: `👥 ${t("userManagement.users")}`, governance: `📋 ${t("userManagement.governance")}` }[tab]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB: Users table ── */}
            {activeTab === "users" && (
                <div className="space-y-4">
                    {/* Search and filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t("userManagement.searchPlaceholder")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="all">{t("userManagement.allRoles")}</option>
                            {uniqueRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <select
                            value={whFilter}
                            onChange={(e) => setWhFilter(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="all">{t("userManagement.allWarehouses")}</option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>{getWarehouseShortName(wh.id)}</option>
                            ))}
                        </select>
                        <span className="text-xs text-muted-foreground">{filteredUsers.length} {t("common.results")}</span>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-3">{t("userManagement.users")}</th>
                                    <th className="text-left font-semibold px-4 py-3">{t("common.type")}</th>
                                    <th className="text-left font-semibold px-4 py-3">{t("common.warehouse")}</th>
                                    <th className="text-left font-semibold px-4 py-3">{t("userManagement.approve")}</th>
                                    <th className="text-center font-semibold px-4 py-3">{t("userManagement.governance")}</th>
                                    {canManageUsers && <th className="text-center font-semibold px-4 py-3">{t("common.actions")}</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, i) => {
                                    const isFullAccess = user.assignedWarehouseIds === "all";
                                    return (
                                        <tr
                                            key={user.id}
                                            className={cn(
                                                "border-b border-border/50 last:border-0 cursor-pointer transition-colors",
                                                i % 2 === 0 ? "" : "bg-muted/20",
                                                selectedUser?.id === user.id ? "bg-primary/5" : "hover:bg-muted/40"
                                            )}
                                            onClick={() => setSelectedUser(user === selectedUser ? null : user)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{user.avatar}</div>
                                                    <div>
                                                        <span className="font-medium block">{user.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{user.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border", getRoleBadgeStyle(user.role))}>
                                                    {user.roleLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {isFullAccess ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border bg-purple-50 text-purple-700 border-purple-200">
                                                            <Building2 className="h-3 w-3" /> {t("common.all")}
                                                        </span>
                                                    ) : (
                                                        (user.assignedWarehouseIds as string[]).map((whId) => (
                                                            <span key={whId} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border", getWarehouseBadgeStyle(whId))}>
                                                                {getWarehouseShortName(whId)}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.approvalThresholdPct !== null ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        <ShieldCheck className="h-3 w-3" /> ≤ {user.approvalThresholdPct}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {user.governancePermissions.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border bg-purple-50 text-purple-700 border-purple-200">
                                                        <Crown className="h-3 w-3" /> {user.governancePermissions.length}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            {canManageUsers && (
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(user); }}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); openDelete(user); }}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {selectedUser && <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} t={t} />}
                </div>
            )}

            {/* ── TAB: Hierarchy ── */}
            {activeTab === "hierarchy" && (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t("userManagement.subtitle")}
                    </p>
                    {LEVEL_CONFIG.map(({ level, label, color, textColor, borderColor, bgColor }) => {
                        const levelUsers = sortedUsers.filter((u) => USER_ROLE_LEVEL[u.role] === level);
                        if (levelUsers.length === 0) return null;
                        return (
                            <div key={level} className={cn("rounded-xl border p-4 space-y-3", borderColor, bgColor)}>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: level - 1 }).map((_, i) => (
                                            <ChevronRight key={i} className="h-3.5 w-3.5 text-muted-foreground/40" />
                                        ))}
                                        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
                                    </div>
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", textColor)}>
                                        {label}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">{levelUsers.length} {t("userManagement.users").toLowerCase()}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {levelUsers.map((user) => {
                                        const isFullAccess = user.assignedWarehouseIds === "all";
                                        return (
                                            <button
                                                key={user.id}
                                                onClick={() => setSelectedUser(user === selectedUser ? null : user)}
                                                className={cn(
                                                    "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                                                    selectedUser?.id === user.id ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-muted/40"
                                                )}
                                            >
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{user.avatar}</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{user.name}</p>
                                                    <span className={cn("inline-flex items-center mt-0.5 px-1.5 py-px rounded text-[10px] font-semibold border", getRoleBadgeStyle(user.role))}>{user.roleLabel}</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {isFullAccess ? (
                                                            <span className="inline-flex items-center gap-1 px-1 py-px rounded text-[10px] font-medium border bg-purple-50 text-purple-700 border-purple-200">
                                                                <Building2 className="h-2.5 w-2.5" /> {t("common.all")}
                                                            </span>
                                                        ) : (
                                                            (user.assignedWarehouseIds as string[]).map((whId) => (
                                                                <span key={whId} className={cn("inline-flex items-center gap-1 px-1 py-px rounded text-[10px] font-medium border", getWarehouseBadgeStyle(whId))}>
                                                                    {getWarehouseShortName(whId)}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {selectedUser && <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} t={t} />}
                </div>
            )}

            {/* ── TAB: Governance ── */}
            {activeTab === "governance" && (
                <div className="space-y-6">
                    {/* Governance matrix */}
                    <div>
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Lock className="h-4 w-4 text-purple-500" /> {t("userManagement.governance")}</h2>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">{t("userManagement.users")}</th>
                                        {(Object.keys(GOVERNANCE_LABELS) as GovernancePermission[]).map((perm) => (
                                            <th key={perm} className="text-center font-semibold px-2 py-3 text-[10px]">{GOVERNANCE_LABELS[perm]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedUsers.map((user, i) => (
                                        <tr key={user.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{user.avatar}</div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-xs truncate">{user.name}</p>
                                                        <span className={cn("inline-flex px-1 py-px rounded text-[9px] font-semibold border", getRoleBadgeStyle(user.role))}>{user.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {(Object.keys(GOVERNANCE_LABELS) as GovernancePermission[]).map((perm) => (
                                                <td key={perm} className="px-2 py-2 text-center"><PermCheck allowed={user.governancePermissions.includes(perm)} /></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Approval escalation */}
                    <div>
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> {t("userManagement.approvalThreshold")}</h2>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">{t("alertRules.colThreshold")}</th>
                                        <th className="text-left font-semibold px-4 py-3">{t("common.type")}</th>
                                        <th className="text-left font-semibold px-4 py-3">{t("common.type")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { range: "≤ 0.5%", tier: APPROVAL_TIERS.auto },
                                        { range: "0.5% – 2%", tier: APPROVAL_TIERS.manager },
                                        { range: "2% – 5%", tier: APPROVAL_TIERS.finance },
                                        { range: "> 5%", tier: APPROVAL_TIERS.ceo },
                                    ].map(({ range, tier }, i) => (
                                        <tr key={tier.tier} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                                            <td className="px-4 py-3 font-mono font-semibold">{range}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border", tier.badgeColor)}>{tier.label}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tier.requiredRoles.length === 0 ? (
                                                    <span className="text-xs text-emerald-600 font-medium">{t("approvalWorkflows.always")}</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {tier.requiredRoles.map((role) => (
                                                            <span key={role} className={cn("inline-flex px-1.5 py-px rounded text-[10px] font-semibold border", getRoleBadgeStyle(role as UserRole))}>{role}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Warehouse accountability */}
                    <div>
                        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-500" /> {t("userManagement.assignedWarehouses")}</h2>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-3">{t("common.warehouse")}</th>
                                        <th className="text-left font-semibold px-4 py-3">{t("common.city")}</th>
                                        <th className="text-left font-semibold px-4 py-3">{t("userManagement.users")}</th>
                                        <th className="text-left font-semibold px-4 py-3">{t("userManagement.users")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warehouses.map((wh, i) => {
                                        const manager = usersList.find((u) => u.role === "WarehouseManager" && Array.isArray(u.assignedWarehouseIds) && u.assignedWarehouseIds.includes(wh.id));
                                        const teamMembers = usersList.filter((u) => Array.isArray(u.assignedWarehouseIds) && u.assignedWarehouseIds.includes(wh.id) && u.role !== "WarehouseManager");
                                        return (
                                            <tr key={wh.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                                                <td className="px-4 py-3">
                                                    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border", getWarehouseBadgeStyle(wh.id))}>
                                                        <Building2 className="h-3 w-3" /> {getWarehouseShortName(wh.id)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{wh.city}</td>
                                                <td className="px-4 py-3">
                                                    {manager ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{manager.avatar}</div>
                                                            <span className="font-medium text-sm">{manager.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {teamMembers.map((m) => (
                                                            <span key={m.id} className={cn("inline-flex items-center px-1.5 py-px rounded text-[10px] font-semibold border", getRoleBadgeStyle(m.role))}>{m.avatar} {m.name.split(" ")[0]}</span>
                                                        ))}
                                                        {teamMembers.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CRUD Dialogs */}
            <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} onSave={handleSaveUser} existingIds={usersList.map((u) => u.id)} />
            <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} user={deletingUser} onConfirm={handleDeleteUser} />
        </div>
    );
}
