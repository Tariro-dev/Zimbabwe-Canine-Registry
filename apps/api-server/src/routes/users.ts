import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateMyProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER_ID = "user-001";

// GET /users/me
router.get("/users/me", async (_req, res) => {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
  if (!rows[0]) {
    // Seed the default user on first access
    await db.insert(usersTable).values({
      id: CURRENT_USER_ID,
      name: "Thamsanqa Zwana",
      role: "breeder",
      kennelName: "Zwana Kennels",
      licenseNumber: "ZCR-BR-2024-001",
      registeredAt: "2024-01-15",
    });
    const seeded = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
    const u = seeded[0]!;
    res.json({ id: u.id, name: u.name, role: u.role, kennelName: u.kennelName ?? null, licenseNumber: u.licenseNumber ?? null, registeredAt: u.registeredAt });
    return;
  }
  const u = rows[0];
  res.json({ id: u.id, name: u.name, role: u.role, kennelName: u.kennelName ?? null, licenseNumber: u.licenseNumber ?? null, registeredAt: u.registeredAt });
});

// PATCH /users/me
router.patch("/users/me", async (req, res) => {
  const body = UpdateMyProfileBody.parse(req.body);
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
  if (!rows[0]) { res.status(404).json({ error: "User not found" }); return; }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.role !== undefined) updates.role = body.role;
  if (body.kennelName !== undefined) updates.kennelName = body.kennelName;
  if (body.licenseNumber !== undefined) updates.licenseNumber = body.licenseNumber;
  await db.update(usersTable).set(updates).where(eq(usersTable.id, CURRENT_USER_ID));
  const updated = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID));
  const u = updated[0]!;
  res.json({ id: u.id, name: u.name, role: u.role, kennelName: u.kennelName ?? null, licenseNumber: u.licenseNumber ?? null, registeredAt: u.registeredAt });
});

export default router;
