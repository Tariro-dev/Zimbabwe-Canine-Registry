import type { Request, Response, NextFunction } from "express";

const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter
 * @param windowMs Time window in milliseconds
 * @param max Max attempts per window
 */
export const rateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let attempt = attempts.get(ip);

    if (!attempt || now > attempt.resetAt) {
      attempt = { count: 1, resetAt: now + windowMs };
      attempts.set(ip, attempt);
      return next();
    }

    attempt.count++;

    if (attempt.count > max) {
      const retryAfter = Math.ceil((attempt.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        error: "Too many requests, please try again later.",
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
};
