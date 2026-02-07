import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../../types/ApiResponse";
import { RouteHealth, RouteInfo } from "../../models/routing/RouteInfo";
import { IRoutingAPI } from "./IRoutingAPI";

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

export class RoutingAPI implements IRoutingAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 8000,
    });
  }

  async getRoutes(token: string): Promise<RouteInfo[]> {
    const response = await this.axiosInstance.get<ApiResponse<RouteInfo[]>>("/routing/routes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async checkHealth(token: string): Promise<RouteHealth[]> {
    const response = await this.axiosInstance.get<ApiResponse<RouteHealth[]>>("/routing/health", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }
}
