
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleCourseFavorite, clearCourseFavorites } from '@/redux/slices/wishlistSlice';
import { toast } from "sonner";

export const useCoursesWishlist = () => {
  const dispatch = useDispatch();
  const courseFavorites = useSelector((state: RootState) => state.wishlist.courseFavorites);

  const isFavorite = (courseId: number) => {
    return courseFavorites.includes(courseId);
  };

  const toggleFavoriteItem = (courseId: number, courseName: string) => {
    dispatch(toggleCourseFavorite(courseId));
    
    if (!isFavorite(courseId)) {
      toast.success(`${courseName} added to favorites`);
    } else {
      toast(`${courseName} removed from favorites`);
    }
  };

  const clearAllFavorites = () => {
    dispatch(clearCourseFavorites());
    toast('All course favorites cleared');
  };

  return {
    favorites: courseFavorites,
    isFavorite,
    toggleFavoriteItem,
    clearAllFavorites
  };
};
