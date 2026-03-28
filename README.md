# Painel do Médico — DoutorTáOn

Aplicação standalone para o médico gerenciar seu cadastro, atendimentos, certificados e empresa.

## Stack

- Next.js 16.1.6 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth (email/senha direto)
- Mesmo banco de dados do `painel-atendimento`

## Funcionalidades

| Menu | Funcionalidade |
|------|----------------|
| Dashboard | Resumo: total de atendimentos, receita do mês, avaliação média, status do certificado |
| Atendimentos | Histórico com filtros por data, status e paciente |
| Perfil / Dados do Médico | Editar dados pessoais, profissionais (CRM, especialidades) e Pix key |
| Perfil / Endereço Residencial | Endereço com busca por CEP (ViaCEP) |
| Perfil / Certificado Digital | Upload e-CPF (.pfx) para assinatura de documentos |
| Empresa / Dados da Empresa | CNPJ com busca automática (BrasilAPI), razão social, endereço fiscal |
| Empresa / Config. de Notas | Regime tributário, inscrição municipal, certificado e-CNPJ |
| Documentos | Modelos de documentos criados (somente leitura) |

## Setup local

```bash
cd painel-medico
# Crie o .env.local com as variáveis abaixo
npm install
npm run dev
# Acesse: http://localhost:3001
```

## Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=         # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Anon key (pública)
SUPABASE_SERVICE_ROLE_KEY=        # Service role key (privada)
ENCRYPTION_KEY=                   # Mesma chave AES-256 do painel-atendimento
WOOVI_API_KEY=                    # API key Woovi/OpenPix
WOOVI_BASE_URL=https://api.woovi.com
NUVEM_FISCAL_CLIENT_ID=           # Client ID Nuvem Fiscal
NUVEM_FISCAL_CLIENT_SECRET=       # Client Secret Nuvem Fiscal
NUVEM_FISCAL_ENV=sandbox          # 'sandbox' ou 'production'
APP_ENV=development
```

## Migration Supabase

Execute antes do primeiro deploy:

```sql
-- Arquivo: supabase/migrations/20260327000001_create_empresa_medico.sql
```

Via Supabase MCP ou pelo dashboard do Supabase.

## Deploy no Dokploy

1. Crie um novo serviço apontando para este repositório
2. Configure Build Context: `/` (raiz do projeto)
3. Configure o Dockerfile: `Dockerfile`
4. Adicione as variáveis de ambiente acima
5. Build args necessários (para `NEXT_PUBLIC_*`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy → porta exposta: 3000

## Exportar como repositório próprio

```bash
cd painel-atendimento/painel-medico
git init
git add .
git commit -m "feat: initial painel-medico"
git remote add origin <URL_DO_NOVO_REPO>
git push -u origin main
```
