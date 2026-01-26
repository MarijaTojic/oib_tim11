import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("user-agent") || "unknown";

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
};
