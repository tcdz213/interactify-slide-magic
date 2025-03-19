
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for bookings
const mockBookings = [
  { 
    id: 1, 
    centerName: "Tech Training Hub", 
    studentName: "John Smith", 
    course: "Web Development Fundamentals", 
    date: "2023-11-15", 
    status: "pending" 
  },
  { 
    id: 2, 
    centerName: "Tech Training Hub", 
    studentName: "Sarah Johnson", 
    course: "UX Design Principles", 
    date: "2023-11-18", 
    status: "approved" 
  },
  { 
    id: 3, 
    centerName: "Digital Skills Academy", 
    studentName: "Michael Brown", 
    course: "Data Science Basics", 
    date: "2023-11-20", 
    status: "pending" 
  },
  { 
    id: 4, 
    centerName: "Digital Skills Academy", 
    studentName: "Emily Davis", 
    course: "Mobile App Development", 
    date: "2023-11-25", 
    status: "rejected" 
  },
];

export const useBookings = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const { toast } = useToast();

  const handleBookingAction = (id: number, status: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    );
    
    setBookings(updatedBookings);
    
    toast({
      title: `Booking ${status}`,
      description: `The booking has been ${status}.`,
    });
  };

  return {
    bookings,
    handleBookingAction
  };
};
