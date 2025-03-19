import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ForumCategoryCard from './ForumCategoryCard';
import ForumPostsList from './ForumPostsList';
import NewPostForm from './NewPostForm';
import TopContributors from './TopContributors';
import RecentDiscussions from './RecentDiscussions';
import TrainingCenterShowcase from './TrainingCenterShowcase';
import PrivateMessaging from './PrivateMessaging';
import { useIsMobile } from '@/hooks/use-mobile';
import { Center } from '@/types/center.types';

const mockCategories = [
  {
    id: 'course-discussions',
    title: 'Course Discussions',
    description: 'Discuss specific courses, share insights, and ask questions',
    postsCount: 243,
    lastPostDate: '2 hours ago',
    lastPoster: 'Sarah J.'
  },
  {
    id: 'teaching-techniques',
    title: 'Teaching Techniques',
    description: 'Share and discover effective teaching methods and approaches',
    postsCount: 187,
    lastPostDate: '1 day ago',
    lastPoster: 'Michael T.'
  },
  {
    id: 'learning-tips',
    title: 'Learning Tips',
    description: 'Exchange tips on how to learn more effectively',
    postsCount: 156,
    lastPostDate: '3 hours ago',
    lastPoster: 'Amy L.'
  },
  {
    id: 'technical-support',
    title: 'Technical Support',
    description: 'Get help with technical issues related to the platform',
    postsCount: 94,
    lastPostDate: '5 hours ago',
    lastPoster: 'John D.'
  },
  {
    id: 'general-discussions',
    title: 'General Discussions',
    description: 'Discuss anything related to training and learning',
    postsCount: 312,
    lastPostDate: '30 minutes ago',
    lastPoster: 'Robert K.'
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Important updates and news about the platform',
    postsCount: 45,
    lastPostDate: '2 days ago',
    lastPoster: 'Admin'
  }
];

const mockPosts = [
  {
    id: 'post-1',
    title: 'What are the best resources for learning React?',
    content: 'I just started learning React and would love some recommendations for tutorials, courses, or books that helped you learn. Thanks in advance!',
    author: {
      name: 'Sarah Johnson',
      avatar: '',
      role: 'learner' as const
    },
    date: '2 hours ago',
    likes: 15,
    replies: 8,
    tags: ['react', 'javascript', 'learning']
  },
  {
    id: 'post-2',
    title: 'Techniques for teaching programming to beginners',
    content: 'I\'ve been teaching programming for a few years now and wanted to share some techniques that have worked well for me when teaching absolute beginners.',
    author: {
      name: 'Michael Thompson',
      avatar: '',
      role: 'trainer' as const
    },
    date: '1 day ago',
    likes: 32,
    replies: 12,
    tags: ['teaching', 'programming', 'beginners']
  },
  {
    id: 'post-3',
    title: 'How to balance work and learning?',
    content: 'I\'m struggling to find time for courses while working full-time. Does anyone have tips for balancing work and learning effectively?',
    author: {
      name: 'Amy Liu',
      avatar: '',
      role: 'learner' as const
    },
    date: '3 hours ago',
    likes: 24,
    replies: 15,
    tags: ['time-management', 'productivity', 'work-life-balance']
  }
];

const mockContributors = [
  {
    id: 'user-1',
    name: 'Michael Thompson',
    avatar: '',
    role: 'trainer' as const,
    posts: 87,
    likes: 432
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    avatar: '',
    role: 'learner' as const,
    posts: 64,
    likes: 315
  },
  {
    id: 'user-3',
    name: 'Robert King',
    avatar: '',
    role: 'admin' as const,
    posts: 53,
    likes: 290
  },
  {
    id: 'user-4',
    name: 'Amy Liu',
    avatar: '',
    role: 'learner' as const,
    posts: 42,
    likes: 214
  },
  {
    id: 'user-5',
    name: 'John Davis',
    avatar: '',
    role: 'trainer' as const,
    posts: 38,
    likes: 197
  }
];

const mockRecentDiscussions = [
  {
    id: 'post-1',
    title: 'What are the best resources for learning React?',
    author: {
      name: 'Sarah J.',
      id: 'user-2'
    },
    createdAt: '2 hours ago',
    category: {
      id: 'course-discussions',
      name: 'Course Discussions'
    }
  },
  {
    id: 'post-3',
    title: 'How to balance work and learning?',
    author: {
      name: 'Amy L.',
      id: 'user-4'
    },
    createdAt: '3 hours ago',
    category: {
      id: 'learning-tips',
      name: 'Learning Tips'
    }
  },
  {
    id: 'post-4',
    title: 'Technical issues with video playback',
    author: {
      name: 'John D.',
      id: 'user-5'
    },
    createdAt: '5 hours ago',
    category: {
      id: 'technical-support',
      name: 'Technical Support'
    }
  },
  {
    id: 'post-5',
    title: 'Platform update coming next week',
    author: {
      name: 'Admin',
      id: 'admin'
    },
    createdAt: '2 days ago',
    category: {
      id: 'announcements',
      name: 'Announcements'
    }
  }
];

const showcaseCenters: Center[] = [
  {
    id: 1,
    name: "Tech Skills Academy",
    location: "San Francisco, CA",
    status: "active",
    verified: true,
    description: "Learn coding and data science with industry experts",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
    featured: true,
    rating: 4.8,
    reviews: 120,
    price: "$299",
    currency: "USD",
    features: ["certified", "online", "group"]
  },
  {
    id: 2,
    name: "Fitness Evolution Center",
    location: "Chicago, IL",
    status: "active",
    verified: true,
    description: "Cutting-edge fitness programs for all levels",
    category: "Health & Fitness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470",
    featured: true,
    rating: 4.7,
    reviews: 95,
    price: "$59",
    currency: "USD",
    features: ["in_person", "equipment", "parking"]
  },
  {
    id: 3,
    name: "Creative Arts Studio",
    location: "New York, NY",
    status: "active",
    verified: true,
    description: "Express yourself through various art forms",
    category: "Arts & Design",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071",
    featured: true,
    rating: 4.9,
    reviews: 87,
    price: "$149",
    currency: "USD",
    features: ["in_person", "equipment", "private"]
  }
];

const CommunityTabs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('categories');
  const isMobile = useIsMobile();

  return (
    <div className="container-custom py-4 md:py-8">
      <div className="max-w-3xl mx-auto mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search discussions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs 
        defaultValue="categories" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex justify-center mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="px-1">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="latest">Latest Posts</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2">
            <TabsContent value="categories" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {mockCategories.map(category => (
                  <ForumCategoryCard key={category.id} {...category} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="latest" className="mt-0">
              <NewPostForm />
              <div className="mt-4 md:mt-6">
                <ForumPostsList posts={mockPosts} />
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="mt-0">
              <ForumPostsList posts={[...mockPosts].sort((a, b) => b.likes - a.likes)} />
            </TabsContent>
            
            <TabsContent value="connect" className="mt-0">
              <PrivateMessaging />
            </TabsContent>
          </div>
          
          {(!isMobile || activeTab !== 'connect') && (
            <div className="space-y-4 md:space-y-6 mt-4 lg:mt-0">
              {activeTab !== 'connect' && (
                <>
                  <TopContributors contributors={mockContributors} />
                  <RecentDiscussions discussions={mockRecentDiscussions} />
                  <TrainingCenterShowcase centers={showcaseCenters} />
                </>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default CommunityTabs;
