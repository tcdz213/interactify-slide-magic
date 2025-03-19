
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  role?: 'learner' | 'trainer' | 'admin';
  posts: number;
  likes: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

const TopContributors = ({ contributors }: TopContributorsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {contributors.map((contributor, index) => (
            <Link 
              key={contributor.id}
              to={`/profile/${contributor.id}`}
              className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground w-5">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback>{contributor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    {contributor.name}
                    {contributor.role && (
                      <span className={`px-1 py-0.5 rounded text-[10px] uppercase ${
                        contributor.role === 'trainer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                        contributor.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {contributor.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contributor.posts} posts • {contributor.likes} likes
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopContributors;
