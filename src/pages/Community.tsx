
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { CommunityHeader, CommunityTabs } from "@/components/community";
import ProfileCard from "@/components/community/ProfileCard";

// Mock user data for demonstration
const mockUsers = [
  {
    userId: "user-1",
    name: "Michael Thompson",
    role: "trainer" as const,
    joinDate: "Jan 2021",
    location: "New York, NY",
    bio: "Experienced instructor specializing in web development and programming. Passionate about helping others learn technical skills.",
    interests: ["JavaScript", "React", "Node.js", "Teaching"],
    achievements: ["Top Contributor 2022", "50+ Courses Taught", "4.9 Average Rating"],
    coursesCompleted: 12,
    postsCount: 87,
    following: 120,
    followers: 350
  },
  {
    userId: "user-2",
    name: "Sarah Johnson",
    role: "learner" as const,
    joinDate: "Mar 2022",
    location: "London, UK",
    bio: "Software developer learning new skills to advance my career. Interested in full-stack development and cloud technologies.",
    interests: ["Python", "Cloud Computing", "Web Development", "Mobile Apps"],
    achievements: ["10 Courses Completed", "5 Course Projects"],
    coursesCompleted: 10,
    postsCount: 64,
    following: 75,
    followers: 42
  },
  {
    userId: "user-3",
    name: "Robert King",
    role: "admin" as const,
    joinDate: "Feb 2020",
    location: "San Francisco, CA",
    bio: "Platform administrator and education enthusiast. Helping to build a better learning experience for everyone.",
    interests: ["Education Technology", "UX Design", "Community Building"],
    achievements: ["Platform Launch Team", "Community Guidelines Creator"],
    coursesCompleted: 8,
    postsCount: 53,
    following: 80,
    followers: 112
  }
];

const Community = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [activeUser, setActiveUser] = useState<typeof mockUsers[0] | null>(null);

  useEffect(() => {
    if (userId) {
      const user = mockUsers.find(user => user.userId === userId);
      if (user) {
        setActiveUser(user);
      } else {
        // If user not found, redirect to main community page
        navigate("/community");
      }
    } else {
      setActiveUser(null);
    }
  }, [userId, navigate]);

  return (
    <Layout>
      <CommunityHeader />
      
      {activeUser ? (
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <ProfileCard {...activeUser} />
          </div>
        </div>
      ) : (
        <CommunityTabs />
      )}
    </Layout>
  );
};

export default Community;
