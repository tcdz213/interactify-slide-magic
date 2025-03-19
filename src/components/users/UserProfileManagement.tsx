import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock user profile data
const mockUserProfile = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  courses: [
    { id: 101, name: "Introduction to React", status: "Completed" },
    { id: 102, name: "Advanced JavaScript", status: "In Progress" },
    { id: 103, name: "Node.js Fundamentals", status: "Not Started" },
  ],
  certificates: [
    { id: 201, name: "React Certification", issueDate: "2023-05-15" },
    { id: 202, name: "JavaScript Expert", issueDate: "2023-03-20" },
  ],
  preferences: {
    darkMode: false,
    notificationsEnabled: true,
  },
  billingInfo: {
    paymentMethod: "Credit Card",
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/24",
  },
  learningGoals: "Become proficient in full-stack web development.",
  interests: ["Web Development", "JavaScript", "React", "Node.js"],
  activityLog: [
    { id: 301, type: "Course Completed", date: "2023-05-15", details: "Finished Introduction to React" },
    { id: 302, type: "Certificate Earned", date: "2023-03-20", details: "Earned JavaScript Expert Certificate" },
  ],
  supportTickets: [
    { id: 401, subject: "Issue with React Course", status: "Open", date: "2023-11-01" },
    { id: 402, subject: "Certificate Not Showing", status: "Resolved", date: "2023-10-25" },
  ],
};

const UserProfileManagement = () => {
  const [profile, setProfile] = useState(mockUserProfile);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({ ...profile });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setEditMode(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Courses & Certificates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="billing">Billing Info</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>View and edit your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editMode ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Courses & Certificates Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses and Certificates</CardTitle>
              <CardDescription>Track your learning progress and view certificates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3>Courses</h3>
                <ul className="list-none pl-0">
                  {profile.courses.map((course) => (
                    <li key={course.id} className="py-2 border-b border-border">
                      {course.name} - Status: <Badge variant="secondary">{course.status}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Certificates</h3>
                <ul className="list-none pl-0">
                  {profile.certificates.map((certificate) => (
                    <li key={certificate.id} className="py-2 border-b border-border">
                      {certificate.name} - Issue Date: {certificate.issueDate}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your learning experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Input
                  id="dark-mode"
                  type="checkbox"
                  checked={editProfile.preferences.darkMode}
                  onChange={(e) =>
                    setEditProfile({
                      ...editProfile,
                      preferences: { ...editProfile.preferences, darkMode: e.target.checked },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Input
                  id="notifications"
                  type="checkbox"
                  checked={editProfile.preferences.notificationsEnabled}
                  onChange={(e) =>
                    setEditProfile({
                      ...editProfile,
                      preferences: { ...editProfile.preferences, notificationsEnabled: e.target.checked },
                    })
                  }
                />
              </div>
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Preferences</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Billing Info Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your payment details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editMode ? (
                <div className="space-y-2">
                  <p><strong>Payment Method:</strong> {profile.billingInfo.paymentMethod}</p>
                  <p><strong>Card Number:</strong> {profile.billingInfo.cardNumber}</p>
                  <p><strong>Expiry Date:</strong> {profile.billingInfo.expiryDate}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Input
                      id="payment-method"
                      value={editProfile.billingInfo.paymentMethod}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          billingInfo: { ...editProfile.billingInfo, paymentMethod: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      type="text"
                      value={editProfile.billingInfo.cardNumber}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          billingInfo: { ...editProfile.billingInfo, cardNumber: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="text"
                      value={editProfile.billingInfo.expiryDate}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          billingInfo: { ...editProfile.billingInfo, expiryDate: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Update Billing Info</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Learning Goals Tab */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>Set and track your learning objectives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editMode ? (
                <div>
                  <p>{profile.learningGoals}</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="learning-goals">Your Goals</Label>
                  <Textarea
                    id="learning-goals"
                    value={editProfile.learningGoals}
                    onChange={(e) => setEditProfile({ ...editProfile, learningGoals: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Goals</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>Tell us what you're interested in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editMode ? (
                <div>
                  <ul className="list-disc pl-5">
                    {profile.interests.map((interest, index) => (
                      <li key={index}>{interest}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <Label htmlFor="interests">Your Interests</Label>
                  <Input
                    id="interests"
                    value={editProfile.interests.join(", ")}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        interests: e.target.value.split(",").map((item) => item.trim()),
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Interests</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Track your recent activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {profile.activityLog.map((activity) => (
                  <div key={activity.id} className="py-2 border-b border-border">
                    <strong>{activity.type}</strong> - {activity.details} ({activity.date})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>View and manage your support tickets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {profile.supportTickets.map((ticket) => (
                  <div key={ticket.id} className="py-2 border-b border-border">
                    <strong>{ticket.subject}</strong> - Status: {ticket.status} ({ticket.date})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileManagement;
