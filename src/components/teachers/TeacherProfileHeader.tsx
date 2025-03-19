
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface TeacherProfileHeaderProps {
  profile: any;
  editMode: boolean;
  editProfile: any;
  setEditProfile: (profile: any) => void;
  getInitials: (name: string) => string;
}

export const TeacherProfileHeader = ({ 
  profile, 
  editMode, 
  editProfile, 
  setEditProfile,
  getInitials 
}: TeacherProfileHeaderProps) => {
  if (!editMode) {
    return (
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{profile.name}</h3>
          <p className="text-muted-foreground">{profile.title}</p>
          
          <div className="mt-4">
            <h4 className="font-medium">About Me</h4>
            <p className="mt-2">{profile.bio}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="flex flex-col items-center">
        <Avatar className="h-32 w-32">
          <AvatarImage src={editProfile.avatar} alt={editProfile.name} />
          <AvatarFallback>{getInitials(editProfile.name)}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" className="mt-2">
          <Upload className="h-4 w-4 mr-2" /> Upload Photo
        </Button>
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            value={editProfile.name}
            onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="title">Professional Title</Label>
          <Input 
            id="title" 
            value={editProfile.title}
            onChange={(e) => setEditProfile({...editProfile, title: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            value={editProfile.bio}
            onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
