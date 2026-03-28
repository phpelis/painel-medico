# Edge Functions — painel-medico

> Última varredura: 2026-03-28

Nenhuma edge function no diretório `supabase/functions/` deste projeto.

As API routes são implementadas como Next.js Route Handlers em `src/app/api/`.

---

## API Routes (Next.js — não são Edge Functions Supabase)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/medico/me | Dados do médico autenticado |
| PATCH | /api/medico/update | Atualiza dados do médico |
| GET | /api/atendimentos | Lista com filtros e paginação |
| GET | /api/documentos | Modelos de documentos |
| GET/POST | /api/certificado | Certificado digital e-CPF |
| POST | /api/certificado/upload | Upload arquivo .pfx |
| GET/POST | /api/empresa | Dados empresa fiscal |
| GET | /api/empresa/buscar-cnpj | Busca dados por CNPJ |
| GET/POST | /api/empresa/certificado | Certificado e-CNPJ |
| POST | /api/empresa/certificado/upload | Upload certificado empresa |
| POST | /api/auth/logout | Logout |
