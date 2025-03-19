
import React, { useState, useEffect } from "react";
import { TeacherBrowserCard } from "./TeacherBrowserCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Sliders } from "lucide-react";
import { mockTeachersList } from "../center-owner/teacher-jobs/mockData";

// Subject options 
const subjectOptions = [
  { value: "all", label: "All Subjects" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "react", label: "React" },
  { value: "mobile", label: "Mobile Development" },
  { value: "design", label: "UI/UX Design" },
  { value: "devops", label: "DevOps & Cloud" },
];

const locationOptions = [
  { value: "all", label: "All Locations" },
  { value: "san_francisco", label: "San Francisco, CA" },
  { value: "new_york", label: "New York, NY" },
  { value: "chicago", label: "Chicago, IL" },
  { value: "seattle", label: "Seattle, WA" },
  { value: "remote", label: "Remote" },
];

const experienceOptions = [
  { value: "all", label: "Any Experience" },
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5+", label: "5+ years" },
];

const availabilityOptions = [
  { value: "all", label: "Any Availability" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

export const TeacherBrowser = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [location, setLocation] = useState("all");
  const [experience, setExperience] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [filteredTeachers, setFilteredTeachers] = useState(mockTeachersList);
  const [showFilters, setShowFilters] = useState(false);

  const handleContactClick = (teacherId: number) => {
    toast({
      title: "Contact Request Sent",
      description: "The teacher will be notified of your interest.",
    });
  };

  useEffect(() => {
    const filtered = mockTeachersList.filter((teacher) => {
      // Search by name or specialization
      const matchesSearch =
        searchQuery === "" ||
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subjects.some(subj => 
          subj.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter by subject
      const matchesSubject =
        subject === "all" ||
        teacher.subjects.some(subj => 
          subj.toLowerCase().includes(subject.toLowerCase())
        );

      // Filter by location
      const matchesLocation =
        location === "all" ||
        teacher.location.toLowerCase().includes(
          location === "san_francisco" 
            ? "san francisco" 
            : location === "new_york"
              ? "new york"
              : location
        );

      // Filter by experience
      const matchesExperience =
        experience === "all" ||
        (experience === "5+" && teacher.experience.includes("5+")) ||
        (experience === "3-5" && teacher.experience.includes("3-5")) ||
        (experience === "1-2" && teacher.experience.includes("1-2"));

      // Filter by availability
      const matchesAvailability =
        availability === "all" ||
        teacher.availability.toLowerCase() === (
          availability === "full-time" 
            ? "full-time" 
            : availability === "part-time"
              ? "part-time"
              : availability
        );

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLocation &&
        matchesExperience &&
        matchesAvailability
      );
    });

    setFilteredTeachers(filtered);
  }, [searchQuery, subject, location, experience, availability]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search teachers by name, specialization or subjects..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Experience</label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Availability</label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {filteredTeachers.length} teachers found
            </div>
            {(subject !== "all" || location !== "all" || experience !== "all" || availability !== "all" || searchQuery !== "") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSubject("all");
                  setLocation("all");
                  setExperience("all");
                  setAvailability("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <TeacherBrowserCard 
              key={teacher.id} 
              teacher={teacher} 
              onContactClick={handleContactClick} 
            />
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No teachers found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
