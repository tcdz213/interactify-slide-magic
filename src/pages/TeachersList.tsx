import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TeacherCard, Teacher } from "@/components/teachers/TeacherCard";
import { TeacherFilter } from "@/components/teachers/TeacherFilter";
import { FilterState } from "@/components/filters/types";

// Mock data for teachers
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    avatar: "/placeholder.svg",
    role: "Mathematics Professor",
    specialties: ["Calculus", "Statistics", "Algebra"],
    experience: "15+ years",
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 75,
    availability: "Weekdays & Evenings",
    bio: "Dr. Johnson has been teaching mathematics at university level for over 15 years, specializing in making complex concepts accessible to students of all levels.",
    education: "Ph.D. in Mathematics, Stanford University",
    contact: {
      email: "sarah.johnson@example.com"
    },
    certifications: ["Certified Mathematics Educator", "Advanced Teaching Certification"]
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "/placeholder.svg",
    role: "Software Engineering Instructor",
    specialties: ["Web Development", "JavaScript", "React", "Node.js"],
    experience: "8 years",
    location: "New York, NY",
    rating: 4.8,
    reviewCount: 98,
    hourlyRate: 90,
    availability: "Flexible Hours",
    bio: "Former senior engineer at Google, now dedicated to helping students master modern web development technologies with hands-on project-based learning."
  },
  {
    id: "3",
    name: "Emily Davis",
    avatar: "/placeholder.svg",
    role: "Language Teacher",
    specialties: ["Spanish", "French", "ESL"],
    experience: "10 years",
    location: "Chicago, IL",
    rating: 4.7,
    reviewCount: 85,
    hourlyRate: 50,
    availability: "Mornings & Weekends"
  },
  {
    id: "4",
    name: "Professor James Wilson",
    avatar: "/placeholder.svg",
    role: "Physics & Engineering Instructor",
    specialties: ["Physics", "Electrical Engineering", "Robotics"],
    experience: "20+ years",
    location: "Boston, MA",
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 85,
    availability: "Weekday Afternoons"
  },
  {
    id: "5",
    name: "Sophia Rodriguez",
    avatar: "/placeholder.svg",
    role: "Art & Design Instructor",
    specialties: ["Digital Art", "Illustration", "UI/UX Design"],
    experience: "7 years",
    location: "Los Angeles, CA",
    rating: 4.6,
    reviewCount: 67,
    hourlyRate: 65,
    availability: "Evenings & Weekends"
  },
  {
    id: "6",
    name: "David Thompson",
    avatar: "/placeholder.svg",
    role: "Business Coach",
    specialties: ["Marketing", "Entrepreneurship", "Finance"],
    experience: "12 years",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 95,
    availability: "By Appointment"
  }
];

const TeachersList = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(mockTeachers);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFilterChange = (filters: FilterState) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    // For now, we'll just simulate filtering locally
    setTimeout(() => {
      let filtered = [...teachers];
      
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(teacher => 
          teacher.name.toLowerCase().includes(query) || 
          teacher.specialties.some(s => s.toLowerCase().includes(query)) ||
          teacher.role.toLowerCase().includes(query)
        );
      }
      
      // Filter by category (treating as specialty)
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(teacher => {
          switch(filters.category) {
            case 'programming':
              return teacher.specialties.some(s => 
                ['Web Development', 'JavaScript', 'React', 'Node.js', 'Python'].includes(s)
              );
            case 'language':
              return teacher.specialties.some(s => 
                ['Spanish', 'French', 'ESL', 'English', 'German'].includes(s)
              );
            case 'fitness':
              return teacher.specialties.some(s => 
                ['Yoga', 'Fitness', 'Health', 'Nutrition', 'Personal Training'].includes(s)
              );
            // Add more categories as needed
            default:
              return true;
          }
        });
      }
      
      // Filter by location
      if (filters.location && filters.location !== 'all') {
        const locationMap: {[key: string]: string} = {
          'san_francisco': 'San Francisco, CA',
          'new_york': 'New York, NY',
          'chicago': 'Chicago, IL',
          'austin': 'Austin, TX',
          'seattle': 'Seattle, WA',
          'portland': 'Portland, OR',
        };
        filtered = filtered.filter(teacher => 
          teacher.location === locationMap[filters.location]
        );
      }
      
      // Filter by rating
      if (filters.rating && filters.rating !== 'any') {
        const minRating = parseFloat(filters.rating);
        filtered = filtered.filter(teacher => teacher.rating >= minRating);
      }
      
      // Filter by price range
      if (filters.priceRange && filters.priceRange.length > 0) {
        const [min, max] = filters.priceRange;
        filtered = filtered.filter(teacher => 
          teacher.hourlyRate >= min && teacher.hourlyRate <= max
        );
      }
      
      // Sort results
      if (filters.sort) {
        switch(filters.sort) {
          case 'rating_high':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'price_low':
            filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
            break;
          case 'price_high':
            filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
            break;
          // Keep 'featured' as default order (no sorting needed)
        }
      }
      
      setFilteredTeachers(filtered);
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Teacher</h1>
            <p className="text-muted-foreground">
              Browse through our qualified instructors and find the right match for your learning goals
            </p>
          </div>
          
          <TeacherFilter onFilterChange={handleFilterChange} />
          
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No teachers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters to find more results
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeachersList;
