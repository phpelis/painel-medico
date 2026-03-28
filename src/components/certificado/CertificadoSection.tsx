'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import type { CertificadoDigital } from '@/types/database';
import { daysUntil } from '@/utils/index';

interface Props {
    cert: Partial<CertificadoDigital> | null;
    tipo: 'e-cpf' | 'e-cnpj';
    uploadEndpoint: string;
    title: string;
    description: string;
    extraFields?: Record<string, string>;
}

export function CertificadoSection({ cert, tipo, uploadEndpoint, title, description, extraFields }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [currentCert, setCurrentCert] = useState(cert);

    const certDias = currentCert?.validade_ate ? daysUntil(currentCert.validade_ate) : null;
    const isExpiring = certDias !== null && certDias <= 30;

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !password) return;
        setUploading(true);
        setFeedback(null);

        try {
            const fd = new FormData();
            fd.append('pfxFile', file);
            fd.append('password', password);
            fd.append('tipo', tipo);
            if (extraFields) {
                Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
            }

            const res = await fetch(uploadEndpoint, { method: 'POST', body: fd });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error?.message || 'Erro ao fazer upload');

            setCurrentCert(json.data);
            setFeedback({ type: 'success', msg: 'Certificado cadastrado com sucesso!' });
            setFile(null);
            setPassword('');
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message || 'Erro ao processar certificado.' });
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="max-w-xl space-y-6">
            {/* Status atual */}
            <SectionCard title={title}>
                <p className="text-xs text-foreground-secondary mb-4">{description}</p>

                {currentCert ? (
                    <div className="space-y-3">
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${isExpiring ? 'bg-warning-light border-warning/20' : 'bg-success-light border-success/20'}`}>
                            {isExpiring
                                ? <ShieldAlert size={20} className="text-warning shrink-0 mt-0.5" />
                                : <ShieldCheck size={20} className="text-success shrink-0 mt-0.5" />
                            }
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {(currentCert.dados_certificado as any)?.commonName || 'Certificado ativo'}
                                </p>
                                <p className="text-xs text-foreground-secondary mt-0.5">
                                    {isExpiring
                                        ? `⚠️ Vence em ${certDias} dias — ${new Date(currentCert.validade_ate!).toLocaleDateString('pt-BR')}`
                                        : `Válido até ${new Date(currentCert.validade_ate!).toLocaleDateString('pt-BR')}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-foreground-secondary">
                            <span>Emissor: <strong>{(currentCert.dados_certificado as any)?.issuer || '—'}</strong></span>
                            <span>Série: <strong>{(currentCert.dados_certificado as any)?.serialNumber?.slice(0, 12) || '—'}...</strong></span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary border border-border">
                        <Shield size={20} className="text-foreground-secondary shrink-0" />
                        <p className="text-sm text-foreground-secondary">Nenhum certificado cadastrado.</p>
                    </div>
                )}
            </SectionCard>

            {/* Upload */}
            <SectionCard title={currentCert ? 'Substituir certificado' : 'Cadastrar certificado'}>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="text-label block mb-1.5">Arquivo .pfx</label>
                        <input
                            type="file"
                            accept=".pfx,.p12"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-foreground-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                        />
                        {file && <p className="text-xs text-foreground-secondary mt-1">{file.name}</p>}
                    </div>

                    <div>
                        <label className="text-label block mb-1.5">Senha do certificado</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Senha do arquivo .pfx"
                            className="medical-input"
                            autoComplete="off"
                        />
                    </div>

                    {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                    <button
                        type="submit"
                        disabled={!file || !password || uploading}
                        className="action-btn-primary text-sm"
                    >
                        <Upload size={15} />
                        {uploading ? 'Processando...' : 'Enviar certificado'}
                    </button>
                </form>
            </SectionCard>
        </div>
    );
}
