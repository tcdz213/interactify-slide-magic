
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, MapPin, Clock, DollarSign, Filter, Search, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Mock data for teacher listings
const mockTeacherListings = [
  {
    id: 1,
    title: "Senior JavaScript Instructor",
    center: "Tech Training Hub",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$70,000 - $90,000",
    posted: "2023-10-15",
    applications: 12,
    skills: ["JavaScript", "React", "Node.js"],
    category: "Programming"
  },
  {
    id: 2,
    title: "Python Programming Teacher",
    center: "Code Academy",
    location: "Remote",
    type: "Part-time",
    salary: "$40 - $60 per hour",
    posted: "2023-10-10",
    applications: 8,
    skills: ["Python", "Django", "Data Science"],
    category: "Programming"
  },
  {
    id: 3,
    title: "Web Development Instructor",
    center: "Digital Skills Institute",
    location: "New York, NY",
    type: "Contract",
    salary: "$50 - $70 per hour",
    posted: "2023-10-05",
    applications: 15,
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    category: "Programming"
  },
  {
    id: 4,
    title: "Fitness Trainer",
    center: "Wellness Center",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$45,000 - $60,000",
    posted: "2023-10-12",
    applications: 6,
    skills: ["Fitness Assessment", "Nutrition", "Strength Training"],
    category: "Fitness & Health"
  },
  {
    id: 5,
    title: "Language Teacher - Spanish",
    center: "Global Languages Academy",
    location: "Miami, FL",
    type: "Part-time",
    salary: "$30 - $45 per hour",
    posted: "2023-10-08",
    applications: 10,
    skills: ["Spanish", "Language Instruction", "Curriculum Development"],
    category: "Language Learning"
  },
  {
    id: 6,
    title: "Art Instructor",
    center: "Creative Arts Studio",
    location: "Austin, TX",
    type: "Contract",
    salary: "$35 - $50 per hour",
    posted: "2023-10-03",
    applications: 9,
    skills: ["Painting", "Drawing", "Art History"],
    category: "Arts & Design"
  }
];

const TeacherListings = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Filter logic
  const filteredListings = mockTeacherListings.filter(listing => {
    // Search query filter
    if (searchQuery && 
        !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !listing.center.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && listing.category !== categoryFilter) {
      return false;
    }
    
    // Location filter
    if (locationFilter !== "all" && 
        !listing.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== "all" && listing.type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">{t("teacherListings.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("teacherListings.subtitle")}</p>
        </div>
        
        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("teacherListings.searchPlaceholder")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("teacherListings.categoryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("teacherListings.allCategories")}</SelectItem>
              <SelectItem value="Programming">{t("teacherListings.programming")}</SelectItem>
              <SelectItem value="Fitness & Health">{t("teacherListings.fitness")}</SelectItem>
              <SelectItem value="Language Learning">{t("teacherListings.language")}</SelectItem>
              <SelectItem value="Arts & Design">{t("teacherListings.arts")}</SelectItem>
              <SelectItem value="Professional Skills">{t("teacherListings.professional")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("teacherListings.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("teacherListings.allTypes")}</SelectItem>
              <SelectItem value="Full-time">{t("teacherListings.fullTime")}</SelectItem>
              <SelectItem value="Part-time">{t("teacherListings.partTime")}</SelectItem>
              <SelectItem value="Contract">{t("teacherListings.contract")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results */}
        <div className="mt-4">
          <h2 className="text-lg font-medium mb-4">
            {filteredListings.length} {filteredListings.length === 1 
              ? t("teacherListings.result") 
              : t("teacherListings.results")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <Badge>{listing.type}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <GraduationCap className="h-4 w-4" />
                    {listing.center}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Posted {listing.posted}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {listing.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 mt-auto">
                  <Button variant="default" className="w-full" asChild>
                    <a href={`/teacher-job-listings/${listing.id}`}>
                      {t("teacherListings.viewDetails")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherListings;
