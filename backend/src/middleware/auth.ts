import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/auth";

// Расширяем тип Request, добавляя user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | null;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token);
  } catch (err) {
    req.user = null; // токен недействителен – считаем гостем
  }
  next();
}
