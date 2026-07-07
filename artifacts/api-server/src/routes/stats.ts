import { Router, type IRouter } from "express";
import { db, dogsTable, littersTable, activityLogTable, usersTable } from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";
import { authenticate, authorize } from "../middlewares/auth";

const router: IRouter = Router();

// GET /stats/dashboard
router.get("/stats/dashboard", async (_req, res) => {
  const [dogs, litters, activity] = await Promise.all([
    db.select().from(dogsTable),
    db.select().from(littersTable),
    db.select().from(activityLogTable),
  ]);

  const now = new Date();
  const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const stolenReports = dogs.filter(d => d.isStolen).length;
  const sterilizedCount = dogs.filter(d => d.sterilizationStatus === "Sterilized").length;
  const blockchainConfirmed = dogs.filter(d => d.blockchainSyncStatus === "confirmed").length;
  const registeredThisMonth = dogs.filter(d => d.registrationDate.startsWith(thisMonthPrefix)).length;

  // Breed breakdown
  const breedMap = new Map<string, number>();
  for (const d of dogs) {
    breedMap.set(d.breed, (breedMap.get(d.breed) ?? 0) + 1);
  }
  const breedBreakdown = Array.from(breedMap.entries())
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Recent activity
  const recentActivity = activity
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20)
    .map(a => ({
      id: a.id,
      type: a.type,
      dogName: a.dogName ?? null,
      microchipId: a.microchipId ?? null,
      description: a.description,
      timestamp: a.timestamp,
    }));

  res.json({
    totalDogs: dogs.length,
    totalLitters: litters.length,
    stolenReports,
    sterilizedCount,
    blockchainConfirmed,
    registeredThisMonth,
    breedBreakdown,
    recentActivity,
  });
});

// GET /stats/regulator (REGULATOR ONLY)
router.get("/stats/regulator", authenticate, authorize(['regulator']), async (_req, res) => {
  const [userRoles, dogStatus] = await Promise.all([
    db.select({ role: usersTable.role, count: count() }).from(usersTable).groupBy(usersTable.role),
    db.select({ status: dogsTable.blockchainSyncStatus, count: count() }).from(dogsTable).groupBy(dogsTable.blockchainSyncStatus),
  ]);

  // Simulated province-based breakdown (Zimbabwe has 10 provinces)
  const provinces = [
    "Harare", "Bulawayo", "Manicaland", "Mashonaland Central", "Mashonaland East",
    "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
  ];

  const regionalData = provinces.map(p => ({
    province: p,
    registeredDogs: Math.floor(Math.random() * 500) + 50,
    activeVets: Math.floor(Math.random() * 20) + 2,
    vaccinationRate: (Math.random() * 30 + 60).toFixed(1) + "%"
  }));

  res.json({
    userRoles,
    dogStatus,
    regionalData,
    healthCompliance: {
      fullyVaccinated: "72%",
      overdue: "15%",
      unverified: "13%"
    }
  });
});

export default router;
