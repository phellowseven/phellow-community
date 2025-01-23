import { eq } from "drizzle-orm/expressions";
import { db } from "../db";
import { sessions, type NewSession, type Session, type User } from "../db/schema";
import { logger } from "../logger";

const sessionServiceLogger = logger.child({ module: "SessionService" });

export class SessionService {
	static async create(session: NewSession): Promise<Session> {
		sessionServiceLogger.trace({ session }, "Creating session");
		const [created] = await db.insert(sessions).values(session).returning();
		return created;
	}

	static async findBySessionId(
		sessionId: string
	): Promise<{ user: User | undefined; session: Session | undefined }> {
		sessionServiceLogger.trace({ sessionId }, "Finding session by id");
		const result = await db.query.sessions.findFirst({
			where: eq(sessions.id, sessionId),
			with: { user: true },
		});
		if (!result) {
			sessionServiceLogger.trace({ sessionId }, "Session not found");
			return { user: undefined, session: undefined };
		}

		const { user, ...session } = result;
		return { user, session };
	}

	static async updateSession(session: Session): Promise<Session> {
		sessionServiceLogger.trace({ session }, "Updating session");
		const [updated] = await db.update(sessions).set(session).returning();
		return updated;
	}

	static async deleteSession(sessionId: string): Promise<void> {
		sessionServiceLogger.trace({ sessionId }, "Deleting session");
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	}

	static async deleteSessionsForUser(userId: number): Promise<void> {
		sessionServiceLogger.trace({ userId }, "Deleting sessions for user");
		await db.delete(sessions).where(eq(sessions.userId, userId));
	}
}
