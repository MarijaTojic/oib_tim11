import { Request, Response, NextFunction } from "express";

/**
 * Middleware za validaciju da zahtevi dolaze samo od klijentske aplikacije
 * ili drugih autorizovanih izvora. Ovo je dodatni sloj zaštite mikroservisa.
 */
export const validateOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.get("origin");
  const allowedOrigin = process.env.CORS_ORIGIN;

  // Ako je origin undefined (npr. Postman), propustamo u development modu
  if (!origin && process.env.NODE_ENV === "development") {
    next();
    return;
  }

  if (origin && origin !== allowedOrigin) {
    res.status(403).json({
      success: false,
      message: "Access forbidden: Invalid origin",
    });
    return;
  }

  next();
};
