import { env } from "$env/dynamic/private";
import type { RequestEvent } from "@sveltejs/kit";
import { createHmac, randomBytes, createCipheriv, createDecipheriv } from "crypto";

const SESSION_COOKIE_NAME = "user_session";
const SESSION_SECRET = env.AUTH_SECRET || "default-secret-change-me";
const ENCRYPTION_KEY = Buffer.from(SESSION_SECRET.padEnd(32, "0").slice(0, 32)); // 256-bit key
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours en secondes



/**
 * Données minimales stockées dans le cookie
 */
type SessionData = {
	id_user: number;
    login: string;
    prenom: string;
    nom: string;
    droit: string;

};

/**
 * Convertit FullUser en SessionData compact
 */
function compactUserData(userData: any): SessionData {
    return {
        id_user: userData.id,
        login: userData.login,
        prenom: userData.prenom,
        nom: userData.nom,
        droit: userData.droit,
    };
}

/**
 * Sérialise et chiffre les données utilisateur compactes
 */
function encryptData(data: SessionData): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

	const jsonData = JSON.stringify(data);
	let encrypted = cipher.update(jsonData, "utf8", "hex");
	encrypted += cipher.final("hex");

	// Retourner IV + données chiffrées
	return iv.toString("hex") + ":" + encrypted;
}

/**
 * Déchiffre et désérialise les données utilisateur
 */
function decryptData(encryptedData: string): SessionData | null {
	try {
		const [ivHex, encrypted] = encryptedData.split(":");
		if (!ivHex || !encrypted) return null;

		const iv = Buffer.from(ivHex, "hex");
		const decipher = createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

		let decrypted = decipher.update(encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return JSON.parse(decrypted) as SessionData;
	} catch (error) {
		console.error("Erreur lors du déchiffrement des données de session:", error);
		return null;
	}
}

/**
 * Reconstitue un FullUser depuis SessionData
 */
function expandSessionData(sessionData: SessionData): any {
    return {
        id: sessionData.id_user,
        login: sessionData.login,
        prenom: sessionData.prenom,
        nom: sessionData.nom,
        droit: sessionData.droit,
    };
	
}

/**
 * Génère une signature HMAC pour vérifier l'intégrité
 */
function signData(data: string): string {
	return createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
}

/**
 * Vérifie la signature HMAC
 */
function verifySignature(data: string, signature: string): boolean {
	const expectedSignature = signData(data);
	return signature === expectedSignature;
}

/**
 * Crée un cookie de session sécurisé avec les données utilisateur
 */
export function createUserSession(userData: any): string {
	const compactData = compactUserData(userData);
	const encrypted = encryptData(compactData);
	const signature = signData(encrypted);

	// Format: encrypted_data.signature
	return `${encrypted}.${signature}`;
}

/**
 * Lit et vérifie le cookie de session
 */
export function readUserSession(cookieValue: string): any | null {
	if (!cookieValue) return null;

	const lastDotIndex = cookieValue.lastIndexOf(".");
	if (lastDotIndex === -1) return null;

	const encrypted = cookieValue.substring(0, lastDotIndex);
	const signature = cookieValue.substring(lastDotIndex + 1);

	// Vérifier la signature
	if (!verifySignature(encrypted, signature)) {
		console.warn("Signature de session invalide");
		return null;
	}

	// Déchiffrer les données compactes et les reconvertir en FullUser
	const sessionData = decryptData(encrypted);
	if (!sessionData) return null;

	return expandSessionData(sessionData);
}

/**
 * Configure le cookie de session dans la réponse
 */
export function setSessionCookie(event: RequestEvent, userData: any): void {
	const sessionValue = createUserSession(userData);

	event.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
		path: "/",
		httpOnly: true,
		secure: env.PROD === "true",
		sameSite: "lax",
		maxAge: SESSION_MAX_AGE,
	});
}

/**
 * Récupère les données utilisateur depuis le cookie de session
 */
export function getSessionData(event: RequestEvent): any | null {
	const cookieValue = event.cookies.get(SESSION_COOKIE_NAME);
	if (!cookieValue) return null;

	return readUserSession(cookieValue);
}

/**
 * Supprime le cookie de session
 */
export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
}

/**
 * Met à jour le cookie de session avec de nouvelles données
 */
export function updateSessionData(event: RequestEvent, userData: any): void {
	setSessionCookie(event, userData);
}
