export interface TeamAvailability {
  available: number;
  busy: number;
  away: number;
  offline: number;
}

export interface RecentActivity {
  tasksCompletedToday: number;
  bugsFixedToday: number;
  featuresApprovedToday: number;
}

export interface DashboardStats {
  activeSprints: number;
  pendingTasks: number;
  openBugs: number;
  upcomingReleases: number;
  teamAvailability: TeamAvailability;
  recentActivity: RecentActivity;
}

export interface ActivityItem {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: 'task' | 'bug' | 'feature' | 'sprint' | 'release';
  entityId: string;
  entityTitle: string;
  action: string;
  timestamp: string;
}

export interface SprintSummary {
  id: string;
  name: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining: number;
  velocity: number;
  teamMembers: number;
}

export interface ActivityFeedResponse {
  data: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SprintSummaryResponse {
  activeSprints: SprintSummary[];
}
