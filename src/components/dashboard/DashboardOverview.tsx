import Link from 'next/link';
import { ClipboardList, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import { Atendimento } from '@/types/database';
import { daysUntil } from '@/utils/index';
import { PAGAMENTO_BADGES } from '@/utils/constants';

interface Props {
    totalAtendimentos: number;
    receitaMes: number;
    certVencimento: string | null;
    recentAtendimentos: Partial<Atendimento>[];
}

export function DashboardOverview({ totalAtendimentos, receitaMes, certVencimento, recentAtendimentos }: Props) {
    const certDias = certVencimento ? daysUntil(certVencimento) : null;
    const certAlerta = certDias !== null && certDias <= 30;

    return (
        <div className="space-y-6">
            {/* Alerta de certificado */}
            {certAlerta && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-light border border-warning/20">
                    <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Certificado digital vencendo em {certDias} dias</p>
                        <p className="text-xs text-foreground-secondary mt-0.5">
                            Renove seu certificado e-CPF para continuar assinando documentos.{' '}
                            <Link href="/dashboard/perfil/certificado" className="text-primary underline">Renovar agora</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={<ClipboardList size={20} className="text-primary" />}
                    label="Total de atendimentos"
                    value={String(totalAtendimentos)}
                    href="/dashboard/atendimentos"
                />
                <StatCard
                    icon={<DollarSign size={20} className="text-success" />}
                    label="Receita no mês"
                    value={`R$ ${receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    href="/dashboard/atendimentos"
                />
                <StatCard
                    icon={<Shield size={20} className={certAlerta ? 'text-warning' : 'text-success'} />}
                    label="Certificado e-CPF"
                    value={certVencimento ? `Válido até ${new Date(certVencimento).toLocaleDateString('pt-BR')}` : 'Não cadastrado'}
                    href="/dashboard/perfil/certificado"
                />
            </div>

            {/* Recent atendimentos */}
            <div className="medical-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">Últimos atendimentos</h2>
                    <Link href="/dashboard/atendimentos" className="text-xs text-primary hover:underline">
                        Ver todos
                    </Link>
                </div>

                {recentAtendimentos.length === 0 ? (
                    <p className="text-sm text-foreground-secondary text-center py-6">Nenhum atendimento encontrado.</p>
                ) : (
                    <div className="divide-y divide-border">
                        {recentAtendimentos.map(a => {
                            const pgStatus = a.pagamento_status || 'pendente';
                            const badge = PAGAMENTO_BADGES[pgStatus] || PAGAMENTO_BADGES.pendente;
                            return (
                                <div key={a.id} className="flex items-center justify-between py-3 gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {(a as any).paciente?.nome || 'Paciente'}
                                        </p>
                                        <p className="text-xs text-foreground-secondary">
                                            {a.inicio ? new Date(a.inicio).toLocaleDateString('pt-BR') : '—'}
                                            {a.tipo_consulta ? ` · ${a.tipo_consulta}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm font-semibold text-foreground">
                                            {a.valor_consulta ? `R$ ${a.valor_consulta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                                        </span>
                                        <span className={badge.cls}>{badge.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
    const content = (
        <div className="medical-card p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background-secondary shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-label text-xs mb-1">{label}</p>
                <p className="text-base font-bold text-foreground truncate">{value}</p>
            </div>
        </div>
    );
    if (href) return <Link href={href} className="block hover:opacity-90 transition-opacity">{content}</Link>;
    return content;
}
