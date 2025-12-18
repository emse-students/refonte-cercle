import { error, redirect } from '@sveltejs/kit';
import db, { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	// Get active perm
	const perms = await db`SELECT p.id, np.nom FROM perm p JOIN nom_perm np ON p.id_nom_perm = np.id ORDER BY p.id DESC LIMIT 1`;
	if (perms.length === 0) {
		throw redirect(302, '/perm/open');
	}
	const perm = perms[0];

	// Get Inventory
	// Drinks
	const drinks = await db`
		SELECT 
			b.id, 
			b.prix_vente, 
			cu.nom as nom_contenu, 
			ct.nom as nom_contenant,
			ct.capacite,
			ct.type as type_contenant
		FROM inventaire_perm ip
		JOIN boisson b ON ip.id_B_C = b.id
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		WHERE ip.id_perm = ${perm.id} AND ip.B_C = 'B'
		ORDER BY cu.nom ASC
	`;

	// Snacks
	const snacks = await db`
		SELECT 
			c.id, 
			c.nom, 
			c.prix_vente 
		FROM inventaire_perm ip
		JOIN consommable c ON ip.id_B_C = c.id
		WHERE ip.id_perm = ${perm.id} AND ip.B_C = 'C'
		ORDER BY c.nom ASC
	`;

	// Users (Lightweight list for search)
	// We might want to fetch this via an API endpoint if the list is huge, 
	// but for now let's load it.
	const users = await db`SELECT id_user, login, prenom, nom, solde FROM user WHERE droit <> "aucun" ORDER BY nom ASC`;

	return {
		perm,
		drinks: drinks.map(d => ({ 
			...d, 
			type: 'B', 
			name: `${d.nom_contenu} ${d.nom_contenant}`,
			volume: d.type_contenant === 'bouteille_unique' ? d.capacite : 0.25
		})),
		snacks: snacks.map(s => ({ ...s, type: 'C', name: s.nom })),
		users: users.map(u => ({ ...u, name: `${u.prenom} ${u.nom}` }))
	};
};

export const actions = {
	transaction: async ({ request, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const data = await request.formData();
		const userId = data.get('userId');
		const cartJson = data.get('cart');
		const permId = data.get('permId');

		if (!userId || !cartJson || !permId) {
			return { success: false, message: 'Invalid data' };
		}

		const cart = JSON.parse(cartJson as string);
		if (cart.length === 0) {
			return { success: false, message: 'Cart is empty' };
		}

		const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

		// Execute Transaction
		const connection = await getPool().getConnection();
		
		try {
			await connection.beginTransaction();

			// 1. Update User Balance
			// Check balance first? Legacy allows negative balance? 
			// "solde_negatif" variable in get_users.php suggests yes.
			await connection.execute('UPDATE user SET solde = solde - ? WHERE id_user = ?', [totalAmount, userId]);

			// 2. Insert Transactions
			const datee = Math.floor(Date.now() / 1000);
			const bartenderId = locals.user.id; // Current logged in user

			for (const item of cart) {
				// item: { id, type ('B' or 'C'), price, quantity, volume (if B) }
				
				await connection.execute(
					'INSERT INTO transaction (id_user, id_cercle, id_perm, B_C_A, id_B_C, datee, nb, prix) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
					[userId, bartenderId, permId, item.type, item.id, datee, item.quantity, -item.price]
				);

				if (item.type === 'B' && item.volume) {
					await connection.execute(
						'UPDATE perm SET total_litre = total_litre + ? WHERE id = ?',
						[item.volume * item.quantity, permId]
					);
				}
			}

			await connection.commit();
		} catch (e) {
			await connection.rollback();
			console.error(e);
			return { success: false, message: 'Transaction failed' };
		} finally {
			connection.release();
		}

		return { success: true };
	}
};
