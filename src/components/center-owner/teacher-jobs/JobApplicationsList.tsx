
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Search, Filter, ArrowUpDown, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { mockJobApplications } from './mockData';

interface JobApplicationsListProps {
  jobId?: number;
}

export const JobApplicationsList = ({ jobId }: JobApplicationsListProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  const filteredApplications = mockJobApplications
    .filter(app => {
      // Filter by job ID if provided
      if (jobId && app.position !== mockJobApplications.find(j => j.id === jobId)?.position) {
        return false;
      }
      
      // Filter by search query (name or position)
      if (searchQuery && !app.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !app.position.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== "all" && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date (recent first)
      if (sortBy === "recent") {
        return new Date(b.applied).getTime() - new Date(a.applied).getTime();
      }
      // Sort by rating (highest first)
      else if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return 0;
    });
  
  const handleStatusChange = (applicationId: number, status: string) => {
    toast({
      title: "Application Status Updated",
      description: `The application status has been set to ${status}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Teacher Applications</CardTitle>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or position..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Applied
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center">
                    Rating
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{application.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {application.applied}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-1">{application.rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          application.status === "New" 
                            ? "default" 
                            : application.status === "Rejected" 
                              ? "destructive" 
                              : "secondary"
                        }
                      >
                        {application.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(application.id, "Reviewed")}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleStatusChange(application.id, "Approved")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleStatusChange(application.id, "Rejected")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No applications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
