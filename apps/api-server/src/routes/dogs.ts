import { Router, type IRouter } from "express";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import { db, dogsTable } from "@workspace/db";
import {
  CreateDogBody,
  UpdateDogBody,
  UpdateDogHealthBody,
  TransferDogOwnershipBody,
  GetDogParams,
  UpdateDogParams,
  DeleteDogParams,
  ToggleDogStolenParams,
  UpdateDogHealthParams,
  TransferDogOwnershipParams,
  SearchDogByMicrochipQueryParams,
} from "@workspace/api-zod";
import { genId, genTxHash, today, nowIso, genCertNumber, dogToApi } from "../lib/helpers";
import { activityLogTable } from "@workspace/db";
import { authenticate, authorize, requireVerified, type AuthRequest } from "../middlewares/auth";
import { anchorCanineRecord } from "../lib/blockchain";

const router: IRouter = Router();

async function logActivity(
  type: string,
  description: string,
  dogName?: string | null,
  microchipId?: string | null,
) {
  await db.insert(activityLogTable).values({
    id: genId(),
    type,
    dogName: dogName ?? null,
    microchipId: microchipId ?? null,
    description,
    timestamp: nowIso(),
  });
}

// GET /dogs - Enhanced with filtering
router.get("/dogs", authenticate, async (req, res) => {
  const { breed, color, gender, ownerId } = req.query;

  let query = db.select().from(dogsTable);
  const filters = [];

  if (breed) filters.push(ilike(dogsTable.breed, `%${breed}%`));
  if (color) filters.push(ilike(dogsTable.color, `%${color}%`));
  if (gender) filters.push(eq(dogsTable.gender, gender as string));
  if (ownerId) filters.push(eq(dogsTable.ownerId, ownerId as string));

  const rows = await (filters.length > 0
    ? query.where(and(...filters))
    : query).orderBy(dogsTable.registrationDate);

  res.json(rows.map(dogToApi));
});

// GET /dogs/recent
router.get("/dogs/recent", async (_req, res) => {
  const rows = await db.select().from(dogsTable)
    .orderBy(sql`${dogsTable.registrationDate} DESC`)
    .limit(10);
  res.json(rows.map(dogToApi));
});

// GET /dogs/search?microchip=... (Publicly Accessible)
router.get("/dogs/search", async (req, res) => {
  const parsed = SearchDogByMicrochipQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing microchip query param" });
    return;
  }
  const { microchip } = parsed.data;
  const rows = await db
    .select()
    .from(dogsTable)
    .where(ilike(dogsTable.microchipId, microchip.trim()));
  if (!rows[0]) {
    res.status(404).json({ error: "Dog not found for that microchip ID" });
    return;
  }
  res.json(dogToApi(rows[0]));
});

// GET /dogs/:id
router.get("/dogs/:id", async (req, res) => {
  const { id } = GetDogParams.parse(req.params);
  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }
  res.json(dogToApi(rows[0]));
});

// POST /dogs
router.post("/dogs", authenticate, requireVerified, authorize(['breeder', 'regulator']), async (req: AuthRequest, res) => {
  try {
    const body = CreateDogBody.parse(req.body);
    const user = req.user!;

    const id = genId();
    const regDate = today();

    const dogData = {
      id,
      name: body.name,
      breed: body.breed,
      gender: body.gender,
      color: body.color ?? "Unknown",
      birthDate: body.birthDate,
      microchipId: body.microchipId,
      ownerId: user.id,
      ownerName: user.name,
      breederId: user.id,
      breederName: user.name,
      dameMicrochip: body.dameMicrochip ?? null,
      sireMicrochip: body.sireMicrochip ?? null,
      litterId: body.litterId ?? null,
      vaccineHistory: body.vaccineHistory ?? "",
      sterilizationStatus: body.sterilizationStatus ?? "Not Sterilized",
      dnaHash: body.dnaHash ?? null,
      weight: body.weight ?? null,
      registrationDate: regDate,
      isStolen: false,
    };

    // REAL BLOCKCHAIN ANCHORING
    const bc = await anchorCanineRecord(dogData);

    await db.insert(dogsTable).values({
      ...dogData,
      blockchainTxHash: bc.txHash,
      blockchainSyncStatus: bc.status as any,
      blockchainConfirmedAt: bc.confirmedAt,
      certNumber: genCertNumber(),
      certIssuedDate: regDate,
      certStatus: "active",
    });

    const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
    await logActivity("registration", `${body.name} registered and anchored on the ZCR blockchain`, body.name, body.microchipId);
    res.status(201).json(dogToApi(rows[0]!));
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Dog registration error:", error);
    res.status(500).json({ error: "Internal server error during dog registration" });
  }
});

// PATCH /dogs/:id
router.patch("/dogs/:id", authenticate, async (req: AuthRequest, res) => {
  const { id } = UpdateDogParams.parse(req.params);
  const body = UpdateDogBody.parse(req.body);
  const user = req.user!;

  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }

  // Only owner or regulator can update general info
  if (rows[0].ownerId !== user.id && user.role !== 'regulator') {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const updates: Partial<typeof dogsTable.$inferInsert> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.breed !== undefined) updates.breed = body.breed;
  if (body.color !== undefined) updates.color = body.color;
  if (body.weight !== undefined) updates.weight = body.weight;

  await db.update(dogsTable).set(updates).where(eq(dogsTable.id, id));
  const updated = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  res.json(dogToApi(updated[0]!));
});

// DELETE /dogs/:id
router.delete("/dogs/:id", authenticate, authorize(['regulator']), async (req, res) => {
  const { id } = DeleteDogParams.parse(req.params);
  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }
  await db.delete(dogsTable).where(eq(dogsTable.id, id));
  res.status(204).send();
});

// POST /dogs/:id/toggle-stolen
router.post("/dogs/:id/toggle-stolen", authenticate, async (req: AuthRequest, res) => {
  const { id } = ToggleDogStolenParams.parse(req.params);
  const user = req.user!;

  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }

  if (rows[0].ownerId !== user.id && user.role !== 'regulator') {
    res.status(403).json({ error: "Only owner can report stolen" });
    return;
  }

  const dog = rows[0];
  const newStolen = !dog.isStolen;
  await db.update(dogsTable).set({ isStolen: newStolen }).where(eq(dogsTable.id, id));
  const updated = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  const action = newStolen ? "flagged as stolen" : "stolen flag removed";
  await logActivity("stolen_flag", `${dog.name} ${action}`, dog.name, dog.microchipId);
  res.json(dogToApi(updated[0]!));
});

// PATCH /dogs/:id/health (VETS ONLY)
router.patch("/dogs/:id/health", authenticate, authorize(['vet', 'regulator']), async (req, res) => {
  const { id } = UpdateDogHealthParams.parse(req.params);
  const body = UpdateDogHealthBody.parse(req.body);
  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }

  await db.update(dogsTable).set({
    vaccineHistory: body.vaccineHistory,
    sterilizationStatus: body.sterilizationStatus,
    lastCheckup: body.lastCheckup ?? today(),
  }).where(eq(dogsTable.id, id));

  const updated = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  await logActivity("health_update", `Health records updated for ${rows[0].name}`, rows[0].name, rows[0].microchipId);
  res.json(dogToApi(updated[0]!));
});

// POST /dogs/:id/transfer
router.post("/dogs/:id/transfer", async (req, res) => {
  const { id } = TransferDogOwnershipParams.parse(req.params);
  const body = TransferDogOwnershipBody.parse(req.body);
  const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Dog not found" }); return; }
  await db.update(dogsTable).set({
    ownerId: body.newOwnerId,
    ownerName: body.newOwnerName,
  }).where(eq(dogsTable.id, id));
  const updated = await db.select().from(dogsTable).where(eq(dogsTable.id, id));
  await logActivity("transfer", `${rows[0].name} transferred to ${body.newOwnerName}`, rows[0].name, rows[0].microchipId);
  res.json(dogToApi(updated[0]!));
});

// GET /dogs/:id/pedigree
router.get("/dogs/:id/pedigree", async (req, res) => {
  const { id } = req.params;

  async function fetchPedigree(dogId: string, currentDepth: number): Promise<any> {
    const rows = await db.select().from(dogsTable).where(eq(dogsTable.id, dogId));
    if (!rows[0]) return null;
    const dog = rows[0];

    const node: any = {
      id: dog.id,
      name: dog.name,
      microchipId: dog.microchipId,
      breed: dog.breed,
      gender: dog.gender,
    };

    if (currentDepth > 0) {
      if (dog.sireMicrochip) {
        const sireRows = await db.select().from(dogsTable).where(eq(dogsTable.microchipId, dog.sireMicrochip));
        if (sireRows[0]) {
          node.sire = await fetchPedigree(sireRows[0].id, currentDepth - 1);
        }
      }
      if (dog.dameMicrochip) {
        const dameRows = await db.select().from(dogsTable).where(eq(dogsTable.microchipId, dog.dameMicrochip));
        if (dameRows[0]) {
          node.dame = await fetchPedigree(dameRows[0].id, currentDepth - 1);
        }
      }
    }
    return node;
  }

  const depth = parseInt(req.query.depth as string) || 3;
  const tree = await fetchPedigree(id, depth);
  if (!tree) {
    res.status(404).json({ error: "Dog not found" });
    return;
  }
  res.json(tree);
});

export default router;
