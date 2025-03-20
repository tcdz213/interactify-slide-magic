
import { useCenterOperations } from "./centers/useCenterOperations";

export const useCenterState = (searchTerm: string) => {
  return useCenterOperations(searchTerm);
};
