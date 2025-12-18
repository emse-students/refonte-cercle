import { handle as authHandle } from "$lib/server/auth";
import db from "$lib/server/db";
import { getSessionData, clearSessionCookie, setSessionCookie } from "$lib/server/session";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";


const sessionHandle: Handle = async ({ event, resolve }) => {

    const session = await event.locals.auth();

    if (session) {
        event.locals.session = session;
    }

    let userData = getSessionData(event);
    
    if ((!session?.user?.id && userData) || session?.user?.id !== userData?.login) {
		clearSessionCookie(event);
		userData = null;
	}

    if (session?.user?.id && !userData) {
        const user = await db`SELECT id_user as id, login, prenom, nom, droit FROM user WHERE id_user = ${session.user.id}`.then(res => res[0]) || null;
        if (user) {
            userData = user;
            setSessionCookie(event, user);
        }
    }

    if (userData) {
        event.locals.user = userData;
    }

    return resolve(event);
}

export const handle = sequence(
    authHandle,
    sessionHandle
);

