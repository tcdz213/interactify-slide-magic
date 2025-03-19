
import React, { useState, useEffect } from "react";
import { Briefcase, UserCircle, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { TeacherJobListingsTab } from "@/components/teachers/TeacherJobListingsTab";
import { BrowseTeachersTab } from "@/components/teachers/BrowseTeachersTab";
import { TeacherProfileTab } from "@/components/teachers/TeacherProfileTab";
import { mockTeacherJobs } from "@/components/teachers/mockTeacherJobs";

const TeacherJobListings = () => {
  const [activeTab, setActiveTab] = useState("job-listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState(mockTeacherJobs);

  useEffect(() => {
    const filtered = mockTeacherJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.specialization.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        locationFilter === "all" || job.location === locationFilter;

      const matchesSpecialization =
        specializationFilter === "all" ||
        job.specialization === specializationFilter;

      const matchesExperience =
        experienceFilter === "all" || job.experience === experienceFilter;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSpecialization &&
        matchesExperience
      );
    });

    setFilteredJobs(filtered);
  }, [searchQuery, locationFilter, specializationFilter, experienceFilter]);

  const handleFilterChange = (filters: any) => {
    setSearchQuery(filters.searchQuery);
    setLocationFilter(filters.location);
    setSpecializationFilter(filters.specialization);
    setExperienceFilter(filters.experience);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Teaching Portal</h1>
            <Tabs
              defaultValue="job-listings"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid grid-cols-3 w-[400px]">
                  <TabsTrigger
                    value="job-listings"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Job Listings
                  </TabsTrigger>
                  <TabsTrigger
                    value="browse-teachers"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Browse Teachers
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    My Profile
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          {activeTab === "job-listings" && (
            <TeacherJobListingsTab
              filteredJobs={filteredJobs}
              handleFilterChange={handleFilterChange}
            />
          )}

          {activeTab === "browse-teachers" && <BrowseTeachersTab />}

          {activeTab === "profile" && <TeacherProfileTab />}
        </div>
      </main>
      <Sponsors />
      <Footer />
    </div>
  );
};

export default TeacherJobListings;
