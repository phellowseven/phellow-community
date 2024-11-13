import { env } from '$env/dynamic/private';
import { Surreal } from 'surrealdb.wasm';

const db = new Surreal();

export async function connectDB() {
	await db.connect(env.SURREALDB_URL);
	await db.signin({
		username: env.SURREALDB_USER,
		password: env.SURREALDB_PASS
	});
	await db.use({
		namespace: env.SURREALDB_NS,
		database: env.SURREALDB_DB
	});
}

export default db;
