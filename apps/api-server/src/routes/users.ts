import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateMyProfileBody, RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import { authenticate } from "../middlewares/auth";
import { rateLimit } from "../middlewares/rate-limit";
import { genId } from "../lib/helpers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "zcr-national-secret-key-2024";

// Rate limiters
const authLimiter = rateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const registerLimiter = rateLimit(60 * 60 * 1000, 3); // 3 registrations per hour

// GET /users/me
router.get("/users/me", authenticate, async (req: any, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    nationalId: u.nationalId ?? null,
    role: u.role,
    kennelName: u.kennelName ?? null,
    licenseNumber: u.licenseNumber ?? null,
    isEmailVerified: u.isEmailVerified,
    registeredAt: u.registeredAt
  });
});

// POST /login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const body = LoginUserBody.parse(req.body);
    const { email, password } = body;

    const userRows = await db.select().from(usersTable).where(eq(usersTable.email, email));
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// POST /register
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const body = RegisterUserBody.parse(req.body);
    const { name, email, password, phone, nationalId, role, province, kennelName, licenseNumber } = body;

    // Check if user already exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = {
      id: genId(),
      name,
      email,
      passwordHash,
      phone,
      nationalId,
      role,
      province,
      kennelName,
      licenseNumber,
      verificationToken,
      isEmailVerified: false,
      registeredAt: new Date(),
    };

    await db.insert(usersTable).values(newUser);

    // TODO: Send verification email here
    console.log(`Verification token for ${email}: ${verificationToken}`);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        isEmailVerified: false
      },
      message: "Registration successful. Please check your email for verification link."
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// GET /verify-email?token=...
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Invalid verification token" });
  }

  const userRows = await db.select().from(usersTable).where(eq(usersTable.verificationToken, token));
  const user = userRows[0];

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired verification token" });
  }

  await db.update(usersTable)
    .set({ isEmailVerified: true, verificationToken: null })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Email verified successfully. You can now access all features." });
});

// PATCH /users/me
router.patch("/users/me", authenticate, async (req: any, res) => {
  try {
    const body = UpdateMyProfileBody.parse(req.body);
    const userId = req.user.id;

    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.kennelName !== undefined) updates.kennelName = body.kennelName;
    if (body.licenseNumber !== undefined) updates.licenseNumber = body.licenseNumber;

    await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));

    const updated = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const u = updated[0]!;
    res.json({
      id: u.id,
      name: u.name,
      role: u.role,
      kennelName: u.kennelName ?? null,
      licenseNumber: u.licenseNumber ?? null,
      registeredAt: u.registeredAt
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error during profile update" });
  }
});

export default router;
