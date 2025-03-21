
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

// Define the job type
interface TeacherJob {
  id: number;
  title: string;
  location: string;
  specialization: string;
  experience: string;
  postedDate: string;
  image: string;
  centerName: string;
  salary: string;
  description: string;
}

// Create a slice for job comparison
const jobComparisonSlice = createSlice({
  name: "jobComparison",
  initialState: {
    jobs: [] as TeacherJob[]
  },
  reducers: {
    addJob: (state, action: PayloadAction<TeacherJob>) => {
      if (!state.jobs.some(j => j.id === action.payload.id) && state.jobs.length < 4) {
        state.jobs.push(action.payload);
      }
    },
    removeJob: (state, action: PayloadAction<number>) => {
      state.jobs = state.jobs.filter(job => job.id !== action.payload);
    },
    clearJobs: (state) => {
      state.jobs = [];
    }
  }
});

// Export the actions and reducer
export const { addJob, removeJob, clearJobs } = jobComparisonSlice.actions;
export const jobComparisonReducer = jobComparisonSlice.reducer;

export const useJobComparison = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const compareJobs = useSelector((state: RootState) => (state as any).jobComparison?.jobs || []);

  const addToComparison = (job: TeacherJob) => {
    if (compareJobs.some((j: TeacherJob) => j.id === job.id)) {
      toast({
        title: "Already in comparison",
        description: `${job.title} is already in your comparison list`,
      });
      return;
    }

    if (compareJobs.length >= 4) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 4 jobs at a time",
        variant: "destructive"
      });
      return;
    }

    dispatch(addJob(job));
    toast({
      title: "Added to comparison",
      description: `${job.title} added to comparison list`,
    });
  };

  const removeFromComparison = (jobId: number) => {
    dispatch(removeJob(jobId));
    toast({
      title: "Removed from comparison",
      description: "Job removed from comparison list",
    });
  };

  const clearComparison = () => {
    dispatch(clearJobs());
    toast({
      title: "Comparison cleared",
      description: "All jobs removed from comparison",
    });
  };

  const isInComparison = (jobId: number) => {
    return compareJobs.some((job: TeacherJob) => job.id === jobId);
  };

  return {
    compareJobs,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison
  };
};
