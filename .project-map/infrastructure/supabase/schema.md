# Supabase Schema — doutortaon

> Projeto: zsmwpslhainlhbssejmt (sa-east-1)
> Última varredura: 2026-03-30
> Banco: PostgreSQL 17.6

---

## Tabelas

### `especialidades`
> Lookup de especialidades médicas. RLS desativado (leitura pública). 55 registros.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| nome | text | NOT NULL | — | UNIQUE |

**Usado por:** cadastro de médicos (autocompletar especialidade_primaria/secundaria)

---

### `medicos`
> Cadastro de médicos. RLS habilitado. `id = auth.uid()`.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK = auth.uid() |
| email | text | NOT NULL | — | UNIQUE |
| nome | text | NOT NULL | — | |
| cpf | text | NOT NULL | — | UNIQUE |
| crm | text | NOT NULL | — | |
| uf_crm | text | NOT NULL | — | |
| especialidade_primaria | text | NOT NULL | — | |
| especialidade_secundaria | text | NULL | — | |
| rqe_primaria | text | NULL | — | |
| rqe_secundaria | text | NULL | — | |
| cnpj | text | NULL | — | |
| nome_empresa | text | NULL | — | |
| telefone | text | NULL | — | |
| celular | text | NULL | — | |
| chatwoot_user_id | bigint | NULL | — | ID agente Chatwoot |
| assinatura_path | text | NULL | — | Path do certificado ativo no bucket |
| endereco_residencial_* | text | NULL | — | CEP, logradouro, número, complemento, bairro, cidade, uf |
| endereco_comercial_* | text | NULL | — | CEP, logradouro, número, complemento, bairro, cidade, uf |
| media_avaliacao | numeric | NULL | 5.00 | Recalculada por trigger |
| woovi_pix_key | text | NULL | — | Chave Pix AES-256 encriptada |
| comissao_personalizada | numeric | NULL | — | NULL = 20% padrão |
| created_at | timestamptz | NULL | now() | |

**FKs recebidas:** atendimentos, empresa_medico, certificados_digitais, documentos_modelos, documentos_emitidos

---

### `pacientes`
> Cadastro de pacientes. Auth customizada via bcrypt. RLS habilitado.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| cpf | text | NOT NULL | — | UNIQUE |
| nome | text | NOT NULL | — | |
| data_nascimento | date | NULL | — | |
| sexo | text | NULL | — | |
| senha | text | NOT NULL | — | bcrypt hash — NUNCA expor |
| email | text | NULL | — | UNIQUE |
| telefone | text | NULL | — | |
| auth_user_id | uuid | NULL | — | UNIQUE, FK → auth.users.id |
| endereco_cep | text | NULL | — | |
| endereco_logradouro | text | NULL | — | |
| endereco_numero | text | NULL | — | |
| endereco_complemento | text | NULL | — | |
| endereco_bairro | text | NULL | — | |
| endereco_cidade | text | NULL | — | |
| endereco_uf | text | NULL | — | |
| created_at | timestamptz | NULL | now() | |

---

### `atendimentos`
> Consultas médicas. Realtime habilitado. RLS habilitado. 25 registros.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| paciente_id | uuid | NULL | — | FK → pacientes.id |
| medico_id | uuid | NULL | — | FK → medicos.id |
| token | text | NOT NULL | — | UNIQUE — acesso público |
| status | text | NULL | 'pendente' | pendente\|aguardando\|em_atendimento\|finalizado\|reavaliacao |
| conversation_id | bigint | NULL | — | ID conversa Chatwoot |
| tipo_consulta | text | NULL | — | FK lógica → atendimentos_config.tipo |
| valor_consulta | int4 | NULL | — | Centavos |
| inicio | timestamptz | NULL | — | |
| fim | timestamptz | NULL | — | |
| peso / altura | text | NULL | — | Anamnese |
| doencas_previas | text | NULL | — | |
| medicacoes_continuas | text | NULL | — | |
| alergias | text | NULL | — | |
| cid | text | NULL | — | Código CID-10 |
| evolucao | text | NULL | — | Evolução clínica |
| pagamento_status | text | NULL | 'pendente' | pendente\|pago\|cancelado\|estornado |
| pagamento_id | text | NULL | — | correlationID Woovi |
| pagamento_url | text | NULL | — | Link Pix Woovi |
| pagamento_expiracao | timestamptz | NULL | — | now() + 24h |
| comprovante_pagamento | text | NULL | — | receiptUrl webhook Woovi |
| pago_em | timestamptz | NULL | — | Confirmação via webhook |
| nota_fiscal_plataforma_url | text | NULL | — | NF DoutorTaon |
| nota_fiscal_medico_url | text | NULL | — | NF médico |
| avaliacao_nota | int4 | NULL | — | 1–5 |
| avaliacao_comentario | text | NULL | — | |
| avaliado_em | timestamptz | NULL | — | |
| documentos_rascunho | jsonb | NULL | '{}' | |
| chat_historico | jsonb | NULL | — | Histórico Chatwoot na finalização |
| created_at | timestamptz | NOT NULL | now() | |

---

### `atendimentos_config`
> Tipos de consulta e valores vigentes. RLS habilitado. 3 registros.

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | uuid_generate_v4() |
| tipo | text | NOT NULL | — | UNIQUE (ex: normal, emagrecimento) |
| valor | int4 | NOT NULL | — | Centavos |
| nome | text | NULL | — | |
| data_inicio | timestamptz | NULL | now() | Registro mais recente = preço ativo |
| created_at | timestamptz | NULL | now() | |

---

### `certificados_digitais`
> Certificados PKCS12 (.pfx) dos médicos. RLS habilitado. 2 registros.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| medico_id | uuid | NOT NULL | — | FK → medicos.id (CASCADE) |
| storage_path | text | NOT NULL | — | UNIQUE, bucket certificados |
| status | varchar | NULL | 'ativo' | ativo\|expirado\|revogado |
| validade_ate | date | NOT NULL | — | |
| tipo | text | NOT NULL | 'e-cpf' | e-cpf\|e-cnpj |
| dados_certificado | jsonb | NULL | '{}' | CN, emissor, serial, etc. |
| criado_em | timestamptz | NULL | now() | |
| atualizado_em | timestamptz | NULL | now() | |

---

### `empresa_medico`
> Dados fiscais da empresa do médico para NFS-e via Nuvem Fiscal. RLS habilitado. 0 registros.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| medico_id | uuid | NOT NULL | — | FK → medicos.id (CASCADE), UNIQUE |
| cnpj | text | NOT NULL | — | |
| razao_social | text | NOT NULL | — | |
| nome_fantasia | text | NULL | — | |
| inscricao_municipal | text | NULL | — | |
| inscricao_estadual | text | NULL | — | |
| regime_tributario | smallint | NOT NULL | 1 | 1=Simples 2=SN excesso 3=Normal 4=MEI |
| endereco_fiscal_* | text | NULL | — | cep, logradouro, numero, complemento, bairro, cidade, uf, ibge |
| nuvem_fiscal_empresa_id | text | NULL | — | ID na Nuvem Fiscal |
| nuvem_fiscal_sincronizado | boolean | NOT NULL | false | |
| nuvem_fiscal_sincronizado_em | timestamptz | NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | Trigger auto-update |

---

### `documentos_modelos`
> Templates de documentos médicos. medico_id NULL = modelo global. RLS habilitado.

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | uuid_generate_v4() |
| titulo | text | NOT NULL | — |
| conteudo | text | NOT NULL | — | HTML |
| tipo | text | NULL | — | receita, atestado, encaminhamento, etc. |
| descricao | text | NULL | — | |
| medico_id | uuid | NULL | — | FK → medicos.id; NULL = global |
| created_at | timestamptz | NULL | now() | |

---

### `documentos_emitidos`
> PDFs gerados em atendimentos. RLS habilitado. 28 registros.

| Coluna | Tipo | Nullable | Default | Observação |
|--------|------|----------|---------|------------|
| id | uuid | NOT NULL | uuid_generate_v4() | PK |
| atendimento_id | uuid | NOT NULL | — | FK → atendimentos.id |
| medico_id | uuid | NULL | — | FK → medicos.id (desnormalizado para RLS) |
| paciente_id | uuid | NULL | — | FK → pacientes.id (desnormalizado para RLS) |
| criado_por | uuid | NOT NULL | — | FK → medicos.id |
| certificado_id | uuid | NULL | — | FK → certificados_digitais.id (SET NULL) |
| tipo | varchar | NOT NULL | — | receita\|atestado\|declaracao\|encaminhamento\|exame\|relatorio |
| storage_path | text | NOT NULL | — | UNIQUE, bucket documentos |
| codigo | varchar | NULL | — | UNIQUE, 8 chars para verificação pública |
| assinado | boolean | NULL | false | |
| conteudo | text | NULL | — | HTML original |
| metadata | jsonb | NULL | '{}' | |
| criado_em | timestamptz | NULL | now() | |
| atualizado_em | timestamptz | NULL | now() | |

---

### `cid10`
> Lookup CID-10 (DATASUS). RLS desativado. 12.462 registros.

| Coluna | Tipo |
|--------|------|
| codigo | text (PK) |
| nome | text |

---

### `chatbot_sessions`
> Sessões do chatbot Chatwoot. RLS habilitado (service_role). 39 registros.

| Coluna | Tipo | Default | Observação |
|--------|------|---------|------------|
| id | uuid | gen_random_uuid() | PK |
| conversation_id | bigint | — | UNIQUE |
| status | varchar | 'AWAITING_MENU' | Estado da máquina |
| last_interaction | timestamptz | now() | |
| metadata | jsonb | '{}' | Contexto do fluxo |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

---

## Storage Buckets

- `certificados` — arquivos .pfx dos médicos (`{medico_id}/{timestamp}.pfx`)
- `documentos` — PDFs emitidos (`{paciente_id}/{atendimento_id}/{medico_id}/{Tipo}-{DD-MM-YY}-{ts}.pdf`)
