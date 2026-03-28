# Design System — painel-medico

> Compartilha o mesmo design system do `painel-atendimento`.
> Fonte da verdade: `src/app/globals.css`

---

## Tokens CSS (`:root`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#f8fafb` | Fundo da página |
| `--background-secondary` | `#f1f3f5` | Fundos secundários, hover states |
| `--foreground` | `#3b3c36` | Texto principal |
| `--foreground-secondary` | `#536878` | Texto secundário, labels |
| `--primary` | `#2d68c4` | Azul médico — botões, links, ações |
| `--primary-hover` | `#2555a3` | Hover do primário |
| `--border` | `#e5e7eb` | Borda padrão |
| `--border-strong` | `#d1d5db` | Borda em hover/foco |
| `--card-bg` | `#ffffff` | Fundo de cards |
| `--success` / `--success-light` | `#10b981` / `#d1fae5` | Badges verdes |
| `--warning` / `--warning-light` | `#f59e0b` / `#fef3c7` | Badges amarelos |
| `--error` / `--error-light` | `#ef4444` / `#fee2e2` | Badges vermelhos |
| `--info` / `--info-light` | `#3b82f6` / `#dbeafe` | Badges azuis |

---

## Tipografia

- **Fonte**: Outfit (Google Fonts) — `var(--font-outfit)`
- **Labels**: `.text-label` (0.75rem, semibold, uppercase)
- **Metadata**: `.text-metadata` (0.625rem, semibold, uppercase)

---

## Classes de Componentes

| Classe | Uso |
|--------|-----|
| `.medical-card` | Cards com borda e sombra sutil |
| `.medical-input` | Inputs e selects |
| `.action-btn-primary` | Botão primário (azul) |
| `.action-btn-secondary` | Botão secundário (cinza) |
| `.action-btn-ghost` | Botão sem fundo |
| `.status-badge.active` | Badge verde (pago, ativo) |
| `.status-badge.pending` | Badge amarelo (pendente) |
| `.status-badge.completed` | Badge azul (finalizado) |
| `.info-pill` | Pill de metadados |
| `.separator-line` | Divisória vertical |

---

## Regras

1. Nunca hardcodar cores — usar tokens `--color-*` via `@theme inline`
2. Cards: `.medical-card`
3. Inputs: `.medical-input`
4. Botões: `.action-btn-*`
5. Badges: `.status-badge` + modificador
6. Primária sempre `#2d68c4`
