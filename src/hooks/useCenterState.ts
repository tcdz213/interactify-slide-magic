
import { useCenterOperations } from "./centers/useCenterOperations";
import { useCourseComparison } from "./centers";

export const useCenterState = (searchTerm: string) => {
  const centerOperations = useCenterOperations(searchTerm);
  const comparisonOperations = useCourseComparison();
  
  return {
    ...centerOperations,
    ...comparisonOperations
  };
};
