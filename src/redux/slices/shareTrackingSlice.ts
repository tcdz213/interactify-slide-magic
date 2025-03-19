
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ShareRecord {
  centerId: number;
  platform: string;
  timestamp: number;
}

interface ShareTrackingState {
  shares: ShareRecord[];
  totalShares: number;
}

const initialState: ShareTrackingState = {
  shares: [],
  totalShares: 0,
};

export const shareTrackingSlice = createSlice({
  name: 'shareTracking',
  initialState,
  reducers: {
    trackShare: (state, action: PayloadAction<{ centerId: number; platform: string }>) => {
      const { centerId, platform } = action.payload;
      
      state.shares.push({
        centerId,
        platform,
        timestamp: Date.now(),
      });
      
      state.totalShares += 1;
    },
    clearShareHistory: (state) => {
      state.shares = [];
      state.totalShares = 0;
    },
  },
});

export const { trackShare, clearShareHistory } = shareTrackingSlice.actions;

export default shareTrackingSlice.reducer;
