import { cookies } from 'next/headers';
import { EncryptionService } from './encryption';

export interface ChatwootSessionInfo {
    medico_id: string;
    email?: string;
    exp: number;
}

const COOKIE_NAME = 'chatwoot_session';
const EXPIRATION_MS = 1000 * 60 * 60 * 12; // 12 hours

export async function setChatwootSession(medicoId: string, email?: string) {
    const sessionInfo: ChatwootSessionInfo = {
        medico_id: medicoId,
        email,
        exp: Date.now() + EXPIRATION_MS,
    };

    const encService = new EncryptionService();
    const encrypted = encService.encrypt(JSON.stringify(sessionInfo));

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, encrypted, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Required for cross-origin iframe
        path: '/',
        maxAge: EXPIRATION_MS / 1000,
    });
}

export async function getChatwootSession(): Promise<ChatwootSessionInfo | null> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(COOKIE_NAME);
        if (!cookie?.value) return null;

        const encService = new EncryptionService();
        const decrypted = encService.decrypt(cookie.value);
        const sessionInfo: ChatwootSessionInfo = JSON.parse(decrypted);

        if (sessionInfo.exp < Date.now()) {
            return null; // Expired
        }

        return sessionInfo;
    } catch (e) {
        console.warn('[authSession] Failed to parse or decrypt chatwoot session', e);
        return null;
    }
}
