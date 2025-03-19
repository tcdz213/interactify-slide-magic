
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface JobApplication {
  id: number;
  center: string;
  position: string;
  status: string;
  date: string;
}

interface TeacherJobApplicationsProps {
  applications: JobApplication[];
}

export const TeacherJobApplications = ({ applications }: TeacherJobApplicationsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Job Applications</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Center</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {applications.map((application) => (
              <tr key={application.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{application.center}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{application.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={application.status === "Applied" ? "secondary" : "default"}>
                    {application.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{application.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
