
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

// Define a basic Course type for comparison
interface Course {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
  duration: string;
  description: string;
  centerName: string;
  centerLocation: string;
  rating: number;
  reviews: number;
  featured: boolean;
  centerId: number;
}

// Create a slice for course comparison
const courseComparisonSlice = createSlice({
  name: "courseComparison",
  initialState: {
    courses: [] as Course[]
  },
  reducers: {
    addCourse: (state, action: PayloadAction<Course>) => {
      if (!state.courses.some(c => c.id === action.payload.id) && state.courses.length < 4) {
        state.courses.push(action.payload);
      }
    },
    removeCourse: (state, action: PayloadAction<number>) => {
      state.courses = state.courses.filter(course => course.id !== action.payload);
    },
    clearCourses: (state) => {
      state.courses = [];
    }
  }
});

// Export the actions and reducer
export const { addCourse, removeCourse, clearCourses } = courseComparisonSlice.actions;
export const courseComparisonReducer = courseComparisonSlice.reducer;

export const useCourseComparison = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const compareCourses = useSelector((state: RootState) => (state as any).courseComparison?.courses || []);

  const addToComparison = (course: Course) => {
    if (compareCourses.some((c: Course) => c.id === course.id)) {
      toast({
        title: "Already in comparison",
        description: `${course.name} is already in your comparison list`,
      });
      return;
    }

    if (compareCourses.length >= 4) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 4 courses at a time",
        variant: "destructive"
      });
      return;
    }

    dispatch(addCourse(course));
    toast({
      title: "Added to comparison",
      description: `${course.name} added to comparison list`,
    });
  };

  const removeFromComparison = (courseId: number) => {
    dispatch(removeCourse(courseId));
    toast({
      title: "Removed from comparison",
      description: "Course removed from comparison list",
    });
  };

  const clearComparison = () => {
    dispatch(clearCourses());
    toast({
      title: "Comparison cleared",
      description: "All courses removed from comparison",
    });
  };

  const isInComparison = (courseId: number) => {
    return compareCourses.some((course: Course) => course.id === courseId);
  };

  return {
    compareCourses,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison
  };
};
