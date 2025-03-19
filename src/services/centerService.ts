
import { store } from '@/redux/store';
import { 
  addCenter, 
  updateCenter, 
  deleteCenter, 
  toggleVerification, 
  filterCenters 
} from '@/redux/slices/centersSlice';
import { Center, CenterFormData } from "../types/center.types";

export class CenterService {
  getFilteredCenters(searchTerm: string): Center[] {
    // Update to use the new filter structure
    store.dispatch(filterCenters({ 
      filters: { searchTerm } 
    }));
    return store.getState().centers.filteredItems;
  }

  addCenter(formData: CenterFormData): Center {
    store.dispatch(addCenter(formData));
    // Get the last added center from the store
    const centers = store.getState().centers.items;
    return centers[centers.length - 1];
  }

  updateCenter(id: number, formData: CenterFormData): Center | null {
    store.dispatch(updateCenter({ id, formData }));
    // Get the updated center from the store
    const updatedCenter = store.getState().centers.items.find(c => c.id === id);
    return updatedCenter || null;
  }

  deleteCenter(id: number): boolean {
    const initialLength = store.getState().centers.items.length;
    store.dispatch(deleteCenter(id));
    const newLength = store.getState().centers.items.length;
    return newLength < initialLength;
  }

  toggleVerification(id: number): Center | null {
    store.dispatch(toggleVerification(id));
    // Get the updated center from the store
    const updatedCenter = store.getState().centers.items.find(c => c.id === id);
    return updatedCenter || null;
  }
}

export const centerService = new CenterService();
