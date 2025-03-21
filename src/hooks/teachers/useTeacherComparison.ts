
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

// Define the teacher type with more flexible properties
interface Teacher {
  id: string | number;
  name: string;
  avatar?: string;
  image?: string;
  role: string;
  specialization?: string;
  specialties?: string[];
  subjects?: string[];
  experience: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  availability: string;
  bio?: string;
  education?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  certifications?: string[];
}

// Create a slice for teacher comparison
const teacherComparisonSlice = createSlice({
  name: "teacherComparison",
  initialState: {
    teachers: [] as Teacher[]
  },
  reducers: {
    addTeacher: (state, action: PayloadAction<Teacher>) => {
      if (!state.teachers.some(t => t.id === action.payload.id) && state.teachers.length < 4) {
        state.teachers.push(action.payload);
      }
    },
    removeTeacher: (state, action: PayloadAction<string | number>) => {
      state.teachers = state.teachers.filter(teacher => teacher.id !== action.payload);
    },
    clearTeachers: (state) => {
      state.teachers = [];
    }
  }
});

// Export the actions and reducer
export const { addTeacher, removeTeacher, clearTeachers } = teacherComparisonSlice.actions;
export const teacherComparisonReducer = teacherComparisonSlice.reducer;

export const useTeacherComparison = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const compareTeachers = useSelector((state: RootState) => (state as any).teacherComparison?.teachers || []);

  const addToComparison = (teacher: Teacher) => {
    if (compareTeachers.some((t: Teacher) => t.id === teacher.id)) {
      toast({
        title: "Already in comparison",
        description: `${teacher.name} is already in your comparison list`,
      });
      return;
    }

    if (compareTeachers.length >= 4) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 4 teachers at a time",
        variant: "destructive"
      });
      return;
    }

    dispatch(addTeacher(teacher));
    toast({
      title: "Added to comparison",
      description: `${teacher.name} added to comparison list`,
    });
  };

  const removeFromComparison = (teacherId: string | number) => {
    dispatch(removeTeacher(teacherId));
    toast({
      title: "Removed from comparison",
      description: "Teacher removed from comparison list",
    });
  };

  const clearComparison = () => {
    dispatch(clearTeachers());
    toast({
      title: "Comparison cleared",
      description: "All teachers removed from comparison",
    });
  };

  const isInComparison = (teacherId: string | number) => {
    return compareTeachers.some((teacher: Teacher) => teacher.id === teacherId);
  };

  return {
    compareTeachers,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison
  };
};
