import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { MessageModal } from "@/components/MessageModal";
import { InstructorProfileModal } from "@/components/InstructorProfileModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Check,
  Plus,
  Send,
  ExternalLink,
} from "lucide-react";
import InstagramStoryCard from "@/components/centers/InstagramStoryCard";
import InstagramStyleCard from "@/components/centers/InstagramStyleCard";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Sponsors from "@/components/Sponsors";
import ScrollableGallery from "@/components/centers/ScrollableGallery";
import { Center } from "@/components/centers/types";

const getCenterById = (id: number) => {
  const centers = [
    {
      id: 1,
      name: "Elite Fitness Academy",
      category: "Fitness & Health",
      rating: 4.9,
      reviews: 128,
      location: "San Francisco, CA",
      status: "active",
      verified: true,
      address: "123 Fitness Ave, San Francisco, CA 94110",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      ],
      price: "$45/session",
      currency: "USD",
      featured: true,
      description:
        "State-of-the-art fitness facility with expert trainers specializing in strength, cardio, and flexibility programs. Our mission is to help clients achieve their fitness goals through personalized training and nutrition plans.",
      longDescription:
        "Elite Fitness Academy offers a comprehensive range of fitness services designed to transform your health and wellbeing. Our certified trainers bring years of experience to create customized workout plans that match your specific goals and fitness level. The facility includes the latest equipment for strength training, cardio workouts, and flexibility exercises.\n\nWe pride ourselves on creating a supportive and motivating environment where clients of all fitness levels feel comfortable. Our small group classes promote camaraderie while ensuring each participant receives individual attention. For those preferring one-on-one guidance, our personal training sessions provide focused instruction and accountability.\n\nBeyond physical training, we offer nutrition counseling to complement your workout routine. Our holistic approach ensures you achieve sustainable results that improve not just your physical appearance but overall health metrics.",
      features: ["certified", "in_person", "equipment"],
      amenities: [
        "Showers",
        "Locker Rooms",
        "Parking",
        "Nutrition Bar",
        "Towel Service",
      ],
      courses: [
        { name: "Personal Training", price: "$60/session", duration: "60 min" },
        {
          name: "Group Fitness Class",
          price: "$25/session",
          duration: "45 min",
        },
        {
          name: "Nutrition Consultation",
          price: "$85/session",
          duration: "90 min",
        },
        {
          name: "Monthly Membership",
          price: "$120/month",
          duration: "Unlimited",
        },
      ],
      instructors: [
        {
          name: "Sarah Johnson",
          role: "Head Trainer",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          bio: "Sarah has over 10 years of experience in personal training and nutrition coaching. She specializes in weight management and functional training for all fitness levels.",
          specialties: [
            "Weight Loss",
            "Strength Training",
            "Nutrition Planning",
          ],
          experience: "10+ years in fitness industry",
          education:
            "B.S. in Exercise Science, Certified Personal Trainer (NASM)",
          contact: {
            phone: "(415) 555-8765",
            email: "sarah@elitefitness.example",
          },
          schedule: "Monday-Friday: 7am-3pm",
          certifications: [
            "NASM Certified Personal Trainer",
            "Precision Nutrition Level 2",
            "TRX Suspension Training",
          ],
          rating: 4.9,
        },
        {
          name: "Michael Chen",
          role: "Nutrition Specialist",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          bio: "Michael specializes in creating customized nutrition plans that complement training regimens, helping clients maximize their results through proper diet.",
          specialties: [
            "Sports Nutrition",
            "Meal Planning",
            "Weight Management",
          ],
          experience: "8 years as a nutrition consultant",
          education: "M.S. in Nutritional Science",
          contact: {
            email: "michael@elitefitness.example",
          },
          schedule: "Tuesday-Saturday: 10am-6pm",
          certifications: [
            "Registered Dietitian",
            "Sports Nutrition Specialist",
          ],
          rating: 4.8,
        },
      ],
      contactInfo: {
        phone: "(415) 555-1234",
        email: "info@elitefitness.example",
        website: "www.elitefitness.example",
        hours: "Monday-Friday: 6am-9pm, Weekends: 8am-6pm",
      },
      reviewList: [
        {
          user: "John D.",
          rating: 5,
          date: "2023-10-15",
          comment:
            "Incredible facility with knowledgeable trainers. I've seen amazing results in just two months.",
        },
        {
          user: "Lisa M.",
          rating: 4,
          date: "2023-09-22",
          comment:
            "Great classes and equipment. The only reason for 4 stars is sometimes it gets crowded during peak hours.",
        },
        {
          user: "Robert A.",
          rating: 5,
          date: "2023-11-05",
          comment:
            "The nutrition guidance combined with training has completely transformed my health. Worth every penny!",
        },
      ],
    },
    {
      id: 2,
      name: "Tech Skills Institute",
      category: "Programming",
      rating: 4.8,
      reviews: 94,
      location: "Austin, TX",
      status: "active",
      verified: true,
      address: "456 Coding Blvd, Austin, TX 78701",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
        "https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      ],
      price: "$299/course",
      currency: "USD",
      featured: false,
      description:
        "Comprehensive programming bootcamp covering web development, mobile apps, and data science with hands-on projects.",
      longDescription:
        "Tech Skills Institute offers cutting-edge training in the most in-demand programming languages and frameworks. Our project-based curriculum emphasizes practical skills that employers are looking for in today's competitive tech market. From beginners taking their first steps in coding to experienced developers looking to upskill, our courses provide structured learning paths with real-world applications.\n\nOur online courses feature live instructor-led sessions combined with self-paced modules, allowing flexibility while maintaining accountability. Each course includes multiple projects that build your portfolio and demonstrate your capabilities to potential employers. Students receive personalized feedback on their code and have access to mentorship from industry professionals.\n\nWe maintain small class sizes to ensure each student receives ample attention and support. Our instructors are experienced developers who bring practical knowledge from their work in the field, providing insights beyond just syntax and theory.",
      features: ["online", "certified", "group"],
      amenities: [
        "24/7 Support",
        "Project Reviews",
        "Career Counseling",
        "Job Placement Assistance",
      ],
      courses: [
        {
          name: "Full-Stack Web Development",
          price: "$1,499",
          duration: "12 weeks",
        },
        {
          name: "Data Science Fundamentals",
          price: "$999",
          duration: "8 weeks",
        },
        {
          name: "Mobile App Development",
          price: "$1,299",
          duration: "10 weeks",
        },
        { name: "Python for Beginners", price: "$499", duration: "4 weeks" },
      ],
      instructors: [
        {
          name: "David Wilson",
          role: "Lead Developer",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          bio: "David has worked as a software engineer for 15 years before transitioning to teaching. He specializes in full-stack development and has contributed to several open-source projects.",
          specialties: ["JavaScript", "React", "Node.js", "MongoDB"],
          experience: "15+ years in software development, 5 years teaching",
          education: "M.S. in Computer Science",
          contact: {
            email: "david@techskills.example",
          },
          schedule: "Monday, Wednesday, Friday: Full-Stack Course",
          certifications: [
            "AWS Certified Developer",
            "MongoDB Certified Developer",
          ],
          rating: 4.9,
        },
        {
          name: "Emma Rodriguez",
          role: "Data Science Expert",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          bio: "Emma combines academic research with industry experience to teach practical data science skills. Her focus is on making complex statistical concepts accessible to beginners.",
          specialties: [
            "Python",
            "Machine Learning",
            "Data Visualization",
            "Statistical Analysis",
          ],
          experience: "8 years in data science roles at tech companies",
          education: "Ph.D. in Statistics, B.S. in Computer Science",
          contact: {
            phone: "(512) 555-9876",
            email: "emma@techskills.example",
          },
          schedule: "Tuesday, Thursday: Data Science Course",
          certifications: [
            "TensorFlow Developer Certificate",
            "IBM Data Science Professional",
          ],
          rating: 4.7,
        },
      ],
      contactInfo: {
        phone: "(512) 555-6789",
        email: "courses@techskills.example",
        website: "www.techskills.example",
        hours: "Support Hours: Monday-Friday: 9am-8pm, Weekends: 10am-4pm",
      },
      reviewList: [
        {
          user: "Sarah T.",
          rating: 5,
          date: "2023-11-10",
          comment:
            "The full-stack course was challenging but incredibly rewarding. I landed a junior developer role before even finishing!",
        },
        {
          user: "Mark R.",
          rating: 4,
          date: "2023-10-05",
          comment:
            "Great curriculum and instructors. Would give 5 stars if the platform was a bit more intuitive.",
        },
        {
          user: "Priya K.",
          rating: 5,
          date: "2023-09-18",
          comment:
            "The project-based approach really helps solidify concepts. Their career services are excellent too.",
        },
      ],
    },
  ];

  return centers.find((center) => center.id === id);
};

const CenterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { toast } = useToast();
  const [relatedCenters, setRelatedCenters] = useState<Center[]>([]);

  useEffect(() => {
    if (id) {
      const centerId = parseInt(id, 10);
      const centerData = getCenterById(centerId);

      if (centerData) {
        setCenter(centerData);
        
        const allCenters = [
          getCenterById(1),
          getCenterById(2),
        ].filter(c => c && c.id !== centerId) as any[];
        
        const relatedCentersData = allCenters.map(c => ({
          ...c,
          status: c.status || 'active',
          verified: c.verified !== undefined ? c.verified : false,
          currency: c.currency || 'USD',
        }));
        
        setRelatedCenters(relatedCentersData);
      }
      setLoading(false);
    }
  }, [id]);

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const openMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  const openInstructorModal = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsInstructorModalOpen(true);
  };

  const closeInstructorModal = () => {
    setIsInstructorModalOpen(false);
  };

  const handleAddReview = () => {
    setIsAddingReview(true);
  };

  const handleCancelReview = () => {
    setIsAddingReview(false);
    setNewReview({ rating: 5, comment: "" });
  };

  const handleRatingChange = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleReviewSubmit = () => {
    if (!newReview.comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a review comment",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const review = {
      user: "You",
      rating: newReview.rating,
      date: currentDate,
      comment: newReview.comment,
    };

    const updatedCenter = {
      ...center,
      reviewList: [review, ...center.reviewList],
      reviews: center.reviews + 1,
      rating: parseFloat(
        (
          (center.rating * center.reviews + newReview.rating) /
          (center.reviews + 1)
        ).toFixed(1)
      ),
    };

    setCenter(updatedCenter);
    setIsAddingReview(false);
    setNewReview({ rating: 5, comment: "" });

    toast({
      title: "Success",
      description:
        "Your review has been submitted. Thank you for your feedback!",
    });
  };

  const openBookingModalForCourse = (course: any) => {
    setSelectedCourse(course);
    setIsBookingModalOpen(true);
  };

  const handleViewCourseDetails = (courseName: string) => {
    const courseId = center.courses.findIndex((c: any) => c.name === courseName) + 1;
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container-custom">
            <div className="flex justify-center items-center h-96">
              <div className="animate-pulse">Loading...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container-custom">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                Training Center Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find the training center you're looking for.
              </p>
              <Button onClick={() => navigate("/discover")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discover
              </Button>
            </div>
          </div>
        </main>
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
            className="mb-6 -ml-2"
            onClick={() => navigate("/discover")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Results</span>
          </Button>

          <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
            <img
              src={center.image}
              alt={center.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center mb-2">
                <Badge className="bg-primary/90 text-white border-none">
                  {center.category}
                </Badge>
                {center.featured && (
                  <Badge className="ml-2 bg-amber-500/90 text-white border-none">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {center.name}
              </h1>
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{center.address}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>
                    {center.rating} ({center.reviews} reviews)
                  </span>
                </div>
                <div className="text-lg font-semibold">{center.price}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {center.gallery.map((image: string, index: number) => (
              <div key={index} className="rounded-lg overflow-hidden h-48">
                <img
                  src={image}
                  alt={`${center.name} gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="instructors">Instructors</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    About {center.name}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line mb-6">
                    {center.longDescription || center.description}
                  </p>

                  <h3 className="text-xl font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {center.features.map((feature: string) => {
                      const featureLabels: Record<string, string> = {
                        certified: "Certified Trainers",
                        online: "Online Courses",
                        in_person: "In-Person Training",
                        group: "Group Sessions",
                        private: "Private Sessions",
                        equipment: "Equipment Provided",
                        accessible: "Accessible Facilities",
                        parking: "Parking Available",
                      };
                      return (
                        <div key={feature} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{featureLabels[feature]}</span>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {center.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Available Courses
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {center.courses.map((course: any, index: number) => (
                      <Card key={index} className="border border-border">
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">
                            {course.name}
                          </h3>
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="font-medium text-primary">
                              {course.price}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              className="w-1/2 group"
                              onClick={() => handleViewCourseDetails(course.name)}
                            >
                              <span>View Details</span>
                              <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button 
                              className="w-1/2"
                              onClick={() => openBookingModalForCourse(course)}
                            >
                              <span>Book Now</span>
                              <Calendar className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="instructors" className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Our Instructors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {center.instructors.map(
                      (instructor: any, index: number) => (
                        <Card
                          key={index}
                          className="overflow-hidden border-0 shadow-sm"
                        >
                          <div className="flex">
                            <div className="w-1/3">
                              <img
                                src={instructor.image}
                                alt={instructor.name}
                                className="w-full h-full object-cover aspect-square"
                              />
                            </div>
                            <CardContent className="p-4 w-2/3">
                              <h3 className="font-semibold text-lg">
                                {instructor.name}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-2">
                                {instructor.role}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => openInstructorModal(instructor)}
                              >
                                View Profile
                              </Button>
                            </CardContent>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Reviews</h2>
                    <div className="flex items-center bg-primary/5 text-primary font-medium px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span>
                        {center.rating} • {center.reviews} reviews
                      </span>
                    </div>
                  </div>

                  {!isAddingReview ? (
                    <Button
                      onClick={handleAddReview}
                      className="mb-6"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Review
                    </Button>
                  ) : (
                    <Card className="mb-6 border border-border">
                      <CardContent className="p-5">
                        <h3 className="font-medium mb-3">Write Your Review</h3>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Rating
                          </p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleRatingChange(rating)}
                                className="mr-1"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    rating <= newReview.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Your Review
                          </p>
                          <Textarea
                            placeholder="Share your experience with this training center..."
                            value={newReview.comment}
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                comment: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 mt-2">
                          <Button
                            variant="outline"
                            onClick={handleCancelReview}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleReviewSubmit}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    {center.reviewList.map((review: any, index: number) => (
                      <Card key={index} className="border border-border">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{review.user}</h4>
                            <div className="flex items-center">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 text-sm">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p>{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button variant="outline">Load More Reviews</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card className="border border-border sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Contact Information
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{center.contactInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{center.contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p>{center.contactInfo.website}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hours</p>
                        <p className="text-sm">{center.contactInfo.hours}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mb-3" onClick={openBookingModal}>
                    Book a Session
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={openMessageModal}
                  >
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">You Might Also Like</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {relatedCenters.map((relatedCenter) => (
                <div key={relatedCenter.id} className="snap-start flex-shrink-0">
                  <InstagramStyleCard 
                    center={relatedCenter}
                    onViewDetails={(id) => navigate(`/center/${id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Sponsors />
      <Footer />

      {center && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          centerName={center.name}
          courses={selectedCourse ? [selectedCourse] : center.courses}
        />
      )}

      {center && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={closeMessageModal}
          centerName={center.name}
        />
      )}

      {selectedInstructor && (
        <InstructorProfileModal
          isOpen={isInstructorModalOpen}
          onClose={closeInstructorModal}
          instructor={selectedInstructor}
        />
      )}
    </div>
  );
};

export default CenterDetails;
