import { error, redirect } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	// Fetch all users for the search autocomplete
	const users = (await getPool().query(
		'SELECT id_user, prenom, nom, solde, login FROM user WHERE droit <> "aucun" ORDER BY nom ASC'
	)) as any[];

	return {
		users: users.map((u) => ({ ...u, name: `${u.prenom} ${u.nom}` }))
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
			throw error(403, 'Unauthorized');
		}

		const data = await request.formData();
		const userId = data.get('userId');
		const amount = parseFloat(data.get('amount') as string);

		if (!userId || isNaN(amount) || amount <= 0) {
			return { success: false, message: 'Invalid data' };
		}

		const bartenderId = locals.user.id;
		const datee = Math.floor(Date.now() / 1000);

		const pool = getPool();
		const connection = await pool.getConnection();

		try {
			await connection.beginTransaction();

			// Insert Transaction (Recharge)
			await connection.execute(
				'INSERT INTO transaction (id_user, id_cercle, id_perm, B_C_A, id_B_C, datee, nb, prix) VALUES (?, ?, 2, "A", 0, ?, 1, ?)',
				[userId, bartenderId, datee, amount]
			);

			// Update User Balance
			await connection.execute('UPDATE user SET solde = solde + ? WHERE id_user = ?', [
				amount,
				userId
			]);

			await connection.commit();
		} catch (e) {
			await connection.rollback();
			console.error(e);
			return { success: false, message: 'Recharge failed' };
		} finally {
			connection.release();
		}

		return { success: true, message: 'Recharge successful' };
	}
};
