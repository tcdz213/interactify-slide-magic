import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { clientTypeSchema, type ClientTypeFormValues, type ClientType } from "./clientType.schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientType?: ClientType | null;
  onSave: (values: ClientTypeFormValues) => void;
}

export function ClientTypeForm({ open, onOpenChange, clientType, onSave }: ClientTypeFormProps) {
  const { t } = useTranslation();
  const form = useForm<ClientTypeFormValues>({
    resolver: zodResolver(clientTypeSchema),
    defaultValues: {
      name: clientType?.name ?? "",
      description: clientType?.description ?? "",
      isDefault: clientType?.isDefault ?? false,
      status: clientType?.status ?? "active",
    },
  });

  const handleSubmit = (values: ClientTypeFormValues) => {
    onSave(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{clientType ? t("clientTypes.form.editTitle") : t("clientTypes.form.createTitle")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("clientTypes.form.name")}</FormLabel>
                <FormControl><Input placeholder={t("clientTypes.form.namePlaceholder")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("clientTypes.form.description")}</FormLabel>
                <FormControl><Textarea placeholder={t("clientTypes.form.descPlaceholder")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex items-center gap-6">
              <FormField control={form.control} name="isDefault" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="cursor-pointer">{t("clientTypes.form.isDefault")}</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("clientTypes.form.status")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t("clientTypes.form.active")}</SelectItem>
                      <SelectItem value="inactive">{t("clientTypes.form.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("clientTypes.form.cancel")}</Button>
              <Button type="submit">{clientType ? t("clientTypes.form.save") : t("clientTypes.form.create")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
