
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiPreferencesReducer from './slices/uiPreferencesSlice';
import searchReducer from './slices/searchSlice';
import wishlistReducer from './slices/wishlistSlice';
import shareTrackingReducer from './slices/shareTrackingSlice';
import notificationsReducer from './slices/notificationsSlice';
import centersReducer from './slices/centersSlice';
import { comparisonReducer } from "@/hooks/centers/useCourseComparison";
import { jobComparisonReducer } from "@/hooks/teachers/useJobComparison";
import { teacherComparisonReducer } from "@/hooks/teachers/useTeacherComparison";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    uiPreferences: uiPreferencesReducer,
    search: searchReducer,
    wishlist: wishlistReducer,
    shareTracking: shareTrackingReducer,
    notifications: notificationsReducer,
    centers: centersReducer,
    comparison: comparisonReducer,
    jobComparison: jobComparisonReducer,
    teacherComparison: teacherComparisonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
