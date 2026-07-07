import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const dogsTable = pgTable("dogs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  gender: text("gender").notNull(),
  color: text("color").notNull(),
  birthDate: text("birth_date").notNull(),
  microchipId: text("microchip_id").notNull().unique(),
  ownerId: text("owner_id").notNull(),
  ownerName: text("owner_name").notNull(),
  breederId: text("breeder_id").notNull(),
  breederName: text("breeder_name").notNull(),
  dameMicrochip: text("dame_microchip"),
  sireMicrochip: text("sire_microchip"),
  litterId: text("litter_id"),
  vaccineHistory: text("vaccine_history").notNull().default(""),
  sterilizationStatus: text("sterilization_status").notNull().default("Not Sterilized"),
  lastCheckup: text("last_checkup"),
  dnaHash: text("dna_hash"),
  weight: text("weight"),
  registrationDate: text("registration_date").notNull(),
  isStolen: boolean("is_stolen").notNull().default(false),
  blockchainTxHash: text("blockchain_tx_hash"),
  blockchainSyncStatus: text("blockchain_sync_status").notNull().default("confirmed"),
  blockchainConfirmedAt: text("blockchain_confirmed_at"),
  certNumber: text("cert_number"),
  certIssuedDate: text("cert_issued_date"),
  certStatus: text("cert_status"),
});

export type Dog = typeof dogsTable.$inferSelect;
export type InsertDog = typeof dogsTable.$inferInsert;
