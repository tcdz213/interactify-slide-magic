export const ROLES = {
  END_USER: "end_user",
  CENTER_OWNER: "center_owner",
  PLATFORM_ADMIN: "platform_admin",
  CONTENT_MODERATOR: "content_moderator",
  ADVERTISER: "advertiser",
  SUPPORT_AGENT: "support_agent",
  TECHNICAL_OWNER: "technical_owner",
  GUEST: "guest",
  TEACHER: "teacher",
  LEARNER: "learner",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: string[];
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  [ROLES.END_USER]: {
    id: ROLES.END_USER,
    name: "End User",
    description:
      "Regular user who can search, book, and review training centers",
    permissions: [
      "view:public",
      "book:sessions",
      "write:reviews",
      "view:dashboard",
    ],
  },
  [ROLES.CENTER_OWNER]: {
    id: ROLES.CENTER_OWNER,
    name: "Center Owner",
    description: "Owns and manages training centers",
    permissions: [
      "manage:centers",
      "manage:bookings",
      "view:analytics",
      "manage:promotions",
    ],
  },
  [ROLES.PLATFORM_ADMIN]: {
    id: ROLES.PLATFORM_ADMIN,
    name: "Platform Admin",
    description: "Oversees the entire platform",
    permissions: [
      "admin:full",
      "view:logs",
      "manage:users",
      "manage:content",
      "manage:settings",
    ],
  },
  [ROLES.CONTENT_MODERATOR]: {
    id: ROLES.CONTENT_MODERATOR,
    name: "Content Moderator",
    description: "Reviews and moderates user-generated content",
    permissions: ["moderate:reviews", "moderate:forums", "moderate:blog"],
  },
  [ROLES.ADVERTISER]: {
    id: ROLES.ADVERTISER,
    name: "Advertiser",
    description: "Creates and manages advertising campaigns",
    permissions: ["manage:ads", "view:ad-analytics"],
  },
  [ROLES.SUPPORT_AGENT]: {
    id: ROLES.SUPPORT_AGENT,
    name: "Support Agent",
    description: "Handles user inquiries and support tickets",
    permissions: ["manage:tickets", "view:user-data", "support:chat"],
  },
  [ROLES.TECHNICAL_OWNER]: {
    id: ROLES.TECHNICAL_OWNER,
    name: "Technical Owner",
    description: "Maintains platform infrastructure and system health",
    permissions: [
      "admin:technical",
      "manage:apis",
      "manage:security",
      "view:system-metrics",
    ],
  },
  [ROLES.GUEST]: {
    id: ROLES.GUEST,
    name: "Guest",
    description: "Not logged in user with limited access",
    permissions: ["view:public"],
  },
  [ROLES.TEACHER]: {
    id: ROLES.TEACHER,
    name: "Teacher",
    description: "Educator who teaches courses",
    permissions: [
      "manage:courses",
      "view:students",
      "create:content",
      "view:analytics:limited",
    ],
  },
  [ROLES.LEARNER]: {
    id: ROLES.LEARNER,
    name: "Learner",
    description: "Student who takes courses",
    permissions: [
      "view:courses",
      "view:public",
      "book:sessions",
      "view:progress",
    ],
  },
};

export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return (
    userPermissions.includes(requiredPermission) ||
    userPermissions.includes("admin:full")
  );
};

export const getRoleByName = (roleName: string): Role | undefined => {
  const entry = Object.entries(ROLES).find(
    ([key, value]) => value.toLowerCase() === roleName.toLowerCase()
  );
  return entry ? (entry[1] as Role) : undefined;
};

export const getAllRoles = (): RoleDefinition[] => {
  return Object.values(ROLE_DEFINITIONS);
};
