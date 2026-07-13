import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";

const router: IRouter = Router();
const CURRENT_USER_ID = "user-001";

// GET /notifications
router.get("/notifications", async (_req, res) => {
  const rows = await db.select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, CURRENT_USER_ID))
    .orderBy(desc(notificationsTable.createdAt));
  res.json(rows);
});

// POST /notifications/:id/read
router.post("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id));
  res.status(200).send();
});

export default router;
