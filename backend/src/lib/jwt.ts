import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key-change-in-production";

export function signToken(payload: { userId: number }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
}
