
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toggleFavorite, clearFavorites } from '@/redux/slices/wishlistSlice';
import { toast } from "sonner";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.wishlist.favorites);

  const isFavorite = (centerId: number) => {
    return favorites.includes(centerId);
  };

  const toggleFavoriteItem = (centerId: number, centerName: string) => {
    dispatch(toggleFavorite(centerId));
    
    if (!isFavorite(centerId)) {
      toast.success(`${centerName} added to favorites`);
    } else {
      toast(`${centerName} removed from favorites`);
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
