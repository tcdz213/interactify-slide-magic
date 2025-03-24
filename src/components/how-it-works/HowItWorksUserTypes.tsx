
import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  Building,
  Search, 
  Bookmark, 
  Bell, 
  Calendar, 
  Handshake, 
  ListChecks,
  Megaphone,
  UserCog
} from "lucide-react";
import UserTypeCardWithImage from './UserTypeCardWithImage';

const HowItWorksUserTypes = () => {
  const [activeType, setActiveType] = useState("learners");

  const userTypes = [
    {
      id: "learners",
      icon: GraduationCap,
      title: "📚 For Learners",
      description: "Discover, Save & Book!",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      route: "/discover",
      buttonText: "Find Your Course Now",
      imageSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      steps: [
        { title: "Explore Courses – Browse thousands of training programs tailored to your goals." },
        { title: "Smart Search & Compare – Filter by category, price, location, and ratings." },
        { title: "Bookmark & Share – Save your favorite courses and share with friends." },
        { title: "Follow Training Centers – Stay updated on new courses and promotions." },
        { title: "Get Instant Alerts – Receive notifications on discounts and course updates." },
        { title: "Enroll & Learn – Secure your spot and start your learning journey!" },
        { title: "Join the Community – Connect, discuss, and share experiences with others." }
      ]
    },
    {
      id: "teachers",
      icon: Users,
      title: "🎓 For Trainers",
      description: "Teach, Earn & Grow!",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      route: "/teacher-job-post",
      buttonText: "Register as a Trainer",
      imageSrc: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      steps: [
        { title: "Create Your Profile – Showcase your expertise and skills." },
        { title: "Manage Your Availability – Set schedules and offer flexible learning options." },
        { title: "Expand Your Reach – Connect with students worldwide." },
        { title: "Get Hired – Work with training centers and learners." },
        { title: "Earn & Scale – Manage enrollments and boost your teaching career." },
        { title: "Engage & Network – Answer questions and grow your professional network." }
      ]
    },
    {
      id: "centers",
      icon: Building,
      title: "🏫 For Training Centers",
      description: "Boost Enrollment & Visibility!",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      route: "/for-training-centers",
      buttonText: "Register Your Training Center",
      imageSrc: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      steps: [
        { title: "List Your Training Programs – Attract learners with your courses." },
        { title: "Promote Your Center – Gain visibility and reach a wider audience." },
        { title: "Simplify Student Management – Handle enrollments efficiently." },
        { title: "Hire Top Trainers – Recruit the best instructors for your courses." },
        { title: "Compare & Select Experts – Choose the best trainers for your faculty." },
        { title: "Build a Community – Engage with learners and trainers to strengthen your reputation." }
      ]
    },
  ];

  return (
    <div className="space-y-12">
      {/* Selector Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {userTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
              activeType === type.id 
                ? "bg-primary text-primary-foreground shadow-md dark:shadow-primary/20" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground dark:bg-muted/50 dark:hover:bg-muted/70"
            }`}
          >
            {type.title}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-8">
        {userTypes.map((type) => (
          <div key={type.id} style={{ display: activeType === type.id ? 'block' : 'none' }}>
            <UserTypeCardWithImage
              icon={type.icon}
              title={type.title}
              description={type.description}
              color={type.color}
              route={type.route}
              buttonText={type.buttonText}
              isActive={true}
              steps={type.steps}
              imageSrc={type.imageSrc}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksUserTypes;
