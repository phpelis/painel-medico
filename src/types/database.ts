export type Endereco = {
    id: string;
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    numero: string;
    complemento: string;
    created_at?: string;
};

export type Medico = {
    id: string;
    email: string;
    nome: string;
    cpf: string;
    crm: string;
    uf_crm: string;
    especialidade_primaria: string;
    especialidade_secundaria?: string;
    rqe_primaria?: string;
    rqe_secundaria?: string;
    cnpj?: string;
    nome_empresa?: string;
    endereco_residencial_cep?: string;
    endereco_residencial_logradouro?: string;
    endereco_residencial_numero?: string;
    endereco_residencial_complemento?: string;
    endereco_residencial_bairro?: string;
    endereco_residencial_cidade?: string;
    endereco_residencial_uf?: string;
    endereco_comercial_cep?: string;
    endereco_comercial_logradouro?: string;
    endereco_comercial_numero?: string;
    endereco_comercial_complemento?: string;
    endereco_comercial_bairro?: string;
    endereco_comercial_cidade?: string;
    endereco_comercial_uf?: string;
    endereco_residencial_id?: string;
    endereco_comercial_id?: string;
    endereco_residencial?: Partial<Endereco>;
    endereco_comercial?: Partial<Endereco>;
    assinatura_path?: string;
    celular?: string;
    telefone?: string;
    criado_at?: string;
    media_avaliacao?: number;
    woovi_pix_key?: string;
    comissao_personalizada?: number;
};

export type Paciente = {
    id: string;
    cpf: string;
    nome: string;
    data_nascimento: string;
    sexo: string;
    endereco_id?: string;
    endereco?: Partial<Endereco>;
    cidade?: string;
    estado?: string;
    created_at?: string;
    idade?: number;
};

export type Atendimento = {
    id: string;
    paciente_id: string;
    medico_id: string | null;
    token: string;
    status: 'pendente' | 'aguardando' | 'em_atendimento' | 'finalizado' | 'cancelado';
    conversation_id?: number | null;
    evolucao?: string | null;
    documentos_rascunho?: Record<string, string>;
    peso?: string | null;
    altura?: string | null;
    doencas_previas?: string | null;
    medicacoes_continuas?: string | null;
    alergias?: string | null;
    created_at?: string;
    inicio?: string | null;
    fim?: string | null;
    valor_consulta?: number | null;
    tipo_consulta?: 'normal' | 'emagrecimento' | null;
    pagamento_status?: 'pendente' | 'pago' | 'cancelado' | 'estornado' | null;
    pagamento_id?: string | null;
    pagamento_url?: string | null;
    pagamento_expiracao?: string | null;
    comprovante_pagamento?: string | null;
    avaliacao_nota?: number | null;
    avaliacao_comentario?: string | null;
    cid?: string | null;
    // Joined from pacientes
    paciente?: Pick<Paciente, 'nome' | 'cpf'> | null;
};

export type CertificadoDigital = {
    id: string;
    medico_id: string;
    storage_path: string;
    status: 'ativo' | 'expirado' | 'revogado';
    validade_ate: string;
    tipo: 'e-cpf' | 'e-cnpj';
    dados_certificado: {
        commonName: string;
        cpf: string;
        serialNumber: string;
        issuer: string;
        validFrom: string;
        validTo: string;
    };
    created_at?: string;
};

export type EmpresaMedico = {
    id: string;
    medico_id: string;
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string;
    inscricao_municipal?: string;
    inscricao_estadual?: string;
    regime_tributario: 1 | 2 | 3 | 4;
    endereco_fiscal_cep?: string;
    endereco_fiscal_logradouro?: string;
    endereco_fiscal_numero?: string;
    endereco_fiscal_complemento?: string;
    endereco_fiscal_bairro?: string;
    endereco_fiscal_cidade?: string;
    endereco_fiscal_uf?: string;
    endereco_fiscal_ibge?: string;
    nuvem_fiscal_empresa_id?: string;
    nuvem_fiscal_sincronizado: boolean;
    nuvem_fiscal_sincronizado_em?: string;
    created_at: string;
    updated_at: string;
};

export type DocumentoModelo = {
    id: string;
    medico_id?: string;
    titulo: string;
    tipo: string;
    conteudo?: string;
    descricao?: string;
    created_at?: string;
    updated_at?: string;
};
