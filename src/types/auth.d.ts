import { DefaultSession } from '@auth/core/types';
import { JWT } from '@auth/core/jwt';

declare module '@auth/core/types' {
	interface Session {
		user: {
			id: string;
			droit: string;
			login: string;
			prenom: string;
			nom: string;
		} & DefaultSession['user'];
	}

	interface User {
		user_id: number;
		droit: string;
		login: string;
		prenom: string;
		nom: string;
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		user_id?: number;
		droit?: string;
		login?: string;
		prenom?: string;
		nom?: string;
	}
}
