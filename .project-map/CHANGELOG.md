# Changelog — painel-medico

> Formato: [DATA] — Descrição da mudança

---

## 2026-03-30

### Layout — redesign sidebar → top-bar
- Removida navegação lateral (Sidebar.tsx / TopBar.tsx — arquivos mantidos, não importados)
- Criado `AppHeader.tsx` — header global com stethoscope avatar, Dr(a). Nome + badge de nota + CRM
  - Convertido para Server Component (sem hooks)
  - Doctor name no LEFT (espelha padrão UnifiedHeader do painel-atendimento)
  - Nota inline ao lado do nome (não em card separado)
- Criado `NavBar.tsx` — 5 tabs horizontais (Dashboard, Atendimentos, Perfil, Empresa, Documentos)
  - Altura `h-14` alinhada com ActionBar do painel-atendimento
  - Indicador ativo: bottom border pill azul
- Criado `SubNavBar.tsx` — sub-tabs `h-10` visíveis apenas em `/perfil` e `/empresa`
- `DashboardOverview.tsx` — removido card "Avaliação média" (movido para AppHeader)
- `dashboard/layout.tsx` — substituída estrutura sidebar por AppHeader + NavBar + SubNavBar

### Paginação dinâmica
- Criado `useDynamicPagination.ts` — hook que usa `getBoundingClientRect()` para calcular
  `itemsPerPage` e `availableHeight` sem dependência circular com `clientHeight`
  ResizeObserver + window resize + 300ms debounce
- Criado `PaginationControls.tsx` — botões Anterior/Próximo + "Página X de Y"
- Criado `PaginatedListView.tsx` — componente genérico com paginação client-side + maxHeight
- `DocumentosGrid.tsx` — migrado para PaginatedListView (CARD_HEIGHT=140, gap=16)
- `AtendimentosClient.tsx` — reescrito: fetch único (limit=500), paginação client-side
  - Elimina double-fetch no mount (LIMIT instável MIN_ITEMS→real)
  - Elimina loading flash ao trocar página (sem re-fetch por página)
  - `maxHeight: availableHeight - BOTTOM_MARGIN` impede scroll da página
  - `sticky top-0` no thead da tabela
  - `totalPago`/`totalPendente` com `useMemo([allData])`

### Tabela de atendimentos — correções visuais
- `valor_consulta = 0` exibe "R$ 0,00" (corrigido: `!= null` em vez de verificação falsy)
- Badge semântico: valor=0 → "Gratuito" (verde); status=cancelado → "Desconsiderado" (neutro)
- Coluna "Status" removida
- Ícone Clock ao lado da data para atendimentos `em_atendimento`
- Badge de hora de término (HH:MM) ao lado da data quando `fim` existe

### Perfil e Empresa — melhorias de formulário
- `DadosMedicoForm.tsx` — adicionado seletor `woovi_pix_key_tipo` (PIX_TIPO_OPTIONS const)
  usa `selectField()` helper existente; `woovi_pix_key_tipo` adicionado ao tipo `Medico`
- `EnderecoForm.tsx` — `mx-auto` adicionado para centralizar container
- `DadosEmpresaForm.tsx` — `mx-auto` + lookup ViaCEP automático no campo CEP
  (onChange ao completar 8 dígitos + onBlur); preenche logradouro, bairro, cidade, uf, ibge
- `CertificadoSection.tsx` — `mx-auto` + botão "Excluir certificado" com confirmação em 2 passos
  Prop `deleteEndpoint` explícita (substituiu `uploadEndpoint.replace('/upload', '')`)
- API: `DELETE /api/certificado` e `DELETE /api/empresa/certificado` adicionados (soft delete)

### Code review — issues corrigidos (2026-03-30)
- [x] `database.ts` — `woovi_pix_key_tipo?: string` adicionado ao tipo `Medico`
- [x] `database.ts` — `paciente?: Pick<Paciente, 'nome' | 'cpf'>` já tipado em `Atendimento`; `as any` removido
- [x] `CertificadoSection` — `deleteEndpoint` como prop explícita (remove fragilidade de string)
- [x] `DadosMedicoForm` — `PIX_TIPO_OPTIONS` const + `selectField()` helper (remove duplicação)
- [x] `AtendimentosClient` — `totalPago`/`totalPendente` em `useMemo`; `BOTTOM_MARGIN` como const
- [x] `AppHeader` — `'use client'` removido (sem hooks, agora Server Component)

---

## 2026-03-28
- Skill kit (antigravity_cloud_code_skill_kit) instalado e projeto alinhado
- `.tasks/` criado: TASKS.md, KIT-ALIGNMENT.md, SESSION.md
- `.project-map/infrastructure/` criado com schema Supabase real
- `.project-map/STATUS.md` atualizado para formato do skill kit
- Code review concluído: 12 issues corrigidos (ver STATUS.md anterior)
- `empresa_medico` table criada via migration (NFS-e via Nuvem Fiscal)
- Commit inicial: Next.js + Supabase + design system médico
