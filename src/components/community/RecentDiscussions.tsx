
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Discussion {
  id: string;
  title: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
}

interface RecentDiscussionsProps {
  discussions: Discussion[];
}

const RecentDiscussions = ({ discussions }: RecentDiscussionsProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          {t('community.recentDiscussions', 'Recent Discussions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {discussions.map((discussion) => (
            <li key={discussion.id} className="hover:bg-muted/50 transition-colors">
              <div className="px-4 py-3">
                <div className="mb-1">
                  <Link 
                    to={`/community/post/${discussion.id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {discussion.title}
                  </Link>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>{t('by', 'by')}</span>
                    {/* Use span instead of link to prevent nesting issues */}
                    <span className="font-medium text-foreground">
                      {discussion.author.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{discussion.createdAt}</span>
                    <span>•</span>
                    <span>{discussion.category.name}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentDiscussions;
