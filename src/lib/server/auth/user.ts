import type { User } from '$lib/types/user';
import db from '../db/db';
// import type { Role } from './lucia';

export async function createUser(data: Omit<User, 'id'>): Promise<User | null> {
	const user = await getUserBySubjectID(data.sub);
	if (user) {
		await db.update(`user:${user.id}`, data);
	} else {
		await db.create('user', data);
	}

	return getUserBySubjectID(data.sub);
}

export async function getUserByEmail(email: string): Promise<User | null> {
	const [users] = (await db.query(
		`SELECT *, <string> meta::id(id) as id FROM user WHERE email = '${email}';`
	)) as [User[]];

	if (users.length == 0) return null;

	return users[0];
}

export async function getUserBySubjectID(id: string): Promise<User | null> {
	const [users] = (await db.query(
		`SELECT *, <string> meta::id(id) as id FROM user WHERE sub = '${id}';`
	)) as [User[]];

	if (users.length == 0) return null;

	return users[0];
}
