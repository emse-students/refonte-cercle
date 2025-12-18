import { error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	const perms = await getPool().query(`
		SELECT 
			p.id, 
			p.datee, 
			p.total_vente, 
			p.total_litre,
			np.nom
		FROM perm p
		JOIN nom_perm np ON p.id_nom_perm = np.id
		ORDER BY p.id DESC
		LIMIT 50
	`) as any[];

	return {
		perms: perms.map(p => ({
			...p,
			date: new Date(p.datee * 1000)
		}))
	};
};
