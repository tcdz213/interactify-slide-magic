
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Trash2 } from "lucide-react";

export const jobListingsColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Position",
  },
  {
    accessorKey: "center",
    header: "Center",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "Full-time" ? "default" : type === "Part-time" ? "secondary" : "outline"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
  },
  {
    accessorKey: "applications",
    header: "Applications",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "Active" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const jobApplicationsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Applicant",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "applied",
    header: "Applied Date",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center">
          {rating.toFixed(1)}
          <div className="ml-2 text-yellow-500">
            {"★".repeat(Math.floor(rating))}
            <span className="text-gray-300">{"★".repeat(5 - Math.floor(rating))}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      
      switch (status) {
        case "New":
          variant = "default";
          break;
        case "Reviewed":
          variant = "secondary";
          break;
        case "Interviewed":
          variant = "outline";
          break;
        case "Rejected":
          variant = "destructive";
          break;
      }
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
