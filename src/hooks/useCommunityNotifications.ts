
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification, Notification } from '@/redux/slices/notificationsSlice';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

export const useCommunityNotifications = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const notifyReply = (postTitle: string, username: string) => {
    const notification: Notification = {
      id: uuidv4(),
      title: 'New Reply',
      message: `${username} replied to your post "${postTitle}"`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'forum',
      link: `/community/post/${postTitle.toLowerCase().replace(/\s+/g, '-')}`
    };

    dispatch(addNotification(notification));
    toast({
      title: 'New Reply',
      description: `${username} replied to your post "${postTitle}"`,
    });
  };

  const notifyLike = (postTitle: string, username: string) => {
    const notification: Notification = {
      id: uuidv4(),
      title: 'New Like',
      message: `${username} liked your post "${postTitle}"`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'like',
      link: `/community/post/${postTitle.toLowerCase().replace(/\s+/g, '-')}`
    };

    dispatch(addNotification(notification));
  };

  const notifyMention = (postTitle: string, username: string) => {
    const notification: Notification = {
      id: uuidv4(),
      title: 'You were mentioned',
      message: `${username} mentioned you in "${postTitle}"`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'forum',
      link: `/community/post/${postTitle.toLowerCase().replace(/\s+/g, '-')}`
    };

    dispatch(addNotification(notification));
    toast({
      title: 'You were mentioned',
      description: `${username} mentioned you in "${postTitle}"`,
    });
  };

  return {
    notifyReply,
    notifyLike,
    notifyMention
  };
};

export default useCommunityNotifications;
