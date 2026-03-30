# Tasks — painel-medico

---

## ⚙️ Kit Alignment (permanent)

> Configurações do skill kit — nunca arquivadas, marcadas [x] quando feitas.
> Fonte de verdade completa: `.tasks/KIT-ALIGNMENT.md`
> Atualizado pelo `/update-kit` quando o kit é atualizado.

- [x] Infraestrutura base criada (.tasks/, .project-map/) — 2026-03-28
- [x] Sistema de tarefas ativo (task-manager) — 2026-03-28
- [x] Mapa do projeto criado (MAP.md) — 2026-03-28
- [x] Alinhamento inicial concluído (core-project-alignment) — 2026-03-28
- [x] Design system documentado (.project-map/design-system.md) — 2026-03-28
- [x] Supabase: schema.md com tabelas reais — 2026-03-28
- [x] Supabase: rls-policies.md documentado — 2026-03-28
- [x] Chatwoot: webhooks-received.md documentado (N/A) — 2026-03-30

---

## Active tasks

### TASK-CERT-001 — Regra de validação e-CPF/e-CNPJ
- Status: IN PROGRESS
- Priority: HIGH
- Subtasks:
  - [ ] TASK-CERT-001-01 — Atualizar `parseService.ts` com detecção de e-CNPJ
  - [ ] TASK-CERT-001-02 — Implementar validação nas rotas de API (médico e empresa)
  - [ ] TASK-CERT-001-03 — Adicionar validação em tempo real no `CertificadoSection.tsx`
  - [ ] TASK-CERT-001-04 — Validar fluxos de erro e avisos na UI

---

### TASK-ALIGN-001 — Refatorar componentes extensos
- Status: COMPLETED
- Priority: MEDIUM
- Subtasks:
  - [x] TASK-ALIGN-001-01 — Split `DocumentosGrid.tsx` (413 linhas) — OK
  - [x] TASK-ALIGN-001-02 — Refatorar `DadosEmpresaForm.tsx` (216 linhas) — OK
  - [x] TASK-ALIGN-001-03 — Extrair lógica de `AtendimentosClient.tsx` (205 linhas) — OK

---

## Backlog

(nenhuma tarefa no backlog)
