import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  nationalId: text("national_id"),
  role: text("role").notNull().default("owner"), // 'owner', 'breeder', 'vet', 'regulator'
  kennelName: text("kennel_name"),
  licenseNumber: text("license_number"),
  province: text("province"),
  address: text("address"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export type DbUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
