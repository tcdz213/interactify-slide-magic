
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for bookings
const initialBookings = [
  { 
    id: 1, 
    studentName: "John Smith", 
    course: "Web Development Fundamentals", 
    date: "2023-11-15", 
    time: "10:00 AM",
    center: "Tech Training Hub",
    status: "pending" 
  },
  { 
    id: 2, 
    studentName: "Sarah Johnson", 
    course: "UX Design Principles", 
    date: "2023-11-18", 
    time: "2:00 PM",
    center: "Tech Training Hub",
    status: "approved" 
  },
  { 
    id: 3, 
    studentName: "Michael Brown", 
    course: "Data Science Basics", 
    date: "2023-11-20", 
    time: "9:30 AM",
    center: "Digital Skills Academy",
    status: "pending" 
  },
  { 
    id: 4, 
    studentName: "Emily Davis", 
    course: "Mobile App Development", 
    date: "2023-11-25", 
    time: "3:30 PM",
    center: "Digital Skills Academy",
    status: "rejected" 
  },
];

const BookingsManagement = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [filteredBookings, setFilteredBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterBookings(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterBookings(searchTerm, status);
  };

  const filterBookings = (term: string, status: string) => {
    let filtered = bookings;
    
    if (term) {
      filtered = filtered.filter(booking => 
        booking.studentName.toLowerCase().includes(term.toLowerCase()) ||
        booking.course.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    setFilteredBookings(filtered);
  };

  const handleBookingAction = (id: number, status: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    );
    
    setBookings(updatedBookings);
    filterBookings(searchTerm, statusFilter);
    
    toast({
      title: `Booking ${status}`,
      description: `The booking has been ${status}.`,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-md">
        <div className="grid grid-cols-6 p-4 border-b font-medium">
          <div>Student</div>
          <div>Course</div>
          <div>Center</div>
          <div>Date & Time</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No booking requests found.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="grid grid-cols-6 p-4 border-b last:border-0 items-center">
              <div>{booking.studentName}</div>
              <div>{booking.course}</div>
              <div>{booking.center}</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {booking.date}, {booking.time}
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  booking.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() => handleBookingAction(booking.id, 'approved')}
                    >
                      <Check className="h-4 w-4 mr-1" /> 
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleBookingAction(booking.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1" /> 
                      Refuse
                    </Button>
                  </>
                )}
                {booking.status !== 'pending' && (
                  <span className="text-sm text-muted-foreground">
                    {booking.status === 'approved' ? 'Accepted' : 'Refused'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingsManagement;
