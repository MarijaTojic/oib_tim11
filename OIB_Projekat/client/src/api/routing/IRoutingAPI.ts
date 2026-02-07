import { RouteHealth, RouteInfo } from "../../models/routing/RouteInfo";

export interface IRoutingAPI {
  getRoutes(token: string): Promise<RouteInfo[]>;
  checkHealth(token: string): Promise<RouteHealth[]>;
}
