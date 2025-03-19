
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, CornerDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ForumPostReplyProps {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: 'learner' | 'trainer' | 'admin';
  };
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  isReplyingTo?: string;
}

const ForumPostReply = ({
  id,
  content,
  author,
  createdAt,
  likes,
  isLiked = false,
  isReplyingTo,
}: ForumPostReplyProps) => {
  const { t } = useTranslation();
  const formattedDate = new Date(createdAt).toISOString();
  const readableDate = new Date(createdAt).toLocaleDateString();

  return (
    <Card 
      className="mb-3 overflow-hidden border-border/50" 
      role="comment"
      aria-labelledby={`reply-author-${id}`}
    >
      <CardContent className="p-4 pb-2 flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={author.avatar} alt={`${author.name}'s profile picture`} />
          <AvatarFallback>{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="font-medium" id={`reply-author-${id}`}>{author.name}</span>
            {author.role && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                author.role === 'trainer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                author.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {t(`community.roles.${author.role}`, author.role)}
              </span>
            )}
            <span className="text-muted-foreground" aria-hidden="true">·</span>
            <time 
              className="text-muted-foreground" 
              dateTime={formattedDate}
            >
              {readableDate}
            </time>
          </div>
          
          {isReplyingTo && (
            <div 
              className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
              aria-label={t('community.replyingTo', 'Replying to {{name}}', { name: isReplyingTo })}
            >
              <CornerDownRight className="h-3 w-3" aria-hidden="true" />
              <span>{t('community.replyingTo', 'Replying to {{name}}', { name: isReplyingTo })}</span>
            </div>
          )}
          
          <p className="text-sm text-foreground/90">{content}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-3 pl-14">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 gap-1"
                  aria-pressed={isLiked}
                >
                  <Heart 
                    className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                    aria-hidden="true" 
                  />
                  <span className="text-xs">{likes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLiked ? t('community.unlike', 'Unlike this reply') : t('community.like', 'Like this reply')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-xs ml-1">{t('community.reply', 'Reply')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t('community.replyToComment', 'Reply to this comment')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForumPostReply;
