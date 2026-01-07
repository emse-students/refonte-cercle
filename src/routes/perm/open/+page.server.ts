import { error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	if (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux') {
		throw error(403, 'Unauthorized');
	}

	const permTypes =
		await db`SELECT id, nom, annee FROM nom_perm WHERE isactiv=1 AND id<>1 ORDER BY nom ASC`;

	return {
		permTypes
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
			throw error(403, 'Unauthorized');
		}

		const data = await request.formData();
		const permTypeId = data.get('permTypeId');

		if (!permTypeId) {
			return { success: false, message: 'Please select a perm type' };
		}

		// Create new perm
		// Legacy: INSERT INTO perm VALUES (null,?,?,0,0) -> id, id_nom_perm, datee, total_vente, total_litre
		const datee = Math.floor(Date.now() / 1000); // PHP time() is seconds

		await db`INSERT INTO perm (id_nom_perm, datee, total_vente, total_litre) VALUES (${permTypeId}, ${datee}, 0, 0)`;

		throw redirect(302, '/pos');
	}
};
