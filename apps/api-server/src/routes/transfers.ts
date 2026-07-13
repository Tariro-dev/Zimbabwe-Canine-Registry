import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, dogsTable, transferRequestsTable, notificationsTable } from "@workspace/db";
import { genId, nowIso } from "../lib/helpers";

const router: IRouter = Router();
const CURRENT_USER_ID = "user-001";

// GET /transfers - List requests I'm involved in
router.get("/transfers", async (_req, res) => {
  const requests = await db.select()
    .from(transferRequestsTable)
    .where(
      or(
        eq(transferRequestsTable.currentOwnerId, CURRENT_USER_ID),
        eq(transferRequestsTable.newOwnerId, CURRENT_USER_ID)
      )
    );
  res.json(requests);
});

// POST /transfers - Initiate a transfer
router.post("/transfers", async (req, res) => {
  const { dogId, newOwnerId, newOwnerName } = req.body;

  const dogRows = await db.select().from(dogsTable).where(eq(dogsTable.id, dogId));
  const dog = dogRows[0];

  if (!dog || dog.ownerId !== CURRENT_USER_ID) {
    res.status(403).json({ error: "Only the owner can initiate a transfer" });
    return;
  }

  const requestId = genId();
  await db.insert(transferRequestsTable).values({
    id: requestId,
    dogId,
    currentOwnerId: CURRENT_USER_ID,
    newOwnerId,
    newOwnerName,
    status: "pending",
  });

  // Notify the new owner
  await db.insert(notificationsTable).values({
    id: genId(),
    userId: newOwnerId,
    title: "Transfer Request Received",
    message: `You have been requested to take ownership of ${dog.name}.`,
    type: "transfer_request",
    link: `/transfers`,
  });

  const created = await db.select().from(transferRequestsTable).where(eq(transferRequestsTable.id, requestId));
  res.status(201).json(created[0]);
});

// POST /transfers/:id/respond
router.post("/transfers/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'accept', 'reject', 'cancel'

  const requestRows = await db.select().from(transferRequestsTable).where(eq(transferRequestsTable.id, id));
  const request = requestRows[0];

  if (!request || request.status !== "pending") {
    res.status(404).json({ error: "Active transfer request not found" });
    return;
  }

  if (action === "accept") {
    if (request.newOwnerId !== CURRENT_USER_ID) {
      res.status(403).json({ error: "Only the recipient can accept a transfer" });
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Update request status
      await tx.update(transferRequestsTable)
        .set({ status: "accepted", completedAt: new Date() })
        .where(eq(transferRequestsTable.id, id));

      // 2. Update dog owner
      await tx.update(dogsTable)
        .set({ ownerId: request.newOwnerId, ownerName: request.newOwnerName })
        .where(eq(dogsTable.id, request.dogId));

      // 3. Notify old owner
      await tx.insert(notificationsTable).values({
        id: genId(),
        userId: request.currentOwnerId,
        title: "Transfer Completed",
        message: `The transfer of ownership has been accepted.`,
        type: "transfer_request",
      });
    });

    res.json({ message: "Transfer completed successfully" });
  } else if (action === "reject" || action === "cancel") {
    await db.update(transferRequestsTable)
      .set({ status: action === "reject" ? "rejected" : "cancelled" })
      .where(eq(transferRequestsTable.id, id));
    res.json({ message: `Transfer ${action}ed` });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

export default router;
