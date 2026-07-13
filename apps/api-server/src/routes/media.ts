import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, mediaTable } from "@workspace/db";
import { genId } from "../lib/helpers";

const router: IRouter = Router();

// GET /dogs/:id/media
router.get("/dogs/:id/media", async (req, res) => {
  const { id } = req.params;
  const rows = await db.select().from(mediaTable).where(eq(mediaTable.dogId, id));
  res.json(rows);
});

// POST /dogs/:id/media
router.post("/dogs/:id/media", async (req, res) => {
  const { id } = req.params;
  const { url, type, description } = req.body;

  const mediaId = genId();
  await db.insert(mediaTable).values({
    id: mediaId,
    dogId: id,
    url,
    type,
    description,
  });

  const created = await db.select().from(mediaTable).where(eq(mediaTable.id, mediaId));
  res.status(201).json(created[0]);
});

export default router;
