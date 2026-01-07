import { error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	const [contenusRaw, contenants, users, nomPerms, permMembers, constantes] = await Promise.all([
		getPool().query(`
			SELECT 
				c.id, c.nom, c.type, c.degre, c.description,
				b.id as boisson_id, b.prix_vente, b.prix_achat,
				ct.id as contenant_id, ct.nom as contenant_nom, ct.capacite, ct.type as contenant_type, ct.consigne
			FROM contenu c 
			LEFT JOIN boisson b ON c.id = b.id_contenu 
			LEFT JOIN contenant ct ON b.id_contenant = ct.id 
			ORDER BY c.nom
		`),
		getPool().query('SELECT * FROM contenant ORDER BY nom'),
		getPool().query(
			'SELECT id_user as id, nom, prenom, login, droit, solde, promo, type FROM user ORDER BY nom'
		),
		getPool().query(
			'SELECT id, nom, annee FROM nom_perm WHERE id <> 1 AND isactiv = 1 ORDER BY nom'
		),
		getPool().query(`
			SELECT mp.id_nom_perm, u.id_user, u.prenom, u.nom, u.login 
			FROM user u 
			JOIN membre_perm mp ON mp.id_user = u.id_user
		`),
		getPool().query('SELECT id, nom, valeur FROM constante ORDER BY id')
	]);

	// Group contenus
	const contenusMap = new Map();
	(contenusRaw as any[]).forEach((row) => {
		if (!contenusMap.has(row.id)) {
			contenusMap.set(row.id, {
				id: row.id,
				nom: row.nom,
				type: row.type,
				degre: row.degre,
				description: row.description,
				contenants: []
			});
		}
		if (row.contenant_id) {
			contenusMap.get(row.id).contenants.push({
				id: row.contenant_id,
				nom: row.contenant_nom,
				capacite: row.capacite,
				type: row.contenant_type,
				consigne: row.consigne,
				boisson_id: row.boisson_id,
				prix_vente: row.prix_vente,
				prix_achat: row.prix_achat
			});
		}
	});

	// Group perm members
	const permsMap = new Map();
	(nomPerms as any[]).forEach((p) => {
		permsMap.set(p.id, { ...p, membres: [] });
	});
	(permMembers as any[]).forEach((m) => {
		if (permsMap.has(m.id_nom_perm)) {
			permsMap.get(m.id_nom_perm).membres.push({
				id: m.id_user,
				prenom: m.prenom,
				nom: m.nom || m.login?.split('.')[1] || '',
				login: m.login
			});
		}
	});

	return {
		contenus: Array.from(contenusMap.values()),
		contenants: contenants as any[],
		users: users as any[],
		perms: Array.from(permsMap.values()),
		constantes: constantes as any[]
	};
};

export const actions = {
	createPermTeam: async ({ request, locals }) => {
		if (!locals.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
			throw error(403, 'Unauthorized');
		}

		const data = await request.formData();
		const nom = data.get('nom') as string;

		if (!nom) return { success: false, message: 'Name required' };

		const annee = new Date().getFullYear();
		await getPool().query('INSERT INTO nom_perm (nom, annee, isactiv) VALUES (?, ?, 1)', [
			nom,
			annee
		]);

		return { success: true };
	}
};
