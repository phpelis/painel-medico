# Woovi (Pix) — painel-medico

> Status: LEITURA DE DADOS — API não chamada diretamente

## Variáveis de ambiente
- `WOOVI_API_KEY` — key da Woovi (opcional no painel-medico)
- `WOOVI_BASE_URL` — base URL da Woovi (opcional no painel-medico)
- `ENCRYPTION_KEY` — AES-256 para `woovi_pix_key` em medicos

## O que o painel-medico faz com Woovi

O painel-medico **lê** dados de pagamento Pix mas **não cria cobranças**.

### Dados lidos de `atendimentos`
- `pagamento_status` — pendente | pago | cancelado | estornado
- `pagamento_id` — correlationID Woovi
- `pagamento_url` — link de pagamento Pix
- `pagamento_expiracao` — expiração do link
- `comprovante_pagamento` — receiptUrl recebida via webhook
- `pago_em` — timestamp da confirmação

### `medicos.woovi_pix_key`
- Armazena a chave Pix do médico encriptada com AES-256
- Encriptação/decriptação via `src/lib/encryption.ts` (EncryptionService)
- O painel-medico pode ler/atualizar a chave Pix do médico em `/dashboard/perfil/dados`

## Onde Woovi é integrado ativamente

Ver projeto: `painel-atendimento` (porta 3000)
- Cria cobranças Pix via API Woovi
- Processa webhooks OPENPIX:CHARGE_COMPLETED
