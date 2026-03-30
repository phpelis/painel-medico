# Project Alignment Status — painel-medico

> Status: ALIGNED
> Aligned on: 2026-03-28
> Aligned by: antigravity_cloud_code_skill_kit
> Last verified: 2026-03-30 (Re-Alignment)

## Alignment checklist
- [x] Task system created (.tasks/)
- [x] Project map created (.project-map/MAP.md)
- [x] Design system documented (.project-map/design-system.md)
- [x] Feature inventory completed
- [x] Codebase audit completed
- [x] Infrastructure docs created (supabase, chatwoot ref, woovi ref)

## Project health
- Features documented: 7/7 (auth, dashboard, atendimentos, documentos, perfil, empresa, certificado)
- Files in project map: 63/63 (+ 5 tabelas no MAP.md e colunas sincronizadas)
- Design tokens documented: yes
- Naming convention: camelCase (components PascalCase)
- Organization: feature-based (components/) + layer-based (lib/, utils/, types/)

## Code review — issues corrigidos (2026-03-28)

### Críticos
- [x] `logout/route.ts` — hardcoded `localhost:3001` substituído por `request.url`
- [x] `medico/me/route.ts` — `select('*')` substituído por colunas explícitas

### Importantes
- [x] `ReadonlyField.tsx` criado em `shared/` — 3 duplicatas eliminadas
- [x] `FeedbackBanner.tsx` criado em `shared/` — 5 duplicatas eliminadas
- [x] `daysUntil()` centralizado em `utils/index.ts`
- [x] `PAGAMENTO_BADGES` e `STATUS_ATENDIMENTO_BADGES` centralizados em `utils/constants.ts`
- [x] `parsePfxCertificate()` extraído para `lib/certificate/parseService.ts`
- [x] `getRequestId()` dead code removido de `lib/errors.ts`
- [x] `EmpresaConfig` local substituído por `Pick<EmpresaMedico, ...>`
- [x] `console.error` adicionado em `api/documentos/route.ts`

### Minores
- [x] `X-Frame-Options` → `DENY` em `middleware.ts`
- [x] `NUVEM_FISCAL_*` vars desnecessárias removidas de `lib/env.ts`

## Code review — issues corrigidos (2026-03-30)

### Críticos
- [x] `database.ts` — `woovi_pix_key_tipo` adicionado ao tipo `Medico` (remove `as any`)

### Importantes
- [x] `CertificadoSection.tsx` — `deleteEndpoint` como prop explícita (remove string fragile replace)
- [x] `DadosMedicoForm.tsx` — `PIX_TIPO_OPTIONS` constante + uso do helper `selectField()` (DRY)
- [x] `AtendimentosClient.tsx` — `totalPago`/`totalPendente` em `useMemo`; `BOTTOM_MARGIN` const
- [x] `AtendimentosClient.tsx` — `(a as any).paciente` → `a.paciente` (já tipado)

### Minores
- [x] `AppHeader.tsx` — `'use client'` removido (sem hooks; agora Server Component)

## Auditoria de Alinhamento (2026-03-30) — Refatoração Concluída

### Problemas Corrigidos
- [x] **DocumentosGrid.tsx**: 454 → 138 linhas (Refatorado em sub-componentes: `FilterBar`, `Table`, `Modals`).
- [x] **DadosEmpresaForm.tsx**: 232 → 108 linhas (Refatorado em `IdentificationSection`, `AddressSection`).
- [x] **AtendimentosClient.tsx**: 227 → 85 linhas (Refatorado em `FilterBar`, `Stats`, `Table`).

### Resultado da Auditoria
- Todos os componentes agora obedecem ao limite de 200 linhas.
- Separação de responsabilidades (Separation of Concerns) aplicada com sucesso.
- Estrutura de arquivos sincronizada com o `MAP.md`.
