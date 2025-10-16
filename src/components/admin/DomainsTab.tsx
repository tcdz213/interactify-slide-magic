import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDomains } from "@/hooks/use-domains";
import { Domain, Subcategory, Keywords } from "@/services/domainsApi";
import { authApi } from "@/services/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit, FolderTree } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function DomainsTab() {
  const { user } = useAuth();
  const {
    domains,
    isLoading,
    createDomain,
    updateDomain,
    deleteDomain,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useDomains();

  // Dialog states
  const [addDomainDialog, setAddDomainDialog] = useState(false);
  const [editDomainDialog, setEditDomainDialog] = useState(false);
  const [deleteDomainDialog, setDeleteDomainDialog] = useState(false);
  const [addSubcategoryDialog, setAddSubcategoryDialog] = useState(false);
  const [editSubcategoryDialog, setEditSubcategoryDialog] = useState(false);
  const [deleteSubcategoryDialog, setDeleteSubcategoryDialog] = useState(false);

  // Selected items
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  // Form states
  const [domainForm, setDomainForm] = useState({
    key: "",
    ar: "",
    fr: "",
    en: "",
    keywords: { ar: "", fr: "", en: "" },
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    key: "",
    ar: "",
    fr: "",
    en: "",
    keywords: { ar: "", fr: "", en: "" },
  });

  const resetDomainForm = () => {
    setDomainForm({
      key: "",
      ar: "",
      fr: "",
      en: "",
      keywords: { ar: "", fr: "", en: "" },
    });
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      key: "",
      ar: "",
      fr: "",
      en: "",
      keywords: { ar: "", fr: "", en: "" },
    });
  };

  // Parse keywords string to array
  const parseKeywords = (keywordsStr: string): string[] => {
    return keywordsStr
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  // Convert keywords object strings to arrays
  const buildKeywordsObject = (keywordsForm: { ar: string; fr: string; en: string }): Keywords => {
    return {
      ar: parseKeywords(keywordsForm.ar),
      fr: parseKeywords(keywordsForm.fr),
      en: parseKeywords(keywordsForm.en),
    };
  };

  const handleCreateDomain = async () => {
    if (!user?.id) return;

    const token = authApi.getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDomain(
        {
          key: domainForm.key,
          ar: domainForm.ar,
          fr: domainForm.fr,
          en: domainForm.en,
          keywords: buildKeywordsObject(domainForm.keywords),
        },
        token
      );
      setAddDomainDialog(false);
      resetDomainForm();
    } catch (error) {
      console.error("Create domain error:", error);
    }
  };

  const handleUpdateDomain = async () => {
    if (!selectedDomain || !user?.id) return;

    const token = authApi.getToken();
    if (!token) return;

    try {
      await updateDomain(
        selectedDomain.key,
        {
          ar: domainForm.ar,
          fr: domainForm.fr,
          en: domainForm.en,
          keywords: buildKeywordsObject(domainForm.keywords),
        },
        token
      );
      setEditDomainDialog(false);
      setSelectedDomain(null);
      resetDomainForm();
    } catch (error) {
      console.error("Update domain error:", error);
    }
  };

  const handleDeleteDomain = async () => {
    if (!selectedDomain || !user?.id) return;

    const token = authApi.getToken();
    if (!token) return;

    try {
      await deleteDomain(selectedDomain.key, token);
      setDeleteDomainDialog(false);
      setSelectedDomain(null);
    } catch (error) {
      console.error("Delete domain error:", error);
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedDomain || !user?.id) return;

    const token = authApi.getToken();
    if (!token) return;

    try {
      await addSubcategory(
        selectedDomain.key,
        {
          key: subcategoryForm.key,
          ar: subcategoryForm.ar,
          fr: subcategoryForm.fr,
          en: subcategoryForm.en,
          keywords: buildKeywordsObject(subcategoryForm.keywords),
        },
        token
      );
      setAddSubcategoryDialog(false);
      resetSubcategoryForm();
    } catch (error) {
      console.error("Add subcategory error:", error);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!selectedDomain || !selectedSubcategory || !user?.id) return;

    const token = authApi.getToken();
    if (!token) return;

    try {
      await updateSubcategory(
        selectedDomain.key,
        selectedSubcategory.key,
        {
          ar: subcategoryForm.ar,
          fr: subcategoryForm.fr,
          en: subcategoryForm.en,
          keywords: buildKeywordsObject(subcategoryForm.keywords),
        },
        token
      );
      setEditSubcategoryDialog(false);
      setSelectedSubcategory(null);
      resetSubcategoryForm();
    } catch (error) {
      console.error("Update subcategory error:", error);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!selectedDomain || !selectedSubcategory || !user?.id) return;

    const token = authApi.getToken();
    if (!token) return;

    try {
      await deleteSubcategory(selectedDomain.key, selectedSubcategory.key, token);
      setDeleteSubcategoryDialog(false);
      setSelectedSubcategory(null);
    } catch (error) {
      console.error("Delete subcategory error:", error);
    }
  };

  const openEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setDomainForm({
      key: domain.key,
      ar: domain.ar,
      fr: domain.fr,
      en: domain.en,
      keywords: {
        ar: domain.keywords.ar.join(", "),
        fr: domain.keywords.fr.join(", "),
        en: domain.keywords.en.join(", "),
      },
    });
    setEditDomainDialog(true);
  };

  const openDeleteDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setDeleteDomainDialog(true);
  };

  const openAddSubcategory = (domain: Domain) => {
    setSelectedDomain(domain);
    resetSubcategoryForm();
    setAddSubcategoryDialog(true);
  };

  const openEditSubcategory = (domain: Domain, subcategory: Subcategory) => {
    setSelectedDomain(domain);
    setSelectedSubcategory(subcategory);
    setSubcategoryForm({
      key: subcategory.key,
      ar: subcategory.ar,
      fr: subcategory.fr,
      en: subcategory.en,
      keywords: {
        ar: subcategory.keywords.ar.join(", "),
        fr: subcategory.keywords.fr.join(", "),
        en: subcategory.keywords.en.join(", "),
      },
    });
    setEditSubcategoryDialog(true);
  };

  const openDeleteSubcategory = (domain: Domain, subcategory: Subcategory) => {
    setSelectedDomain(domain);
    setSelectedSubcategory(subcategory);
    setDeleteSubcategoryDialog(true);
  };

  if (isLoading) {
    return <div className="p-4">Loading domains...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-2xl font-bold">Domains & Subcategories</h2>
        <Button onClick={() => setAddDomainDialog(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-240px)] pr-4">
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.key} className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FolderTree className="h-5 w-5 text-primary" />
                      <span>{domain.en}</span>
                      <span className="text-muted-foreground font-normal text-base">({domain.fr} / {domain.ar})</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Key: {domain.key}</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openAddSubcategory(domain)} className="h-9">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDomain(domain)} className="h-9">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDomain(domain)}
                      className="h-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {domain.keywords.en.map((kw, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {domain.subcategories.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Subcategories ({domain.subcategories.length})</Label>
                        <div className="space-y-3">
                          {domain.subcategories.map((sub) => (
                            <div
                              key={sub.key}
                              className="flex items-start justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="font-medium text-sm mb-1">
                                  {sub.en} <span className="text-muted-foreground font-normal">({sub.fr} / {sub.ar})</span>
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">Key: {sub.key}</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.keywords.en.map((kw, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditSubcategory(domain, sub)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteSubcategory(domain, sub)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Add Domain Dialog */}
      <Dialog open={addDomainDialog} onOpenChange={setAddDomainDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl">Add New Domain</DialogTitle>
            <DialogDescription>Create a new category domain with multilingual support</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="domain-key" className="text-sm font-semibold mb-2 block">Domain Key*</Label>
              <Input
                id="domain-key"
                placeholder="e.g., education"
                value={domainForm.key}
                onChange={(e) => setDomainForm({ ...domainForm, key: e.target.value })}
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Domain Names*</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="domain-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="domain-en"
                    placeholder="Education"
                    value={domainForm.en}
                    onChange={(e) => setDomainForm({ ...domainForm, en: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="domain-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="domain-fr"
                    placeholder="Éducation"
                    value={domainForm.fr}
                    onChange={(e) => setDomainForm({ ...domainForm, fr: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="domain-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="domain-ar"
                    placeholder="التعليم"
                    value={domainForm.ar}
                    onChange={(e) => setDomainForm({ ...domainForm, ar: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-semibold mb-3 block">Keywords (comma-separated)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="keywords-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="keywords-en"
                    placeholder="teaching, study, school"
                    value={domainForm.keywords.en}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, en: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="keywords-fr"
                    placeholder="enseignement, étude, école"
                    value={domainForm.keywords.fr}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, fr: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="keywords-ar"
                    placeholder="تعليم، دراسة، مدرسة"
                    value={domainForm.keywords.ar}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, ar: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setAddDomainDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button onClick={handleCreateDomain} className="min-w-24">Create Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Domain Dialog */}
      <Dialog open={editDomainDialog} onOpenChange={setEditDomainDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl">Edit Domain</DialogTitle>
            <DialogDescription>Update domain information and multilingual content</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Domain Key (read-only)</Label>
              <Input value={domainForm.key} disabled className="h-11 bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Domain Names</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-domain-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="edit-domain-en"
                    value={domainForm.en}
                    onChange={(e) => setDomainForm({ ...domainForm, en: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-domain-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="edit-domain-fr"
                    value={domainForm.fr}
                    onChange={(e) => setDomainForm({ ...domainForm, fr: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-domain-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="edit-domain-ar"
                    value={domainForm.ar}
                    onChange={(e) => setDomainForm({ ...domainForm, ar: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-semibold mb-3 block">Keywords (comma-separated)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-keywords-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="edit-keywords-en"
                    value={domainForm.keywords.en}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, en: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-keywords-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="edit-keywords-fr"
                    value={domainForm.keywords.fr}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, fr: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-keywords-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="edit-keywords-ar"
                    value={domainForm.keywords.ar}
                    onChange={(e) =>
                      setDomainForm({
                        ...domainForm,
                        keywords: { ...domainForm.keywords, ar: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setEditDomainDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button onClick={handleUpdateDomain} className="min-w-24">Update Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Dialog */}
      <Dialog open={deleteDomainDialog} onOpenChange={setDeleteDomainDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Delete Domain</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <strong className="text-foreground">{selectedDomain?.en}</strong>? 
              This action cannot be undone and will also delete all associated subcategories.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteDomainDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDomain} className="min-w-24">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={addSubcategoryDialog} onOpenChange={setAddSubcategoryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl">Add Subcategory to {selectedDomain?.en}</DialogTitle>
            <DialogDescription>Create a new subcategory with multilingual support</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="sub-key" className="text-sm font-semibold mb-2 block">Subcategory Key*</Label>
              <Input
                id="sub-key"
                placeholder="e.g., primary_school"
                value={subcategoryForm.key}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, key: e.target.value })}
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Subcategory Names*</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sub-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="sub-en"
                    placeholder="Primary School"
                    value={subcategoryForm.en}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, en: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="sub-fr"
                    placeholder="École Primaire"
                    value={subcategoryForm.fr}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, fr: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="sub-ar"
                    placeholder="المدرسة الابتدائية"
                    value={subcategoryForm.ar}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, ar: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-semibold mb-3 block">Keywords (comma-separated)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sub-keywords-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="sub-keywords-en"
                    placeholder="elementary, children"
                    value={subcategoryForm.keywords.en}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, en: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-keywords-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="sub-keywords-fr"
                    placeholder="primaire, enfants"
                    value={subcategoryForm.keywords.fr}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, fr: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="sub-keywords-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="sub-keywords-ar"
                    placeholder="ابتدائي، أطفال"
                    value={subcategoryForm.keywords.ar}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, ar: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setAddSubcategoryDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory} className="min-w-24">Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={editSubcategoryDialog} onOpenChange={setEditSubcategoryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl">Edit Subcategory</DialogTitle>
            <DialogDescription>Update subcategory information and multilingual content</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Subcategory Key (read-only)</Label>
              <Input value={subcategoryForm.key} disabled className="h-11 bg-muted" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-3 block">Subcategory Names</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-sub-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="edit-sub-en"
                    value={subcategoryForm.en}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, en: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sub-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="edit-sub-fr"
                    value={subcategoryForm.fr}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, fr: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sub-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="edit-sub-ar"
                    value={subcategoryForm.ar}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, ar: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-semibold mb-3 block">Keywords (comma-separated)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-sub-keywords-en" className="text-xs text-muted-foreground mb-2 block">English</Label>
                  <Input
                    id="edit-sub-keywords-en"
                    value={subcategoryForm.keywords.en}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, en: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sub-keywords-fr" className="text-xs text-muted-foreground mb-2 block">French</Label>
                  <Input
                    id="edit-sub-keywords-fr"
                    value={subcategoryForm.keywords.fr}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, fr: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sub-keywords-ar" className="text-xs text-muted-foreground mb-2 block">Arabic</Label>
                  <Input
                    id="edit-sub-keywords-ar"
                    value={subcategoryForm.keywords.ar}
                    onChange={(e) =>
                      setSubcategoryForm({
                        ...subcategoryForm,
                        keywords: { ...subcategoryForm.keywords, ar: e.target.value },
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setEditSubcategoryDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button onClick={handleUpdateSubcategory} className="min-w-24">Update Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Dialog */}
      <Dialog open={deleteSubcategoryDialog} onOpenChange={setDeleteSubcategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Delete Subcategory</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <strong className="text-foreground">{selectedSubcategory?.en}</strong> from{" "}
              <strong className="text-foreground">{selectedDomain?.en}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setDeleteSubcategoryDialog(false)} className="min-w-24">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubcategory} className="min-w-24">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
