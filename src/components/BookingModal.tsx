
import { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useCountry } from "@/contexts/CountryContext";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName: string;
  courses: { name: string; price: string; duration: string }[];
  center?: any; // Add optional center prop for compatibility
}

// Create a dynamic schema based on country
const createFormSchema = (countryCode: string) => {
  const baseSchema = {
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(6, { message: "Please enter a valid phone number." }),
    date: z.date({ required_error: "Please select a date." }),
    time: z.string({ required_error: "Please select a time." }),
    course: z.string({ required_error: "Please select a course." }),
  };

  // Add country-specific fields
  if (countryCode === 'SA' || countryCode === 'AE' || countryCode === 'DZ') {
    return z.object({
      ...baseSchema,
      nationalId: z.string().min(5, { message: "Please enter a valid ID number." }),
    });
  }

  if (countryCode === 'DE') {
    return z.object({
      ...baseSchema,
      taxId: z.string().min(5, { message: "Please enter a valid tax ID." }),
    });
  }

  return z.object(baseSchema);
};

export function BookingModal({ isOpen, onClose, centerName, courses, center }: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentCountry } = useCountry();
  const { t } = useTranslation();

  // Set available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  // Create dynamic form schema based on country
  const formSchema = createFormSchema(currentCountry.code);
  
  // Use any type to handle dynamic schema fields
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      course: courses.length > 0 ? courses[0].name : "",
      ...(currentCountry.code === 'SA' || currentCountry.code === 'AE' || currentCountry.code === 'DZ' ? { nationalId: "" } : {}),
      ...(currentCountry.code === 'DE' ? { taxId: "" } : {}),
    },
  });

  function onSubmit(values: any) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Booking submitted:", values);
      console.log("Country:", currentCountry.code);
      
      // Show success toast
      toast({
        title: t('booking.successTitle', 'Booking Successful!'),
        description: t('booking.successDescription', {
          course: values.course,
          date: format(values.date, "MMMM d, yyyy"),
          time: values.time
        }),
      });
      
      // Reset form and close modal
      form.reset();
      onClose();
      setIsSubmitting(false);
    }, 1500);
  }

  // Determine if we need to render country-specific fields
  const renderCountryFields = () => {
    if (currentCountry.code === 'SA' || currentCountry.code === 'AE' || currentCountry.code === 'DZ') {
      return (
        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.nationalId', 'National ID')}</FormLabel>
              <FormControl>
                <Input placeholder={t('booking.nationalIdPlaceholder', 'Enter your national ID number')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    if (currentCountry.code === 'DE') {
      return (
        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('booking.taxId', 'Tax ID (Steuer-ID)')}</FormLabel>
              <FormControl>
                <Input placeholder={t('booking.taxIdPlaceholder', 'Enter your tax ID')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('booking.title', {country: currentCountry.name})}</DialogTitle>
          <DialogDescription>
            {t('booking.description', {centerName: centerName})}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('booking.name', 'Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('booking.namePlaceholder', 'Your full name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('booking.email', 'Email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('booking.emailPlaceholder', 'your.email@example.com')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('booking.phone', 'Phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('booking.phonePlaceholder', 'Your phone number')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Render country-specific fields */}
            {renderCountryFields()}
            
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('booking.course', 'Course/Session')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('booking.coursePlaceholder', 'Select a course')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course, index) => (
                        <SelectItem key={index} value={course.name}>
                          {course.name} ({course.price} - {course.duration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('booking.date', 'Date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('booking.datePlaceholder', 'Pick a date')}</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('booking.time', 'Time')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('booking.timePlaceholder', 'Select a time')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('booking.booking', 'Booking...') : t('booking.bookSession', 'Book Session')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
