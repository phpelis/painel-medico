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
GET  /api/medico/me                    → Dados médico autenticado
PATCH /api/medico/update               → Atualiza dados médico
GET  /api/atendimentos                 → Lista com filtros e paginação
GET  /api/documentos                   → Modelos de documentos
GET/POST /api/certificado              → Certificado digital
POST /api/certificado/upload           → Upload arquivo .pfx
GET/POST /api/empresa                  → Dados empresa
GET  /api/empresa/buscar-cnpj          → Busca dados por CNPJ
GET/POST /api/empresa/certificado      → Certificado da empresa
POST /api/empresa/certificado/upload   → Upload certificado empresa
POST /api/auth/logout                  → Logout
POST /api/auth/chatwoot                → Endpoint BFF para validar Agente (Email/ID) e criar Cookie de Sessão
```

## Componentes principais

```
src/components/
├── layout/
│   ├── Sidebar.tsx          → Navegação lateral com submenus
│   └── TopBar.tsx           → Header com título e subtítulo
├── dashboard/
│   └── DashboardOverview.tsx → Cards stat + tabela atendimentos recentes
├── atendimentos/
│   └── AtendimentosClient.tsx → Tabela filtros + paginação
├── perfil/
│   ├── DadosMedicoForm.tsx   → Form dados pessoais/profissionais/financeiros
│   └── EnderecoForm.tsx      → Form endereço residencial
├── empresa/
│   ├── DadosEmpresaForm.tsx  → Form CNPJ + dados fiscais
│   └── ConfigNotasForm.tsx   → Config emissão notas fiscais
├── certificado/
│   └── CertificadoSection.tsx → Upload e status certificado
├── documentos/
│   └── DocumentosGrid.tsx    → Grid de modelos
└── shared/
    ├── SectionCard.tsx       → Card container com título
    ├── ReadonlyField.tsx     → Campo somente-leitura (design system)
    └── FeedbackBanner.tsx    → Banner de feedback (success/error)
```

## Auth Flow

```
/login → supabase.auth.signInWithPassword()
       → middleware.ts valida JWT em cada request
       → redirect /login se não autenticado
       → redirect /dashboard se já autenticado + acessa /login
```

## Utilities e lib

```
src/utils/
├── index.ts          → cn(), daysUntil()
├── constants.ts      → PAGAMENTO_BADGES, STATUS_ATENDIMENTO_BADGES
└── supabase/         → client.ts, server.ts, middleware.ts

src/lib/
├── errors.ts         → ApiError, ValidationError, ForbiddenError, NotFoundError, formatErrorResponse, logError
├── env.ts            → ENV (Supabase + Woovi vars), validateEnv()
├── encryption.ts     → EncryptionService (AES-256 para woovi_pix_key)
├── authSession.ts    → sessionService (Criptografia e cookies de sessão customizados para fallback)
└── certificate/
    └── parseService.ts → parsePfxCertificate(buffer, password) → { dados_certificado, validTo }

src/hooks/
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
- `medicos` — dados do médico (nome, crm, especialidade, woovi_pix_key, etc.)
- `pacientes` — dados dos pacientes
- `atendimentos` — histórico de atendimentos (status, valor, pagamento_status)
- `certificados_digitais` — certificados e-CPF e empresa
- `empresa_medico` — dados fiscais da empresa do médico
