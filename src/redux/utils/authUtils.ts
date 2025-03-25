
import { ROLES, Role } from "@/utils/roles";

// Convert userType to role
export const userTypeToRole = (userType?: string): Role => {
  switch (userType) {
    case "center":
      return ROLES.CENTER_OWNER;
    case "teacher":
      return ROLES.TEACHER;
    case "learner":
      return ROLES.LEARNER;
    case "admin":
      return ROLES.PLATFORM_ADMIN;
    default:
      return ROLES.GUEST;
  }
};
