import { error, redirect } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals?.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	// Fetch Drinks
	const drinks = (await getPool().query(`
		SELECT 
			b.id, 
			b.prix_vente, 
			b.prix_achat,
			cu.nom as nom_contenu, 
			ct.nom as nom_contenant
		FROM boisson b
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		ORDER BY cu.nom ASC
	`)) as any[];

	// Fetch Snacks
	const snacks = (await getPool().query(`
		SELECT 
			c.id, 
			c.nom, 
			c.prix_vente,
			c.prix_achat
		FROM consommable c
		ORDER BY c.nom ASC
	`)) as any[];

	return {
		drinks: drinks.map((d) => ({ ...d, type: 'B', name: `${d.nom_contenu} ${d.nom_contenant}` })),
		snacks: snacks.map((s) => ({ ...s, type: 'C', name: s.nom }))
	};
};

export const actions = {
	updatePrice: async ({ request, locals }) => {
		if (!locals?.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
			throw error(403, 'Unauthorized');
		}

		const data = await request.formData();
		const id = data.get('id');
		const type = data.get('type');
		const price = parseFloat(data.get('price') as string);

		if (!id || !type || isNaN(price)) {
			return { success: false, message: 'Invalid data' };
		}

		if (type === 'B') {
			await getPool().query('UPDATE boisson SET prix_vente = ? WHERE id = ?', [price, id]);
		} else if (type === 'C') {
			await getPool().query('UPDATE consommable SET prix_vente = ? WHERE id = ?', [price, id]);
		}

		return { success: true };
	}
};
