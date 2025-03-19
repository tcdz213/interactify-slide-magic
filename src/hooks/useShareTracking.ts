
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { trackShare, clearShareHistory } from '@/redux/slices/shareTrackingSlice';

export const useShareTracking = () => {
  const dispatch = useDispatch();
  const { shares, totalShares } = useSelector((state: RootState) => state.shareTracking);

  const trackCourseShare = (centerId: number, platform: string) => {
    dispatch(trackShare({ centerId, platform }));
    
    // Additional logic could be added here, such as:
    // - Check if user qualifies for rewards based on shares
    // - Send tracking data to analytics service
    // - Update user profile with sharing activity
  };

  const getSharesByCenter = (centerId: number) => {
    return shares.filter(share => share.centerId === centerId);
  };

  const getSharesByPlatform = (platform: string) => {
    return shares.filter(share => share.platform === platform);
  };

  const clearAllShareHistory = () => {
    dispatch(clearShareHistory());
  };

  return {
    shares,
    totalShares,
    trackCourseShare,
    getSharesByCenter,
    getSharesByPlatform,
    clearAllShareHistory,
  };
};
