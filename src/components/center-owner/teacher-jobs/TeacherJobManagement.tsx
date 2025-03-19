
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { NewJobDialog } from "./NewJobDialog";
import { jobListingsColumns, jobApplicationsColumns } from "./columns";
import { mockJobListings, mockJobApplications } from "./mockData";
import { JobApplicationsList } from "./JobApplicationsList";

export const TeacherJobManagement = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Job Management</h2>
        <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <NewJobDialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog} />
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="listings">Job Listings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Current Job Listings</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job listings..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={jobListingsColumns} data={mockJobListings} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <JobApplicationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
