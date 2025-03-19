
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Calendar, MapPin, Award, BookOpen } from 'lucide-react';

interface ProfileCardProps {
  userId: string;
  name: string;
  avatar?: string;
  role?: 'learner' | 'trainer' | 'admin';
  joinDate: string;
  location?: string;
  bio?: string;
  interests?: string[];
  achievements?: string[];
  coursesCompleted?: number;
  postsCount?: number;
  following?: number;
  followers?: number;
}

const ProfileCard = ({
  userId,
  name,
  avatar,
  role = 'learner',
  joinDate,
  location,
  bio,
  interests = [],
  achievements = [],
  coursesCompleted = 0,
  postsCount = 0,
  following = 0,
  followers = 0
}: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/60"></div>
      <CardHeader className="relative pt-0 -mt-16 flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-xl">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center mt-3">
          <h2 className="text-xl font-bold">{name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge className={
              role === 'trainer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
              role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
            {location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-muted-foreground text-center">{bio}</p>
        )}
        
        <div className="grid grid-cols-3 text-center gap-2 border-y border-border/30 py-3">
          <div>
            <div className="text-lg font-semibold">{postsCount}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{following}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-2">
          <Button>
            Follow
          </Button>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium">Member since</span>
            <span className="text-muted-foreground">{joinDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">Courses completed</span>
            <span className="text-muted-foreground">{coursesCompleted}</span>
          </div>
          
          {interests.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm font-medium">Interests</span>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {achievements.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm font-medium flex items-center gap-1">
                <Award className="h-4 w-4 text-primary" />
                Achievements
              </span>
              <ul className="text-sm text-muted-foreground space-y-1">
                {achievements.map((achievement, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
