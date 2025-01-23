import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser, type User } from "../db/schema";
import { logger } from "../logger";

const userServiceLogger = logger.child({ module: "UserService" });

export class UserService {
	static async create(user: NewUser): Promise<User> {
		userServiceLogger.trace({ user }, "Creating user");
		const [created] = await db.insert(users).values(user).returning();
		return created;
	}

	static async findBySubId(sub: string): Promise<User | undefined> {
		userServiceLogger.trace({ sub }, "Finding user by sub");
		const result = await db.query.users.findFirst({ where: eq(users.sub, sub) });
		return result;
	}

	static async updateUser(user: User): Promise<User> {
		userServiceLogger.trace({ user }, "Updating user");
		const { id, ...rest } = user;
		const [updated] = await db.update(users).set(rest).where(eq(users.id, id)).returning();
		return updated;
	}
}
