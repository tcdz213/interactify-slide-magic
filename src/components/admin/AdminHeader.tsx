import { Badge } from "@/components/ui/badge";

export const AdminHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform management and analytics</p>
      </div>
      <Badge variant="secondary" className="w-fit">
        Admin Access
      </Badge>
    </div>
  );
};
