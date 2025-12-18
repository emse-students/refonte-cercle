import { error } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const load = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user) {
		throw error(403, 'Unauthorized');
	}

	const idParam = url.searchParams.get('id');
	let targetUserId = idParam ? parseInt(idParam) : session.user.id;

	// If trying to view another user's account, check permissions
	if (targetUserId !== session.user.id) {
		if (session.user.droit !== 'cercle' && session.user.droit !== 'cercleux') {
			throw error(403, 'Unauthorized');
		}
	}
	
	// If id=0 and admin, show global history (PHP logic)
	// But here let's stick to user history or specific user history.
	// If the user wants global history, maybe that's a different view or handled by id=0.
	// The PHP code uses id=0 for global history.
	
	let transactions = [];
	let targetUser = null;

	if (targetUserId === 0) {
		if (session.user.droit !== 'cercle' && session.user.droit !== 'cercleux') {
			throw error(403, 'Unauthorized');
		}
		// Global history
		transactions = await query(`
			SELECT 
				t.id, t.datee, t.nb, t.prix, t.B_C_A, t.id_B_C,
				u.prenom, u.nom, u.login,
				np.nom as perm_nom,
				CASE 
					WHEN t.B_C_A = 'A' THEN 'Rechargement'
					WHEN t.B_C_A = 'B' OR t.B_C_A = 'F' THEN (SELECT cu.nom FROM boisson b JOIN contenu cu ON b.id_contenu = cu.id WHERE b.id = t.id_B_C)
					WHEN t.B_C_A = 'C' THEN (SELECT c.nom FROM consommable c WHERE c.id = t.id_B_C)
					ELSE 'Autre'
				END as item_nom
			FROM transaction t
			JOIN user u ON t.id_debiteur = u.id_user
			LEFT JOIN perm p ON t.id_perm = p.id
			LEFT JOIN nom_perm np ON p.id_nom_perm = np.id
			ORDER BY t.datee DESC
			LIMIT 50
		`) as any[];
	} else {
		// Specific user history
		const userRes = await query('SELECT id_user as id, nom, prenom, login, solde, promo, droit FROM user WHERE id_user = ?', [targetUserId]) as any[];
		if (userRes.length === 0) {
			throw error(404, 'User not found');
		}
		targetUser = userRes[0];

		transactions = await query(`
			SELECT 
				t.id, t.datee, t.nb, t.prix, t.B_C_A, t.id_B_C,
				np.nom as perm_nom,
				CASE 
					WHEN t.B_C_A = 'A' THEN 'Rechargement'
					WHEN t.B_C_A = 'B' OR t.B_C_A = 'F' THEN (SELECT cu.nom FROM boisson b JOIN contenu cu ON b.id_contenu = cu.id WHERE b.id = t.id_B_C)
					WHEN t.B_C_A = 'C' THEN (SELECT c.nom FROM consommable c WHERE c.id = t.id_B_C)
					ELSE 'Autre'
				END as item_nom
			FROM transaction t
			LEFT JOIN perm p ON t.id_perm = p.id
			LEFT JOIN nom_perm np ON p.id_nom_perm = np.id
			WHERE t.id_debiteur = ?
			ORDER BY t.datee DESC
			LIMIT 50
		`, [targetUserId]) as any[];
	}

	return {
		transactions: transactions.map(t => ({
			...t,
			date: new Date(t.datee * 1000)
		})),
		targetUser,
		isGlobal: targetUserId === 0
	};
};
