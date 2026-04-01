'use client';

import React, { useMemo, useState } from 'react';
import {
    HeartPulse, FileText, MessageCircle, Loader2, X,
    Calendar, Clock, User, ChevronUp, Eye,
} from 'lucide-react';
import { cn } from '@/utils';
import { createClient } from '@/utils/supabase/client';
import type { Atendimento } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AtendimentoDetail {
    loading: boolean;
    error?: string | null;
    evolution?: string | null;
    cid?: string | null;
    anamnesis?: {
        doencas_previas?: string;
        medicacoes_continuas?: string;
        alergias?: string;
        peso?: string;
        altura?: string;
    };
    documents: any[];
    chat_historico?: any[] | null;
}

interface Props {
    item: Atendimento;
    detail: AtendimentoDetail;
    activeTab: 'summary' | 'documents' | 'chat';
    onTabChange: (tab: 'summary' | 'documents' | 'chat') => void;
    onClose: () => void;
}

// ─── BMI helper ───────────────────────────────────────────────────────────────

function getBMIInfo(peso: string, altura: string) {
    const p = parseFloat(peso.replace(',', '.'));
    const a = parseFloat(altura.replace(',', '.'));
    if (!p || !a || a <= 0) return null;
    const bmi = (p / (a * a)).toFixed(1);
    const val = parseFloat(bmi);
    if (val < 18.5) return { bmi, classification: 'Abaixo', bg: 'bg-blue-100', color: 'text-blue-700' };
    if (val < 25) return { bmi, classification: 'Normal', bg: 'bg-green-100', color: 'text-green-700' };
    if (val < 30) return { bmi, classification: 'Sobrepeso', bg: 'bg-yellow-100', color: 'text-yellow-700' };
    return { bmi, classification: 'Obesidade', bg: 'bg-red-100', color: 'text-red-700' };
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab({ item, detail }: { item: Atendimento; detail: AtendimentoDetail }) {
    const cid = detail.cid || item.cid;
    const hasAntro = detail.anamnesis?.peso || detail.anamnesis?.altura;
    const hasHMP = detail.anamnesis?.doencas_previas;
    const hasMeds = detail.anamnesis?.medicacoes_continuas;
    const hasAllergies = detail.anamnesis?.alergias;
    const hasEvolution = detail.evolution;

    if (!cid && !hasAntro && !hasHMP && !hasMeds && !hasAllergies && !hasEvolution) {
        return (
            <div className="py-12 text-center flex flex-col items-center gap-4">
                <FileText className="w-8 h-8 text-slate-200" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sem dados registrados</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
                {cid && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CID-10</span>
                        <p className="text-sm font-medium text-slate-700">{cid}</p>
                    </div>
                )}
                {cid && (hasAntro || hasHMP || hasMeds || hasAllergies || hasEvolution) && <hr className="border-slate-100" />}

                {hasAntro && (() => {
                    const bmiInfo = getBMIInfo(detail.anamnesis?.peso || '', detail.anamnesis?.altura || '');
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Antropometria</span>
                            <div className="flex gap-4 mt-0.5 items-center">
                                {detail.anamnesis?.peso && (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-medium text-slate-700">{detail.anamnesis.peso}</span>
                                        <span className="text-xs font-bold text-slate-400">kg</span>
                                    </div>
                                )}
                                {detail.anamnesis?.altura && (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-medium text-slate-700">{detail.anamnesis.altura}</span>
                                        <span className="text-xs font-bold text-slate-400">m</span>
                                    </div>
                                )}
                                {bmiInfo && (
                                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                                        <span className="text-sm font-medium text-slate-700">IMC {bmiInfo.bmi}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${bmiInfo.bg} ${bmiInfo.color}`}>
                                            {bmiInfo.classification}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
                {hasAntro && (hasHMP || hasMeds || hasAllergies || hasEvolution) && <hr className="border-slate-100" />}

                {hasHMP && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HMP / Comorbidades</span>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{detail.anamnesis!.doencas_previas}</p>
                    </div>
                )}
                {hasHMP && (hasMeds || hasAllergies || hasEvolution) && <hr className="border-slate-100" />}

                {hasMeds && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicações em Uso</span>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{detail.anamnesis!.medicacoes_continuas}</p>
                    </div>
                )}
                {hasMeds && (hasAllergies || hasEvolution) && <hr className="border-slate-100" />}

                {hasAllergies && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Alergias</span>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{detail.anamnesis!.alergias}</p>
                    </div>
                )}
                {hasAllergies && hasEvolution && <hr className="border-slate-100" />}

                {hasEvolution && (
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Atendimento e Conduta</span>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{detail.evolution}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({ detail }: { detail: AtendimentoDetail }) {
    const supabase = useMemo(() => createClient(), []);
    const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

    const handleOpenDoc = async (storagePath: string) => {
        if (!storagePath) { alert('Caminho do arquivo não encontrado.'); return; }
        const { data } = await supabase.storage.from('documentos').createSignedUrl(storagePath, 3600);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
        else alert('Erro ao gerar link do documento.');
    };

    const formatPreview = (html: string) => {
        if (!html) return '';
        let t = html.replace(/<\/(p|div|h[1-6])>/g, '\n\n').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
        const doc = new DOMParser().parseFromString(t, 'text/html');
        return doc.body.textContent || '';
    };

    if (!detail.documents?.length) {
        return (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-6">
                <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <span className="text-[11px] text-slate-400 font-medium">Nenhum documento emitido neste atendimento.</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-2 max-w-4xl mx-auto">
                {detail.documents.map((doc: any, idx: number) => {
                    const docKey = doc.id || String(idx);
                    const isPreviewOpen = expandedDocId === docKey;
                    return (
                        <div key={docKey} className="group flex flex-col bg-white border border-slate-200 rounded-lg transition-all duration-200 overflow-hidden hover:border-blue-300 hover:shadow-sm">
                            <div className="flex items-center justify-between p-2.5">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={cn("w-8 h-8 shrink-0 rounded-md flex items-center justify-center", doc.assinado ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500')}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-700 text-[11px] tracking-wide truncate">
                                            {doc.tipo || 'DOCUMENTO'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(doc.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", doc.assinado ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                                        {doc.assinado ? 'Assinado' : 'Não Assinado'}
                                    </span>
                                    <div className="flex items-center border-l border-slate-100 pl-2 gap-1">
                                        {doc.storage_path && (
                                            <button
                                                onClick={() => handleOpenDoc(doc.storage_path)}
                                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                title="Abrir PDF"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {doc.conteudo && (
                                            <button
                                                onClick={() => setExpandedDocId(isPreviewOpen ? null : docKey)}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-all"
                                                title="Pré-visualizar"
                                            >
                                                {isPreviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {isPreviewOpen && doc.conteudo && (
                                <div className="border-t border-slate-100 bg-slate-50/30 p-3">
                                    <div className="bg-white border border-slate-200 rounded-md p-4 text-[11px] text-slate-600 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                                        {formatPreview(doc.conteudo)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab({ detail, pacienteNome }: { detail: AtendimentoDetail; pacienteNome: string }) {
    const messages: any[] = detail.chat_historico || [];

    if (!messages.length) {
        return (
            <div className="p-6 text-center flex flex-col items-center gap-4">
                <MessageCircle className="w-8 h-8 text-slate-200" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nenhuma mensagem registrada</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2 max-w-2xl mx-auto">
                {messages.map((msg: any, idx: number) => {
                    const isDoctor = msg.role === 'medico' || msg.sender === 'medico' || msg.sender_type === 'agent';
                    return (
                        <div key={idx} className={cn("flex", isDoctor ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[75%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed",
                                isDoctor
                                    ? "bg-blue-600 text-white rounded-br-sm"
                                    : "bg-slate-100 text-slate-700 rounded-bl-sm"
                            )}>
                                <p className={cn("text-[9px] font-bold uppercase mb-0.5 opacity-70", isDoctor ? "text-blue-100" : "text-slate-400")}>
                                    {isDoctor ? 'Médico' : pacienteNome}
                                </p>
                                <p className="whitespace-pre-wrap">{msg.content || msg.message || ''}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AtendimentoDetailsModal({ item, detail, activeTab, onTabChange, onClose }: Props) {
    const endDate = item.fim ? new Date(item.fim) : item.inicio ? new Date(item.inicio) : null;
    const dateStr = endDate ? endDate.toLocaleDateString('pt-BR') : '—';
    const timeStr = endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;

    const headerInfo = {
        summary:   { icon: HeartPulse,      colorClass: 'text-rose-500',    title: 'Resumo do Atendimento' },
        documents: { icon: FileText,         colorClass: 'text-orange-500',  title: 'Documentos Emitidos' },
        chat:      { icon: MessageCircle,    colorClass: 'text-emerald-500', title: 'Chat do Atendimento' },
    }[activeTab];

    const Icon = headerInfo.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl flex flex-col"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between h-[42px]">
                    <div className="flex items-center gap-2">
                        <Icon className={cn("w-3.5 h-3.5", headerInfo.colorClass)} />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-700 hidden sm:block">{headerInfo.title}</h2>

                        {/* Tab switcher */}
                        <div className="flex items-center gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-200 ml-2">
                            <button
                                onClick={() => onTabChange('summary')}
                                className={cn("px-2 py-0.5 rounded text-[9px] font-bold transition-all",
                                    activeTab === 'summary' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >RESUMO</button>
                            <button
                                onClick={() => onTabChange('documents')}
                                className={cn("px-2 py-0.5 rounded text-[9px] font-bold transition-all",
                                    activeTab === 'documents' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >DOCS</button>
                            <button
                                onClick={() => onTabChange('chat')}
                                className={cn("px-2 py-0.5 rounded text-[9px] font-bold transition-all",
                                    activeTab === 'chat' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >CHAT</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Meta info */}
                        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-300" /> {dateStr}
                            </span>
                            {timeStr && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-300" /> {timeStr}
                                </span>
                            )}
                            <span className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-1">
                                <User className="w-3 h-3 text-slate-300" />
                                {item.paciente?.nome || '—'}
                            </span>
                        </div>
                        <div className="h-3 w-px bg-slate-200 mx-1" />
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            title="Fechar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {detail.loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 p-12">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando...</span>
                        </div>
                    ) : detail.error ? (
                        <div className="p-8 flex items-center justify-center">
                            <div className="text-xs text-red-500 py-3 px-6 font-bold bg-red-50 rounded-lg border border-red-100">{detail.error}</div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'summary' && <SummaryTab item={item} detail={detail} />}
                            {activeTab === 'documents' && <DocumentsTab detail={detail} />}
                            {activeTab === 'chat' && <ChatTab detail={detail} pacienteNome={item.paciente?.nome || 'Paciente'} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
