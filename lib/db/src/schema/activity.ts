import { pgTable, text } from "drizzle-orm/pg-core";

export const activityLogTable = pgTable("activity_log", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  dogName: text("dog_name"),
  microchipId: text("microchip_id"),
  description: text("description").notNull(),
  timestamp: text("timestamp").notNull(),
});

export type ActivityItem = typeof activityLogTable.$inferSelect;
