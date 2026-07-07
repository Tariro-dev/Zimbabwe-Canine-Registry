import { pgTable, text } from "drizzle-orm/pg-core";

export const littersTable = pgTable("litters", {
  id: text("id").primaryKey(),
  dameMicrochip: text("dame_microchip").notNull(),
  sireMicrochip: text("sire_microchip").notNull(),
  expectedBirthDate: text("expected_birth_date").notNull(),
  registeredAt: text("registered_at").notNull(),
  breederId: text("breeder_id").notNull(),
  breederName: text("breeder_name").notNull(),
});

export type Litter = typeof littersTable.$inferSelect;
export type InsertLitter = typeof littersTable.$inferInsert;
