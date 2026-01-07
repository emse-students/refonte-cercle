import { createPool, type Pool, type RowDataPacket } from 'mysql2/promise';
import { env } from '$env/dynamic/private';

let pool: Pool | null = null;

function ensurePool() {
	if (!pool) {
		pool = createPool({
			host: env.DB_HOST,
			user: env.DB_USER,
			password: env.DB_PASSWORD,
			database: env.DB_NAME,
			port: Number(env.DB_PORT) || 3306,
			connectionLimit: 10
		});
	}
}

export default async function db<T = RowDataPacket>(
	strings: TemplateStringsArray,
	...values: unknown[]
) {
	const query = strings.reduce((prev, curr, i) => prev + curr + (i < values.length ? '?' : ''), '');
	const rows = (await getPool().query<RowDataPacket[]>(query, values))[0];
	return rows as T[];
}

export function getPool(): Pool {
	ensurePool();
	return pool as Pool;
}

export { escape } from 'mysql2/promise';
