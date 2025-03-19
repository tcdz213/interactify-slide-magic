
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CenterFormData, Center } from '@/types/center.types';
import { RootState } from '@/redux/store';
import { mockCenters } from '../data/mockCenters';

// Async thunks for API operations (would be used in a real app)
export const fetchCenters = createAsyncThunk(
  'centers/fetchCenters',
  async () => {
    // In real app, this would be an API call
    // const response = await axios.get('/api/centers');
    // return response.data;
    return mockCenters;
  }
);

export const addCenterAsync = createAsyncThunk(
  'centers/addCenter',
  async (formData: CenterFormData) => {
    // In real app, this would be an API call
    // const response = await axios.post('/api/centers', formData);
    // return response.data;
    return {
      id: Math.floor(Math.random() * 10000),
      name: formData.name,
      location: formData.location,
      status: formData.status,
      category: formData.category || 'General',
      description: formData.description,
      subcategory: formData.subcategory,
      verified: false,
      rating: 0,
      reviews: 0,
      image: '',
      price: '$0',
      currency: 'USD',
      featured: false,
      features: []
    };
  }
);

export const updateCenterAsync = createAsyncThunk(
  'centers/updateCenter',
  async ({ id, formData }: { id: number, formData: CenterFormData }) => {
    // In real app, this would be an API call
    // const response = await axios.put(`/api/centers/${id}`, formData);
    // return response.data;
    return {
      id,
      name: formData.name,
      location: formData.location,
      status: formData.status,
      category: formData.category,
      description: formData.description,
      subcategory: formData.subcategory,
      verified: true, // In a real app, this value would come from the API
    };
  }
);

export const deleteCenterAsync = createAsyncThunk(
  'centers/deleteCenter',
  async (id: number) => {
    // In real app, this would be an API call
    // await axios.delete(`/api/centers/${id}`);
    return id;
  }
);

export const toggleVerificationAsync = createAsyncThunk(
  'centers/toggleVerification',
  async (id: number, { getState }) => {
    const { centers } = getState() as RootState;
    const center = centers.items.find(c => c.id === id);
    
    if (!center) throw new Error('Center not found');
    
    // In real app, this would be an API call
    // const response = await axios.patch(`/api/centers/${id}/verify`, {
    //   verified: !center.verified
    // });
    // return response.data;
    
    return {
      id,
      verified: !center.verified
    };
  }
);
