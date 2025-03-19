
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ForumCategoryProps {
  id: string;
  title: string;
  description: string;
  postsCount: number;
  lastPostDate?: string;
  lastPoster?: string;
  icon?: React.ReactNode;
}

const ForumCategoryCard = ({
  id,
  title,
  description,
  postsCount,
  lastPostDate,
  lastPoster,
  icon
}: ForumCategoryProps) => {
  return (
    <Link to={`/community/category/${id}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            {icon || <MessageCircle className="h-5 w-5 text-primary" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {postsCount} posts
            </span>
            
            {lastPostDate && (
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> {lastPoster} | {lastPostDate}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ForumCategoryCard;
