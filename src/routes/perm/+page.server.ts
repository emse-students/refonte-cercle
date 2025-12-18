import { error, redirect } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	// Get active perm
	const perms = await getPool().query('SELECT p.id, np.nom, p.datee, p.total_vente FROM perm p JOIN nom_perm np ON p.id_nom_perm = np.id ORDER BY p.id DESC LIMIT 1') as any[];
	
	if (perms.length === 0) {
		return { perm: null };
	}

	const perm = perms[0];

	// Fetch last 10 transactions for this perm
	const history = await getPool().query(`
		SELECT 
			t.id, t.nb, t.prix, t.B_C_A, t.id_B_C,
			u.prenom, u.nom,
			CASE 
				WHEN t.B_C_A = 'A' THEN 'Rechargement'
				WHEN t.B_C_A = 'B' OR t.B_C_A = 'F' THEN (SELECT cu.nom FROM boisson b JOIN contenu cu ON b.id_contenu = cu.id WHERE b.id = t.id_B_C)
				WHEN t.B_C_A = 'C' THEN (SELECT c.nom FROM consommable c WHERE c.id = t.id_B_C)
				ELSE 'Autre'
			END as article
		FROM transaction t
		JOIN user u ON t.id_debiteur = u.id_user
		WHERE t.id_perm = ?
		ORDER BY t.datee DESC
		LIMIT 10
	`, [perm.id]) as any[];

	return {
		perm,
		history
	};
};
