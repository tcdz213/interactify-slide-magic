
import React from "react";
import { Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookings } from "./useBookings";

const BookingRequests = () => {
  const { bookings, handleBookingAction } = useBookings();

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Booking Requests</h3>
      
      <div className="border rounded-md">
        <div className="grid grid-cols-6 p-4 border-b font-medium">
          <div>Student</div>
          <div>Course</div>
          <div>Center</div>
          <div>Date</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No booking requests found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="grid grid-cols-6 p-4 border-b last:border-0 items-center">
              <div>{booking.studentName}</div>
              <div>{booking.course}</div>
              <div>{booking.centerName}</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {booking.date}
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

export default BookingRequests;
