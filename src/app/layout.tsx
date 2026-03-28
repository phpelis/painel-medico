import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Painel do Médico | DoutorTáOn',
    description: 'Gerencie seu cadastro, atendimentos e documentos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className={outfit.variable}>
            <body>{children}</body>
        </html>
    );
}
