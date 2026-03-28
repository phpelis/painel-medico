# Chatwoot — painel-medico

> Status: NÃO INTEGRADO DIRETAMENTE

O painel-medico não faz chamadas à API do Chatwoot nem processa webhooks do Chatwoot.

## Como o Chatwoot aparece no painel-medico

- `medicos.chatwoot_user_id` — armazena o ID do médico como agente no Chatwoot
  - Gravado pelo painel-atendimento durante o fluxo de onboarding
  - Lido pelo painel-medico em `/api/medico/me` (retornado no perfil)
- `atendimentos.conversation_id` — ID da conversa no Chatwoot
  - Gravado pelo painel-atendimento
  - Exibido no painel-medico como referência da consulta

## Onde o Chatwoot é integrado ativamente

Ver projeto: `painel-atendimento` (porta 3000)
- Webhooks recebidos: CONVERSATION_CREATED, MESSAGE_CREATED, etc.
- API calls: criar conversa, enviar mensagem, atribuir agente
