import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { dogsTable } from "./dogs";

export const mediaTable = pgTable("media", {
  id: text("id").primaryKey(),
  dogId: text("dog_id").references(() => dogsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image', 'document', 'dna_report'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Media = typeof mediaTable.$inferSelect;
export type InsertMedia = typeof mediaTable.$inferInsert;
