
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Users, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sponsors from "@/components/Sponsors";
import { coursesData } from "@/components/courses";
import { BookingModal } from "@/components/BookingModal";
import { toast } from "sonner";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API fetch with delay
    setIsLoading(true);
    setTimeout(() => {
      const foundCourse = coursesData.find(c => c.id === parseInt(id || "0"));
      setCourse(foundCourse);
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewCenter = () => {
    if (course) {
      navigate(`/center/${course.centerId}`);
    }
  };

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container-custom">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-muted rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
                  <div className="h-32 bg-muted rounded mb-6"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-6"></div>
                </div>
                <div>
                  <div className="h-64 bg-muted rounded-xl mb-4"></div>
                  <div className="h-10 bg-muted rounded w-full mb-4"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Sponsors />
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container-custom">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
              <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/discover')}>
                Browse All Courses
              </Button>
            </div>
          </div>
        </main>
        <Sponsors />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <Button 
            variant="ghost" 
            className="mb-6 hover:bg-transparent hover:text-primary" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>

          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <img 
              src={course.image} 
              alt={course.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <Badge className="bg-primary text-white mb-2">
                {course.category}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{course.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1.5" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground ml-1">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>Max 12 students</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Flexible schedule</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                <p className="text-muted-foreground">
                  This is an expanded description that would contain more details about the course curriculum, 
                  learning objectives, and what students can expect to achieve. In a real application, this 
                  would contain comprehensive information about the course structure, modules, and learning path.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <li key={item} className="flex items-start">
                      <BookOpen className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Key learning outcome {item} for this professional course</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Basic understanding of the subject</li>
                  <li>Commitment to attend all scheduled sessions</li>
                  <li>Willingness to participate in group activities</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary">{course.price}</div>
                  <p className="text-muted-foreground">Full course fee</p>
                </div>

                <Button 
                  className="w-full mb-4" 
                  size="lg"
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>
                
                <div 
                  className="flex items-center p-4 bg-muted rounded-lg mb-4 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={handleViewCenter}
                >
                  <div className="mr-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{course.centerName}</h3>
                    <p className="text-sm text-muted-foreground">{course.centerLocation}</p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  Classes are held both online and in-person at the center location
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Sponsors />
      <Footer />
      
      {course && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          centerName={course.centerName}
          courses={[
            {
              name: course.name,
              price: course.price,
              duration: course.duration
            }
          ]}
        />
      )}
    </div>
  );
};

export default CourseDetails;
