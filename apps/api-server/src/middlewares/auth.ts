import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // In a real app, we'd verify a JWT here.
  // For this implementation, we'll use a 'x-user-id' header to simulate a logged-in user.
  const userId = req.headers["x-user-id"] as string || "user-001";

  const userRows = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = userRows[0];

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  next();
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};
