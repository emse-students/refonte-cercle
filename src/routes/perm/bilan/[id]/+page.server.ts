import { error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals, params }) => {
	if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	const permId = parseInt(params.id);
	if (isNaN(permId)) throw error(400, 'Invalid ID');

	// Perm Details
	const permRes = await getPool().query(`
		SELECT p.id, p.datee, p.total_vente, p.total_litre, np.nom
		FROM perm p
		JOIN nom_perm np ON p.id_nom_perm = np.id
		WHERE p.id = ?
	`, [permId]) as any[];

	if (permRes.length === 0) throw error(404, 'Perm not found');
	const perm = permRes[0];

	// Drinks Sales (B)
	const drinks = await getPool().query(`
		SELECT 
			SUM(t.nb) as nb, 
			SUM(ABS(t.prix)) as total_prix, 
			cu.nom, 
			ct.nom as contenant,
			ct.capacite,
			ct.type as contenant_type
		FROM transaction t
		JOIN boisson b ON t.id_B_C = b.id
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		WHERE t.id_perm = ? AND t.B_C_A = 'B'
		GROUP BY t.id_B_C
		ORDER BY nb DESC
	`, [permId]) as any[];

	// Free Drinks (F)
	const freeDrinks = await getPool().query(`
		SELECT 
			SUM(t.nb) as nb, 
			SUM(ABS(t.prix)) as total_prix, 
			cu.nom, 
			ct.nom as contenant
		FROM transaction t
		JOIN boisson b ON t.id_B_C = b.id
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		WHERE t.id_perm = ? AND t.B_C_A = 'F'
		GROUP BY t.id_B_C
		ORDER BY nb DESC
	`, [permId]) as any[];

	// Snacks (C)
	const snacks = await getPool().query(`
		SELECT 
			SUM(t.nb) as nb, 
			SUM(ABS(t.prix)) as total_prix, 
			c.nom
		FROM transaction t
		JOIN consommable c ON t.id_B_C = c.id
		WHERE t.id_perm = ? AND t.B_C_A = 'C'
		GROUP BY t.id_B_C
		ORDER BY nb DESC
	`, [permId]) as any[];

	return {
		perm: {
			...perm,
			date: new Date(perm.datee * 1000)
		},
		drinks,
		freeDrinks,
		snacks
	};
};
