# RLS Policies — doutortaon

> Última varredura: 2026-03-28

---

## Padrão geral
Todas as políticas usam `auth.uid()` como identificador do usuário autenticado.
O `id` do médico em `medicos` coincide com `auth.uid()` do Supabase Auth.

---

## `medicos`
> RLS habilitado

- SELECT: médico lê próprio registro (`auth.uid() = id`)
- UPDATE: médico atualiza próprio registro

## `pacientes`
> RLS habilitado

- SELECT/UPDATE: paciente acessa próprio registro via `auth_user_id` ou `id`
- Médicos acessam via service_role em rotas API

## `atendimentos`
> RLS habilitado

- Médico: lê/atualiza atendimentos onde `medico_id = auth.uid()`
- Paciente: lê próprios atendimentos via `paciente_id`

## `certificados_digitais`
> RLS habilitado

- Médico: CRUD no próprio certificado (`medico_id = auth.uid()`)

## `empresa_medico`
> RLS habilitado (definido em migration 20260327000001)

```sql
-- SELECT
USING (auth.uid() = medico_id)

-- INSERT
WITH CHECK (auth.uid() = medico_id)

-- UPDATE
USING (auth.uid() = medico_id)
WITH CHECK (auth.uid() = medico_id)
```

## `documentos_modelos`
> RLS habilitado

- SELECT: médico vê seus modelos + modelos globais (`medico_id IS NULL`)
- INSERT/UPDATE/DELETE: apenas próprios modelos

## `documentos_emitidos`
> RLS habilitado

- Médico: lê onde `medico_id = auth.uid()`
- Paciente: lê onde `paciente_id = auth_user_id`

## `atendimentos_config`
> RLS habilitado — leitura pública (todos autenticados podem ler)

## `chatbot_sessions`
> RLS habilitado — acesso exclusivo via service_role

## `especialidades` / `cid10`
> RLS desabilitado — leitura pública irrestrita
