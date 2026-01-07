import { error, redirect } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';

export const load = async ({ locals, url }) => {
	if (!locals?.user || (locals.user.droit !== 'cercle' && locals.user.droit !== 'cercleux')) {
		throw error(403, 'Unauthorized');
	}

	const idParam = url.searchParams.get('id');
	const targetUserId = idParam ? parseInt(idParam) : null;

	if (targetUserId) {
		// User Stats
		const userRes = (await getPool().query(
			'SELECT id_user as id, nom, prenom FROM user WHERE id_user = ?',
			[targetUserId]
		)) as any[];
		if (userRes.length === 0) throw error(404, 'User not found');
		const user = userRes[0];

		// Consumption by Type
		const consumptionByType = (await getPool().query(
			`
			SELECT cu.type, SUM(t.nb) as count
			FROM transaction t
			JOIN boisson b ON t.id_B_C = b.id
			JOIN contenu cu ON b.id_contenu = cu.id
			WHERE t.id_user = ? AND (t.B_C_A = 'B' OR t.B_C_A = 'F')
			GROUP BY cu.type
			ORDER BY count DESC
		`,
			[targetUserId]
		)) as any[];

		// Top Drinks
		const topDrinks = (await getPool().query(
			`
			SELECT cu.nom, SUM(t.nb) as count
			FROM transaction t
			JOIN boisson b ON t.id_B_C = b.id
			JOIN contenu cu ON b.id_contenu = cu.id
			WHERE t.id_user = ? AND (t.B_C_A = 'B' OR t.B_C_A = 'F')
			GROUP BY cu.id
			ORDER BY count DESC
			LIMIT 5
		`,
			[targetUserId]
		)) as any[];

		return {
			user,
			consumptionByType,
			topDrinks,
			isUserStats: true
		};
	}

	// Global Stats
	// Total Sales Volume (Liters)
	const volumeStats = (await getPool().query(`
		SELECT SUM(total_litre) as total_volume FROM perm
	`)) as any[];

	// Total Revenue (Sum of all negative transactions for B/C/F)
	const revenueStats = (await getPool().query(`
		SELECT SUM(ABS(prix)) as total_revenue 
		FROM transaction 
		WHERE (B_C_A = 'B' OR B_C_A = 'C' OR B_C_A = 'F')
	`)) as any[];

	// Top Selling Drinks
	const topDrinks = (await getPool().query(`
		SELECT 
			cu.nom as nom_contenu, 
			ct.nom as nom_contenant,
			SUM(t.nb) as total_sold
		FROM transaction t
		JOIN boisson b ON t.id_B_C = b.id
		JOIN contenu cu ON b.id_contenu = cu.id
		JOIN contenant ct ON b.id_contenant = ct.id
		WHERE t.B_C_A = 'B' OR t.B_C_A = 'F'
		GROUP BY t.id_B_C
		ORDER BY total_sold DESC
		LIMIT 10
	`)) as any[];

	return {
		totalVolume: volumeStats[0]?.total_volume ?? 0,
		totalRevenue: revenueStats[0]?.total_revenue ?? 0,
		topDrinks,
		isUserStats: false
	};
};
