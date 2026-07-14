import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, littersTable, dogsTable, activityLogTable } from "@workspace/db";
import {
  CreateLitterBody,
  GetLitterParams,
  DeleteLitterParams,
} from "@workspace/api-zod";
import { genId, today, nowIso, genCertNumber } from "../lib/helpers";
import { authenticate, authorize, requireVerified, type AuthRequest } from "../middlewares/auth";
import { anchorCanineRecord } from "../lib/blockchain";

const router: IRouter = Router();

// GET /litters
router.get("/litters", async (_req, res) => {
  const rows = await db.select().from(littersTable).orderBy(littersTable.registeredAt);
  res.json(rows);
});

// GET /litters/:id
router.get("/litters/:id", async (req, res) => {
  const { id } = GetLitterParams.parse(req.params);
  const rows = await db.select().from(littersTable).where(eq(littersTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Litter not found" }); return; }
  res.json(rows[0]);
});

// POST /litters
router.post("/litters", authenticate, requireVerified, authorize(['breeder', 'regulator']), async (req: AuthRequest, res) => {
  try {
    const body = CreateLitterBody.parse(req.body);
    const user = req.user!;
    const id = genId();
    const regAt = today();

    await db.insert(littersTable).values({
      id,
      dameMicrochip: body.dameMicrochip,
      sireMicrochip: body.sireMicrochip,
      expectedBirthDate: body.expectedBirthDate,
      registeredAt: regAt,
      breederId: user.id,
      breederName: user.name,
    });

    await db.insert(activityLogTable).values({
      id: genId(),
      type: "litter",
      dogName: null,
      microchipId: body.dameMicrochip,
      description: `Litter pre-registered by ${user.name} (dame: ${body.dameMicrochip})`,
      txHash: null,
      timestamp: nowIso(),
    });

    const rows = await db.select().from(littersTable).where(eq(littersTable.id, id));
    return res.status(201).json(rows[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Litter registration error:", error);
    return res.status(500).json({ error: "Internal server error during litter registration" });
  }
});

// POST /litters/:id/register-puppies (Litter Management Workflow)
router.post("/litters/:id/register-puppies", authenticate, requireVerified, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const puppies = req.body.puppies as any[]; // Array of { name, gender, color, microchipId }
    const user = req.user!;

    const litterRows = await db.select().from(littersTable).where(eq(littersTable.id, id));
    if (!litterRows[0]) return res.status(404).json({ error: "Litter not found" });
    const litter = litterRows[0];

    if (litter.breederId !== user.id && user.role !== 'regulator') {
      return res.status(403).json({ error: "Only the breeder can register puppies from this litter" });
    }

    const results = [];
    for (const p of puppies) {
      const dogId = genId();
      const dogData = {
        id: dogId,
        name: p.name,
        breed: "Unknown",
        gender: p.gender,
        color: p.color,
        birthDate: litter.expectedBirthDate,
        microchipId: p.microchipId,
        ownerId: user.id,
        ownerName: user.name,
        breederId: litter.breederId,
        breederName: litter.breederName,
        dameMicrochip: litter.dameMicrochip,
        sireMicrochip: litter.sireMicrochip,
        litterId: litter.id,
        registrationDate: today(),
        vaccineHistory: "",
        sterilizationStatus: "Not Sterilized",
        isStolen: false,
        blockchainSyncStatus: "pending" as const,
      };

      // Actual Blockchain Anchoring via Viem Keccak256
      const bc = await anchorCanineRecord(dogData);

      await db.insert(dogsTable).values({
        ...dogData,
        blockchainTxHash: bc.txHash,
        blockchainSyncStatus: bc.status as any,
        blockchainConfirmedAt: bc.confirmedAt,
        certNumber: genCertNumber(),
        certIssuedDate: today(),
        certStatus: "active",
      });
      results.push(dogId);
    }

    res.status(201).json({ registeredCount: results.length, dogIds: results });
    return;
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Puppy registration error:", error);
    return res.status(500).json({ error: "Internal server error during puppy registration" });
  }
});

export default router;
