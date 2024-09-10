import type { User } from '$lib/types/user';
import { type Adapter, type DatabaseSession, type DatabaseUser } from 'lucia';
import db from '../db/db';

const exportUserAttributes = (user: User): DatabaseUser => {
	return {
		id: user.id,
		attributes: {
			email: user.email,
			name: user.name,
			sub: user.sub
		}
	};
};

function normalizeId(id: string): string {
	return id.split(':')[1];
}

export const adapter: Adapter = {
	deleteExpiredSessions: async () => {
		await db.query(`DELETE session WHERE expiresAt <= time::now()`);
	},
	deleteSession: async (sessionId: string) => {
		await db.query(`DELETE session:⟨${sessionId}⟩`);
	},
	deleteUserSessions: async (userId: string) => {
		await db.query(`DELETE session WHERE userId == "user:⟨${userId}⟩"`);
	},
	getSessionAndUser: async (
		sessionId: string
	): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> => {
		const [data] = (await db.query(`SELECT * FROM session:⟨${sessionId}⟩ FETCH userId;`)) as [
			(DatabaseSession & { userId: DatabaseUser })[]
		];

		if (data.length == 1) {
			const user = exportUserAttributes(
				Object.assign(data[0].userId, { id: normalizeId(data[0].userId.id) }) as unknown as User
			);
			const session = Object.assign(data[0], {
				id: normalizeId(data[0].id),
				userId: user.id,
				expiresAt: new Date(data[0].expiresAt)
			});

			return [session as DatabaseSession, user as DatabaseUser];
		} else {
			return [null, null];
		}
	},
	getUserSessions: async (userId: string): Promise<DatabaseSession[]> => {
		const [data] = (await db.query(`SELECT * FROM session WHERE userId == "user:⟨${userId}⟩"`)) as [
			DatabaseSession[]
		];

		return data.map((session) => {
			return Object.assign({}, session, {
				id: normalizeId(session.id),
				userId: normalizeId(session.userId),
				expiresAt: new Date(session.expiresAt)
			}) as DatabaseSession;
		});
	},
	setSession: async (session: DatabaseSession) => {
		const sessionData = Object.assign({}, session, {
			id: `session:⟨${session.id}⟩`,
			userId: `user:⟨${session.userId}⟩`,
			expiresAt: session.expiresAt.toISOString()
		});
		await db.query(`CREATE session:⟨${session.id}⟩ CONTENT $sessionData`, { sessionData });
	},
	updateSessionExpiration: async (sessionId: string, expiresAt: Date) => {
		await db.query(
			`UPDATE session:⟨${sessionId}⟩ MERGE { expiresAt: "${expiresAt.toISOString()}" }`
		);
	}
};
