import { redirect } from 'next/navigation';

/**
 * Legacy redirect — Chatwoot Dashboard App entry point moved to root (/).
 * Kept for backwards compatibility.
 */
export default function ChatwootLegacyPage() {
    redirect('/');
}
