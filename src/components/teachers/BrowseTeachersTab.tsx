
import React, { useState } from "react";
import { TeacherBrowser } from "./TeacherBrowser";
import TeacherComparisonTable from "./TeacherComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, SplitSquareVertical } from "lucide-react";

export const BrowseTeachersTab = () => {
  const [activeTab, setActiveTab] = useState("browse");

  return (
    <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="browse" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Browse Teachers
        </TabsTrigger>
        <TabsTrigger value="compare" className="flex items-center gap-2">
          <SplitSquareVertical className="h-4 w-4" />
          Compare Teachers
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="browse">
        <TeacherBrowser />
      </TabsContent>
      
      <TabsContent value="compare">
        <TeacherComparisonTable />
      </TabsContent>
    </Tabs>
  );
};
