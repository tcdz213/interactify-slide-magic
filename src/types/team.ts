// Team member types matching the API

export type TeamMemberStatus = 'active' | 'away' | 'offline';
export type TeamRole = 'admin' | 'tech_lead' | 'senior_developer' | 'developer' | 'junior_developer' | 'devops' | 'qa';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  tasksCompleted: number;
  prsMerged: number;
  currentTasks: number;
  storyPoints: number;
  availability: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface CreateTeamMemberRequest {
  email: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRequest {
  role?: TeamRole;
  status?: TeamMemberStatus;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: TeamRole;
  message?: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  tasksCompleted: number;
  prsMerged: number;
  activeTasks: number;
  totalStoryPoints: number;
}

export interface TeamListParams {
  page?: number;
  limit?: number;
  status?: TeamMemberStatus;
  role?: TeamRole;
  search?: string;
  sortBy?: 'name' | 'joinedAt' | 'tasksCompleted' | 'prsMerged';
  sortOrder?: 'asc' | 'desc';
}

export interface TeamListResponse {
  data: TeamMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
