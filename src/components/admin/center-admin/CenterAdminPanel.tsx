
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CentersList from "./CentersList";
import BookingRequests from "./BookingRequests";

const CenterAdminPanel = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Center Administration</h2>
      
      <Tabs defaultValue="centers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="centers">My Centers</TabsTrigger>
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
        </TabsList>
        
        {/* Centers Tab */}
        <TabsContent value="centers" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <CentersList />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <BookingRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CenterAdminPanel;
