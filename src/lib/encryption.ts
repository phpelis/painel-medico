import crypto from 'crypto';
import { ENV } from './env';

/**
 * EncryptionService — AES-256-GCM
 * Copied from painel-atendimento for self-contained operation.
 */
export class EncryptionService {
    private static algorithm = 'aes-256-gcm';
    private static key: Buffer;

    constructor() {
        if (!EncryptionService.key) {
            const encryptionKey = ENV.ENCRYPTION_KEY;
            if (!encryptionKey) throw new Error('ENCRYPTION_KEY is not defined');
            try {
                let buf = Buffer.from(encryptionKey, 'base64');
                if (buf.length !== 32) buf = Buffer.from(encryptionKey, 'hex');
                if (buf.length !== 32) throw new Error('Invalid ENCRYPTION_KEY length');
                EncryptionService.key = buf;
            } catch (error) {
                throw new Error('Failed to initialize EncryptionService: ' + (error as Error).message);
            }
        }
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(EncryptionService.algorithm, EncryptionService.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = (cipher as crypto.CipherGCM).getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    decrypt(encryptedText: string): string {
        try {
            const [ivHex, authTagHex, contentHex] = encryptedText.split(':');
            if (!ivHex || !authTagHex || !contentHex) throw new Error('Invalid encrypted text format');
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');
            const decipher = crypto.createDecipheriv(EncryptionService.algorithm, EncryptionService.key, iv);
            (decipher as crypto.DecipherGCM).setAuthTag(authTag);
            let decrypted = decipher.update(contentHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            throw new Error('Failed to decrypt data: ' + (error as Error).message);
        }
    }
}

export function decryptPixKey(encrypted: string): string {
    try {
        return new EncryptionService().decrypt(encrypted);
    } catch {
        return '';
    }
}
