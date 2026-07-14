import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "zcr-national-secret-key-2024";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      // Fallback for dev testing if x-user-id is still used, but prefer Bearer token
      const devUserId = req.headers["x-user-id"] as string;
      if (devUserId && process.env.NODE_ENV !== "production") {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.id, devUserId));
        if (userRows[0]) {
          req.user = userRows[0];
          return next();
        }
      }
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const userRows = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id));
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    return next();
  };
};
