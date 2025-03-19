
import React from 'react';
import ForumPost, { ForumPostProps } from './ForumPost';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface ForumPostsListProps {
  posts: ForumPostProps[];
}

const ForumPostsList = ({ posts }: ForumPostsListProps) => {
  const { t } = useTranslation();
  
  return (
    <div 
      className="space-y-4"
      role="feed"
      aria-label={t('community.forumPosts', 'Forum posts')}
    >
      {posts.length > 0 ? (
        <ScrollArea className="max-h-[800px]">
          {posts.map((post, index) => (
            <div 
              key={post.id} 
              tabIndex={0}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md mb-4"
              aria-label={`${post.title} by ${post.author.name}`}
            >
              <ForumPost 
                {...post} 
                aria-posinset={index + 1} 
                aria-setsize={posts.length}
              />
            </div>
          ))}
        </ScrollArea>
      ) : (
        <div 
          className="text-center py-8 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {t('community.noPostsFound', 'No posts found in this category.')}
        </div>
      )}
    </div>
  );
};

export default ForumPostsList;
