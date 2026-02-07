export type RouteStatus = "healthy" | "warning" | "down" | "unknown";

export interface RouteInfoDTO {
  service: string;
  baseUrl: string;
}

export interface RouteHealthDTO extends RouteInfoDTO {
  status: RouteStatus;
  latencyMs: number | null;
  checkedAt: string;
}
