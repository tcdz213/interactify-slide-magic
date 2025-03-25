
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Mortarboard, 
  UserCog, 
  Building, 
  Search, 
  Bookmark, 
  Bell, 
  Users, 
  GraduationCap,
  Calendar, 
  Globe, 
  Coins, 
  Network, 
  ListPlus, 
  BadgePlus, 
  UserPlus, 
  UserCheck,
  BarChart3,
  MessageCircle
} from "lucide-react";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex items-start mb-3">
    <div className="bg-primary/10 text-primary p-2 rounded-lg mr-3 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

type UserType = "learners" | "trainers" | "centers";

interface UserSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: Array<{icon: React.ReactNode, title: string, description: string}>;
  ctaText: string;
  ctaLink: string;
  type: UserType;
  activeType: UserType;
  onSelect: (type: UserType) => void;
}

const UserSection = ({ 
  icon, 
  title, 
  description, 
  features, 
  ctaText, 
  ctaLink, 
  type, 
  activeType, 
  onSelect 
}: UserSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className={`bg-card border rounded-lg p-6 transition-all duration-300 cursor-pointer ${
        activeType === type 
          ? "border-primary shadow-md" 
          : "border-border hover:border-primary/50"
      }`}
      onClick={() => onSelect(type)}
    >
      <div className="flex items-center mb-4">
        <div className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <p className="text-muted-foreground mb-6">{description}</p>
      
      {activeType === type && (
        <div className="space-y-4 animate-fade-in">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index}
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          ))}
          
          <div className="mt-6">
            <Button 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ctaLink);
              }}
            >
              {ctaText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlatformFeatures = () => {
  const { t } = useTranslation();
  const [activeUserType, setActiveUserType] = React.useState<UserType>("learners");
  
  const userSections = [
    {
      type: "learners" as UserType,
      icon: <Mortarboard className="h-5 w-5" />,
      title: t("features.learners.title", "For Learners 🎓"),
      description: t("features.learners.description", "Individuals looking to enhance skills through various training programs"),
      features: [
        {
          icon: <Search className="h-4 w-4" />,
          title: t("features.learners.discover.title", "Discover Courses"),
          description: t("features.learners.discover.description", "Search and filter by category, price, location, and ratings")
        },
        {
          icon: <Bookmark className="h-4 w-4" />,
          title: t("features.learners.bookmark.title", "Bookmark & Share"),
          description: t("features.learners.bookmark.description", "Save favorite courses and share them with friends")
        },
        {
          icon: <Building className="h-4 w-4" />,
          title: t("features.learners.follow.title", "Follow Training Centers"),
          description: t("features.learners.follow.description", "Stay updated on new programs and promotions")
        },
        {
          icon: <GraduationCap className="h-4 w-4" />,
          title: t("features.learners.enroll.title", "Enroll & Learn"),
          description: t("features.learners.enroll.description", "Secure a spot in courses effortlessly")
        },
        {
          icon: <Bell className="h-4 w-4" />,
          title: t("features.learners.notifications.title", "Get Notifications"),
          description: t("features.learners.notifications.description", "Receive alerts on discounts and new courses")
        },
        {
          icon: <Users className="h-4 w-4" />,
          title: t("features.learners.community.title", "Community Engagement"),
          description: t("features.learners.community.description", "Connect with fellow learners and trainers")
        }
      ],
      ctaText: t("features.learners.cta", "Find Your Course"),
      ctaLink: "/discover"
    },
    {
      type: "trainers" as UserType,
      icon: <UserCog className="h-5 w-5" />,
      title: t("features.trainers.title", "For Trainers 👨‍🏫"),
      description: t("features.trainers.description", "Experts who want to teach, get hired, and grow their careers"),
      features: [
        {
          icon: <UserCheck className="h-4 w-4" />,
          title: t("features.trainers.profile.title", "Create a Profile"),
          description: t("features.trainers.profile.description", "Showcase expertise and training skills")
        },
        {
          icon: <Calendar className="h-4 w-4" />,
          title: t("features.trainers.availability.title", "Set Availability"),
          description: t("features.trainers.availability.description", "Manage schedules and flexible learning options")
        },
        {
          icon: <Globe className="h-4 w-4" />,
          title: t("features.trainers.reach.title", "Expand Reach"),
          description: t("features.trainers.reach.description", "Connect with learners worldwide")
        },
        {
          icon: <Coins className="h-4 w-4" />,
          title: t("features.trainers.earn.title", "Earn & Scale"),
          description: t("features.trainers.earn.description", "Manage enrollments and increase earnings")
        },
        {
          icon: <Network className="h-4 w-4" />,
          title: t("features.trainers.networking.title", "Networking"),
          description: t("features.trainers.networking.description", "Answer questions and grow professionally")
        }
      ],
      ctaText: t("features.trainers.cta", "Become a Trainer"),
      ctaLink: "/teacher-job-listings"
    },
    {
      type: "centers" as UserType,
      icon: <Building className="h-5 w-5" />,
      title: t("features.centers.title", "For Training Centers 🏫"),
      description: t("features.centers.description", "Institutions offering structured training programs"),
      features: [
        {
          icon: <ListPlus className="h-4 w-4" />,
          title: t("features.centers.list.title", "List Training Programs"),
          description: t("features.centers.list.description", "Gain visibility and attract more learners")
        },
        {
          icon: <BadgePlus className="h-4 w-4" />,
          title: t("features.centers.promote.title", "Promote Your Center"),
          description: t("features.centers.promote.description", "Increase awareness and engagement")
        },
        {
          icon: <Users className="h-4 w-4" />,
          title: t("features.centers.manage.title", "Manage Students"),
          description: t("features.centers.manage.description", "Handle enrollments and student interactions efficiently")
        },
        {
          icon: <UserPlus className="h-4 w-4" />,
          title: t("features.centers.hire.title", "Hire Trainers"),
          description: t("features.centers.hire.description", "Recruit top educators for your programs")
        },
        {
          icon: <BarChart3 className="h-4 w-4" />,
          title: t("features.centers.compare.title", "Compare Experts"),
          description: t("features.centers.compare.description", "Select the best trainers for your courses")
        },
        {
          icon: <MessageCircle className="h-4 w-4" />,
          title: t("features.centers.community.title", "Build a Community"),
          description: t("features.centers.community.description", "Strengthen reputation by engaging learners & trainers")
        }
      ],
      ctaText: t("features.centers.cta", "Register Your Training Center"),
      ctaLink: "/for-training-centers"
    }
  ];
  
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{t("features.main.title", "Platform for Everyone")}</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("features.main.description", "Connecting learners, trainers, and training centers to create a thriving educational ecosystem")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userSections.map((section) => (
          <UserSection
            key={section.type}
            icon={section.icon}
            title={section.title}
            description={section.description}
            features={section.features}
            ctaText={section.ctaText}
            ctaLink={section.ctaLink}
            type={section.type}
            activeType={activeUserType}
            onSelect={setActiveUserType}
          />
        ))}
      </div>
    </div>
  );
};

export default PlatformFeatures;
