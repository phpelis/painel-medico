# Map — painel-medico

Painel administrativo standalone para médicos da plataforma DoutorTáOn.
Roda na porta 3001. Auth via Supabase Auth (email/senha).

---

## Stack

- Next.js 16.1.6 + React 19 + TypeScript 5.7
- Tailwind CSS 4 + design system compartilhado com painel-atendimento
- Supabase (PostgreSQL + Auth + Storage)
- Radix UI (Dialog, Select, Tabs, Slot)
- Lucide React (ícones)

---

## Estrutura de rotas

```
/                          → redirect /dashboard
/login                     → Login email/senha (Supabase Auth)
/chatwoot                  → Handshake & Interceptação do Iframe do Chatwoot
/dashboard                 → Overview (stats + últimos atendimentos)
/dashboard/atendimentos    → Tabela com filtros + paginação
/dashboard/documentos      → Grid de modelos de documentos
/dashboard/perfil/dados    → Dados pessoais + profissionais + financeiros
/dashboard/perfil/endereco → Endereço residencial
/dashboard/perfil/certificado → Upload certificado digital e-CPF
/dashboard/empresa/dados   → CNPJ, razão social, endereço fiscal
/dashboard/empresa/notas   → Configuração de emissão de notas fiscais
```

## API Routes

```
GET    /api/medico/me                  → Dados médico autenticado
PATCH  /api/medico/update              → Atualiza dados médico (inclui woovi_pix_key_tipo)
GET    /api/atendimentos               → Lista com filtros (suporta limit=500 para fetch único)
GET    /api/documentos                 → Lista modelos de documentos (inclui conteudo)
POST   /api/documentos                 → Cria novo modelo de documento
PUT    /api/documentos                 → Atualiza modelo de documento
DELETE /api/documentos                 → Exclui modelo de documento (?id=uuid)
GET    /api/certificado                → Certificado e-CPF ativo
DELETE /api/certificado                → Soft delete certificado e-CPF (status → 'inativo')
POST   /api/certificado/upload         → Upload arquivo .pfx e-CPF
POST   /api/certificado/verify         → Pré-verificação de tipo/senha (e-CPF vs e-CNPJ)
GET    /api/empresa                    → Dados empresa
POST   /api/empresa                    → Cria empresa
PATCH  /api/empresa                    → Atualiza empresa
GET    /api/empresa/buscar-cnpj        → Busca dados por CNPJ
GET    /api/empresa/certificado        → Certificado e-CNPJ ativo
DELETE /api/empresa/certificado        → Soft delete certificado e-CNPJ (status → 'inativo')
POST   /api/empresa/certificado/upload → Upload certificado e-CNPJ
POST   /api/auth/logout                → Logout
POST   /api/auth/chatwoot              → BFF: valida Agente e cria cookie de sessão Chatwoot
```

## Componentes principais

```
src/components/
├── layout/
│   ├── AppHeader.tsx        → Header global: avatar esteto, Dr(a). Nome + nota + CRM (Server Component)
│   ├── NavBar.tsx           → 5 tabs horizontais h-14 com indicador ativo (bottom border)
│   └── SubNavBar.tsx        → Sub-tabs h-10 visíveis apenas em /perfil e /empresa
├── dashboard/
│   └── DashboardOverview.tsx → 3 cards stat (sem avaliação — movida para header)
├── atendimentos/
│   ├── AtendimentosClient.tsx    → Container principal e orquestração
│   ├── AtendimentosFilterBar.tsx → Filtros de busca e status
│   ├── AtendimentosStats.tsx     → Resumo financeiro e contagem
│   └── AtendimentosTable.tsx     → Listagem paginada (fetch único limit=500)
├── perfil/
│   ├── DadosMedicoForm.tsx   → Form dados pessoais/profissionais/financeiros
│   │                           Inclui seletor de tipo de chave Pix (woovi_pix_key_tipo)
│   └── EnderecoForm.tsx      → Form endereço residencial com lookup ViaCEP automático
├── empresa/
│   ├── DadosEmpresaForm.tsx      → Container principal de dados fiscais
│   ├── CompanyIdentificationSection.tsx → Dados de CNPJ e Razão Social
│   ├── FiscalAddressSection.tsx → Dados de endereço e CEP
│   └── ConfigNotasForm.tsx       → Config emissão notas fiscais
├── certificado/
│   └── CertificadoSection.tsx → Upload, status e exclusão (soft delete) de certificado
│                                 Validação em tempo real (e-CPF vs e-CNPJ) + bloqueio
│                                 Props: uploadEndpoint + deleteEndpoint (explícitos)
├── documentos/
│   ├── DocumentosGrid.tsx        → Container principal de modelos
│   ├── DocumentFilterBar.tsx     → Filtros e busca de modelos
│   ├── DocumentTable.tsx         → Tabela de listagem dinâmica
│   ├── DocumentEditModal.tsx     → Editor de modelos (RichText)
│   ├── DocumentDeleteModal.tsx   → Confirmação de exclusão
│   └── constants.ts              → Definições de tipos e cores
├── ui/
│   ├── PaginationControls.tsx → Botões Anterior/Próximo + "Página X de Y"
│   └── PaginatedListView.tsx  → Lista genérica com paginação client-side + useDynamicPagination
└── shared/
    ├── SectionCard.tsx       → Card container com título
    ├── ReadonlyField.tsx     → Campo somente-leitura (design system)
    ├── FeedbackBanner.tsx    → Banner de feedback (success/error)
    ├── RichTextEditor.tsx    → Editor rich text (contentEditable) com toolbar: bold, italic, listas,
    │                           alinhamento, undo/redo. Props: value, onChange, placeholder, disabled, actions
    └── StatusScreens.tsx     → Telas globais de carregamento (premium), erro e acesso restrito (iframe)
```

## Auth Flow

### Login Nativo
/login → supabase.auth.signInWithPassword()
       → middleware.ts valida JWT em cada request
       → redirect /login se não autenticado

### Login via Chatwoot (Dashboard App)
/chatwoot → useChatwootHandshake() via postMessage
          → POST /api/auth/chatwoot (BFF)
          → Valida Email/ID no Supabase
          → Cria cookie 'chatwoot_session' (SameSite: None, Secure: True)
          → Redirect /dashboard
```

## Utilities e lib

```
src/utils/
├── index.ts          → cn(), daysUntil()
├── constants.ts      → PAGAMENTO_BADGES, STATUS_ATENDIMENTO_BADGES
├── masks.ts          → unmask(), maskCPF(), maskCNPJ(), maskCEP(), maskPhone(), maskCRM_RQE()
└── supabase/         → client.ts, server.ts, middleware.ts

src/lib/
├── errors.ts         → ApiError, ValidationError, ForbiddenError, NotFoundError, formatErrorResponse, logError
├── env.ts            → ENV (Supabase + Woovi vars), validateEnv()
├── encryption.ts     → EncryptionService (AES-256 para woovi_pix_key)
├── authSession.ts    → sessionService (Criptografia e cookies de sessão customizados para fallback)
└── certificate/
    └── parseService.ts → parsePfxCertificate(buffer, password) → { dados_certificado, validTo, tipo }
                          Suporta e-CPF (OID 2.16.76.1.3.1) e e-CNPJ (OID 2.16.76.1.3.3)

src/hooks/
├── useDynamicPagination.ts → Calcula itemsPerPage e availableHeight via getBoundingClientRect()
│                             ResizeObserver + window resize + 300ms debounce
│                             Evita dependência circular com clientHeight e possui buffer de 8px + offset de -1 item
└── useChatwootHandshake.ts → Hook principal (postMessage) do Handshake do iframe do Chatwoot
```

## Next.js App Router extras

```
src/app/dashboard/
├── loading.tsx   → Skeleton animado (animate-pulse) para Suspense
└── error.tsx     → Error boundary com botão retry
```

## Banco de dados (Supabase)

Tabelas usadas:
- `medicos` — dados do médico (nome, crm, especialidade, woovi_pix_key, woovi_pix_key_tipo, etc.)
- `pacientes` — dados dos pacientes
- `atendimentos` — histórico de atendimentos (status, valor, pagamento_status, inicio, fim)
- `certificados_digitais` — certificados e-CPF e empresa (soft delete via status='inativo')
- `empresa_medico` — dados fiscais da empresa do médico (inclui endereço fiscal + ibge)
- `documentos_modelos` — templates de documentos médicos (medico_id NULL = global)
- `documentos_emitidos` — metadados dos PDFs gerados em atendimentos
- `especialidades` — lookup de especialidades médicas (leitura pública)
- `cid10` — lookup de códigos CID-10 (DATASUS, leitura pública)
- `atendimentos_config` — configuração de preços e tipos de consulta ativos
- `chatbot_sessions` — controle de estado do chatbot Chatwoot (conversas ativas)

## Integrações externas

- **ViaCEP** (`https://viacep.com.br/ws/{cep}/json/`) — chamada direta do cliente
  - Usado em `EnderecoForm.tsx` (onBlur no campo CEP) e `DadosEmpresaForm.tsx` (onChange + onBlur)
  - Preenche: logradouro, bairro, cidade (localidade), uf, ibge
  - Falha silenciosa (catch vazio) — enriquecimento opcional
