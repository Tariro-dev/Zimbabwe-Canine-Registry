import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { dogsTable } from "./dogs";

export const transferRequestsTable = pgTable("transfer_requests", {
  id: text("id").primaryKey(),
  dogId: text("dog_id").references(() => dogsTable.id, { onDelete: "cascade" }).notNull(),
  currentOwnerId: text("current_owner_id").notNull(),
  newOwnerId: text("new_owner_id").notNull(),
  newOwnerName: text("new_owner_name").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'cancelled'
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type TransferRequest = typeof transferRequestsTable.$inferSelect;
export type InsertTransferRequest = typeof transferRequestsTable.$inferInsert;
