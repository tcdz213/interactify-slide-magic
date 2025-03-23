
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleFavorite, clearFavorites } from '@/redux/slices/wishlistSlice';
import { toast } from "sonner";

export const useCourseWishlist = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.wishlist.favorites);

  const isFavorite = (courseId: number) => {
    return favorites.includes(courseId);
  };

  const toggleFavoriteItem = (courseId: number, courseName: string) => {
    dispatch(toggleFavorite(courseId));
    
    if (!isFavorite(courseId)) {
      toast.success(`${courseName} added to favorites`);
    } else {
      toast(`${courseName} removed from favorites`);
    }
  };

  const clearAllFavorites = () => {
    dispatch(clearFavorites());
    toast('All favorites cleared');
  };

  return {
    favorites,
    isFavorite,
    toggleFavoriteItem,
    clearAllFavorites
  };
};
