import { error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	if (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux') {
		throw error(403, 'Unauthorized');
	}

	// Get latest perm
	const perms =
		await db`SELECT p.id, np.nom, p.datee FROM perm p JOIN nom_perm np ON p.id_nom_perm = np.id ORDER BY p.id DESC LIMIT 1`;

	if (perms.length === 0) {
		return { perm: null, stats: [] };
	}

	const perm = perms[0];
	const permId = perm.id;

	// Aggregate Sales
	// We can combine the queries or keep them separate.
	// Let's try to combine B and F since they join the same tables.

	const drinks = await db`
		SELECT 
			o.B_C_A as type,
			o.id_B_C, 
			cu.nom as nom_contenu, 
			ct.nom as nom_contenant,
			ct.capacite,
			ct.type as type_contenant,
			SUM(o.nb) as total_nb, 
			SUM(o.prix) as total_prix 
		FROM transaction o
		JOIN boisson b ON o.id_B_C = b.id
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		WHERE o.id_perm = ${permId} AND (o.B_C_A = 'B' OR o.B_C_A = 'F')
		GROUP BY o.B_C_A, o.id_B_C
	`;

	const snacks = await db`
		SELECT 
			'C' as type,
			o.id_B_C, 
			c.nom as nom_consommable, 
			SUM(o.nb) as total_nb, 
			SUM(o.prix) as total_prix 
		FROM transaction o
		JOIN consommable c ON o.id_B_C = c.id
		WHERE o.id_perm = ${permId} AND o.B_C_A = 'C'
		GROUP BY o.id_B_C
	`;

	// Process data to match the view needs
	const stats = [...drinks, ...snacks].map((item) => {
		let nom = '';
		let volume = 0;

		if (item.type === 'C') {
			nom = item.nom_consommable;
		} else {
			nom = `${item.nom_contenu} (${item.nom_contenant})`;
			// Volume calc from legacy code
			if (item.type_contenant === 'bouteille_unique') {
				volume = item.total_nb * item.capacite;
			} else {
				volume = item.total_nb * 0.25; // Default to 25cl?
			}
		}

		return {
			...item,
			nom,
			volume,
			total_prix: Math.abs(item.total_prix) // Prices are stored as negative for debits?
		} as any;
	});

	return {
		perm,
		stats
	};
};
