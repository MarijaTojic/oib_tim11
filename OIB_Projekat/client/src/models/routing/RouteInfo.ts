export type RouteStatus = "healthy" | "warning" | "down" | "unknown";

export interface RouteInfo {
  service: string;
  baseUrl: string;
}

export interface RouteHealth extends RouteInfo {
  status: RouteStatus;
  latencyMs: number | null;
  checkedAt: string;
}
