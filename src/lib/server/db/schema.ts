import { relations, sql, SQL } from "drizzle-orm";
import {
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	type AnyPgColumn,
} from "drizzle-orm/pg-core";

// custom lower function
export function lower(email: AnyPgColumn): SQL {
	return sql`lower(${email})`;
}

// Users table
export const users = pgTable(
	"users",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		sub: text("sub").notNull(),
		email: text("email"),
		username: text("username"),
		name: text("name"),
	},
	(table) => [uniqueIndex("users_sub_idx").on(lower(table.sub))]
);

// Sessions Table
export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
	encryptedAccessToken: text("encrypted_access_token").notNull(),
	encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
	encryptedIdToken: text("encrypted_id_token").notNull(),
});

// session -> user relation
export const sessionUser = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

// Types
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
