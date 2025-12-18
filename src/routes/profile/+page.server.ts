import { redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export const load = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/');

	const userId = locals.user.id;

	// Fetch User Details (Balance)
	const users = await db`SELECT solde FROM user WHERE id_user = ${userId}`;
	const user = users[0];

	// Fetch Recent Transactions
	// Join with perm to get date? Transaction has datee.
	// Join with boisson/consommable to get names.
	// This is complex because of the polymorphic association (id_B_C + B_C_A).
	
	// We can use a UNION or multiple left joins.
	// Legacy uses separate queries or complex joins.
	// Let's try a LEFT JOIN approach.
	
	const transactions = await db`
		SELECT 
			t.id,
			t.datee,
			t.prix,
			t.nb,
			t.B_C_A as type,
			CASE 
				WHEN t.B_C_A = 'B' OR t.B_C_A = 'F' THEN CONCAT(cu.nom, ' ', ct.nom)
				WHEN t.B_C_A = 'C' THEN c.nom
				WHEN t.B_C_A = 'A' THEN 'Recharge'
				ELSE 'Unknown'
			END as label
		FROM transaction t
		LEFT JOIN boisson b ON (t.id_B_C = b.id AND (t.B_C_A = 'B' OR t.B_C_A = 'F'))
		LEFT JOIN contenu cu ON b.id_contenu = cu.id
		LEFT JOIN contenant ct ON b.id_contenant = ct.id
		LEFT JOIN consommable c ON (t.id_B_C = c.id AND t.B_C_A = 'C')
		WHERE t.id_user = ${userId}
		ORDER BY t.datee DESC
		LIMIT 50
	`;

	return {
		user,
		transactions
	};
};
