
import React, { useState, useEffect } from "react";
import { Briefcase, UserCircle, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import HeaderSection from "@/components/HeaderSection";
import SponsorsSection from "@/components/SponsorsSection";
import FooterSection from "@/components/FooterSection";
import { TeacherJobListingsTab } from "@/components/teachers/TeacherJobListingsTab";
import { BrowseTeachersTab } from "@/components/teachers/BrowseTeachersTab";
import { TeacherProfileTab } from "@/components/teachers/TeacherProfileTab";
import { mockTeacherJobs } from "@/components/teachers/mockTeacherJobs";
import PlatformFeatures from "@/components/marketing/PlatformFeatures";
import { useTranslation } from "react-i18next";

const TeacherJobListings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("job-listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState(mockTeacherJobs);
  const [showFeatures, setShowFeatures] = useState(false);

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
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold mb-4">{t("teacherPortal.title", "Teaching Portal")}</h1>
              <Button 
                variant="ghost" 
                className="text-primary"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                {showFeatures ? t("common.hideFeatures", "Hide Features") : t("common.showFeatures", "Show Platform Features")}
              </Button>
            </div>
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
                    {t("teacherPortal.tabs.jobs", "Job Listings")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="browse-teachers"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {t("teacherPortal.tabs.browse", "Browse Teachers")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t("teacherPortal.tabs.profile", "My Profile")}
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
          
          {showFeatures && (
            <div className="mb-12 animate-fade-in">
              <PlatformFeatures />
            </div>
          )}

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
      <SponsorsSection />
      <FooterSection />
    </div>
  );
};

export default TeacherJobListings;
