export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latency?: number;
  message?: string;
  lastCheck: string;
}

export interface DatabaseHealth {
  status: HealthStatus;
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  latency: number;
  size: string;
  lastBackup?: string;
}

export interface ApiHealth {
  status: HealthStatus;
  uptime: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface ServerResources {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface ErrorMetric {
  timestamp: string;
  count: number;
  errorRate: number;
}

export interface ResponseTimeMetric {
  timestamp: string;
  avg: number;
  p95: number;
  p99: number;
}

export interface SystemHealthResponse {
  overall: HealthStatus;
  database: DatabaseHealth;
  api: ApiHealth;
  services: ServiceHealth[];
  resources?: ServerResources;
  errorMetrics: ErrorMetric[];
  responseTimeMetrics: ResponseTimeMetric[];
  lastUpdated: string;
}
