
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Pencil, Save, Mail, User, Phone, BarChart, BookOpen, Building2, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RoleBasedElement from "@/components/RoleBasedElement";
import { ROLES } from "@/utils/roles";

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  // Handle navigation to role-specific dashboards
  const navigateToDashboard = () => {
    if (user?.userType === "center") {
      navigate("/center-owner-dashboard");
    } else if (user?.userType === "teacher") {
      navigate("/teacher-profile");
    } else if (user?.userType === "learner") {
      navigate("/learner-profile");
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Save changes (would dispatch an update action in a real app)
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  // Check if phone property exists in the user object with type safety
  const userPhone = user && 'phone' in user ? user.phone as string : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* User profile sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Manage your account settings</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleEditMode}
                      className="h-8 w-8"
                    >
                      {editMode ? <Save size={16} /> : <Pencil size={16} />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-lg">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-medium">{user?.fullName}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user?.userType}
                  </p>
                  
                  <div className="w-full space-y-4 mt-8">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    
                    {userPhone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">
                            {userPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={navigateToDashboard} className="w-full mt-8">
                    Go to {user?.userType} Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="space-y-4 pt-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            placeholder="Enter your full name"
                            defaultValue={user?.fullName}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            defaultValue={user?.email}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="Enter your phone number"
                            defaultValue={userPhone}
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="password" className="space-y-4 pt-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter your current password"
                            disabled={!editMode}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            disabled={!editMode}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="preferences" className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications about your account
                            </p>
                          </div>
                          <Switch id="emailNotifications" disabled={!editMode} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="marketingEmails">Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails about new features and promotions
                            </p>
                          </div>
                          <Switch id="marketingEmails" disabled={!editMode} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Role-specific information sections */}
              <RoleBasedElement allowedRoles={[ROLES.CENTER_OWNER, ROLES.PLATFORM_ADMIN]}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle>Training Center Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Manage your training center details, courses, and applications
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/center-owner-dashboard")}>
                      Go to Center Management
                    </Button>
                  </CardContent>
                </Card>
              </RoleBasedElement>

              <RoleBasedElement allowedRoles={[ROLES.TEACHER, ROLES.PLATFORM_ADMIN]}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Teacher Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Manage your teacher profile, qualifications, and job applications
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/teacher-profile")}>
                      Go to Teacher Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </RoleBasedElement>

              <RoleBasedElement allowedRoles={[ROLES.LEARNER, ROLES.PLATFORM_ADMIN]}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle>Learning Progress</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Track your enrolled courses, progress, and certifications
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/learner-profile")}>
                      View Learning Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </RoleBasedElement>

              <RoleBasedElement allowedRoles={[ROLES.PLATFORM_ADMIN]}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      <CardTitle>Admin Controls</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Access platform administration and reporting features
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/admin")}>
                      Go to Admin Panel
                    </Button>
                  </CardContent>
                </Card>
              </RoleBasedElement>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
