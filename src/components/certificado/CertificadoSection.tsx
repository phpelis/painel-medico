'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import type { CertificadoDigital } from '@/types/database';
import { daysUntil } from '@/utils/index';

interface Props {
    cert: Partial<CertificadoDigital> | null;
    tipo: 'e-cpf' | 'e-cnpj';
    uploadEndpoint: string;
    deleteEndpoint: string;
    title: string;
    description: string;
    extraFields?: Record<string, string>;
}

export function CertificadoSection({ cert, tipo, uploadEndpoint, deleteEndpoint, title, description, extraFields }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null);
    const [currentCert, setCurrentCert] = useState(cert);
    const [verifying, setVerifying] = useState(false);
    const [detectedType, setDetectedType] = useState<'e-cpf' | 'e-cnpj' | null>(null);

    // Pré-verificação de tipo em tempo real
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (file && password && password.length >= 4) {
            timer = setTimeout(async () => {
                setVerifying(true);
                setFeedback(null);
                try {
                    const fd = new FormData();
                    fd.append('pfxFile', file);
                    fd.append('password', password);
                    const res = await fetch('/api/certificado/verify', { method: 'POST', body: fd });
                    const json = await res.json();
                    
                    if (res.ok && json.tipo) {
                        setDetectedType(json.tipo);
                        if (json.tipo !== tipo) {
                            setFeedback({ 
                                type: 'warning', 
                                msg: `⚠️ ${json.tipo.toUpperCase()} detectado. Para este perfil (${tipo === 'e-cpf' ? 'Médico' : 'Empresa'}), é necessário um certificado ${tipo.toUpperCase()}.` 
                            });
                        } else {
                            setFeedback({ type: 'success', msg: `✅ ${json.tipo.toUpperCase()} identificado e pronto para envio.` });
                        }
                    } else if (!res.ok) {
                        // Limpa estados se a senha estiver errada ou arquivo inválido
                        setDetectedType(null);
                        if (json.error?.message?.includes('Senha')) {
                            setFeedback({ type: 'error', msg: 'Senha incorreta para este arquivo.' });
                        }
                    }
                } catch (err) {
                    console.error('Erro na pré-verificação:', err);
                } finally {
                    setVerifying(false);
                }
            }, 600);
        } else {
            setDetectedType(null);
            setFeedback(null);
        }
        return () => clearTimeout(timer);
    }, [file, password, tipo]);

    async function handleDelete() {
        if (!currentCert?.id) return;
        setDeleting(true);
        setFeedback(null);
        try {
            const res = await fetch(deleteEndpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentCert.id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || 'Erro ao excluir');
            setCurrentCert(null);
            setConfirmDelete(false);
            setFeedback({ type: 'success', msg: 'Certificado excluído com sucesso.' });
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message || 'Erro ao excluir certificado.' });
        } finally {
            setDeleting(false);
        }
    }

    const certDias = currentCert?.validade_ate ? daysUntil(currentCert.validade_ate) : null;
    const isExpiring = certDias !== null && certDias <= 30;
    const isMismatched = !!(detectedType && detectedType !== tipo);

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !password || isMismatched) return;
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
            setDetectedType(null);
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message || 'Erro ao processar certificado.' });
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
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
                            <div className="flex-1">
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
                        {!confirmDelete ? (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors mt-1"
                            >
                                <Trash2 size={13} /> Excluir certificado
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-xs text-foreground-secondary">Confirmar exclusão?</span>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {deleting ? 'Excluindo...' : 'Sim, excluir'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-border rounded-lg hover:bg-background-secondary transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
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
                            onChange={e => {
                                setFile(e.target.files?.[0] || null);
                                setDetectedType(null);
                                setFeedback(null);
                            }}
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

                    {verifying && (
                        <div className="flex items-center gap-2 text-xs text-foreground-secondary animate-pulse px-1">
                            <Upload size={12} className="animate-bounce" /> Analisando certificado...
                        </div>
                    )}

                    {feedback && (
                        <FeedbackBanner 
                            type={feedback.type === 'warning' ? 'error' : feedback.type} 
                            message={feedback.msg} 
                        />
                    )}

                    <button
                        type="submit"
                        disabled={!file || !password || uploading || verifying || isMismatched}
                        className={`action-btn-primary text-sm ${isMismatched ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <Upload size={15} />
                        {uploading ? 'Processando...' : 'Enviar certificado'}
                    </button>
                </form>
            </SectionCard>
        </div>
    );
}
