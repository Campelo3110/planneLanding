# Planne RSVP

Implementacao MVP do RSVP publico da Planne usando Firebase Hosting + Cloud Functions.

## Arquivos

- `public/rsvp.html`: pagina publica acessada por `/rsvp.html?e=<eventRsvpToken>`.
- `functions/index.js`: endpoints HTTPS seguros usando Firebase Admin SDK.
- `functions/package.json`: dependencias da Cloud Function.
- `firebase.json`: adiciona `functions.source` e rewrite `/rsvp/**` para a function `rsvp`.

## Configuracao obrigatoria

Defina um segredo de assinatura com pelo menos 32 caracteres antes de publicar:

```bash
firebase functions:secrets:set RSVP_SIGNING_SECRET
```

A funcao `rsvp` ja declara esse segredo no runtime. Sem ele, o RSVP aberto continua criando solicitacoes, mas o fluxo reservado nao retorna identificadores assinados para convidados.

## Campos esperados em `events/{eventId}`

```txt
rsvpEnabled: boolean
rsvpMode: "open" | "reserved"
rsvpDesign: "clean" | "warm" | "formal"
rsvpPublicToken: string
rsvpRequireApproval: boolean
rsvpAllowCompanions: boolean
rsvpMaxCompanions: number
rsvpCreatedAt
rsvpUpdatedAt
```

O token publico deve ser aleatorio e nao deve ser o `eventId`.

## Campos usados em `events/{eventId}/guests/{guestId}`

```txt
confirmationStatus: 1 | 2 | 0
rsvpRespondedAt
rsvpResponseSource
rsvpCompanionsCount
rsvpFoodRestriction
normalizedName
phoneLast4
```

`normalizedName` melhora a busca reservada. O backend tem fallback, mas para listas grandes o ideal e preencher esse campo quando o app cria ou sincroniza convidados.

## Colecao `rsvp_requests`

Cada resposta aberta ou fallback do modo reservado cria um documento em `rsvp_requests`:

```txt
eventId
eventRsvpToken
name
normalizedName
phone
email
status: "pending" | "approved" | "rejected" | "convertedToGuest"
confirmationStatus
companionsCount
foodRestriction
createdAt
updatedAt
source: "public_rsvp" | "reserved_rsvp"
```

## Endpoints

- `GET /rsvp/event?token=<eventRsvpToken>`
- `POST /rsvp/searchGuest`
- `POST /rsvp/respondReserved`
- `POST /rsvp/respondOpen`

O site nao grava no Firestore diretamente. Todas as leituras e escritas publicas passam pela Cloud Function `rsvp`.

## Pontos de integracao no app

- Tela de evento/configuracoes: ativar `rsvpEnabled`, escolher `rsvpMode`, gerar `rsvpPublicToken` e copiar o link.
- Tela de criacao/configuracao do RSVP: permitir escolher `rsvpDesign` entre `clean`, `warm` e `formal`.
- Tela de convidados: incluir acao para copiar/enviar `https://planneapp.com/rsvp.html?e=<token>`.
- Sync de eventos: incluir os campos `rsvp*`.
- Sync de convidados: incluir `normalizedName`, `rsvpRespondedAt`, `rsvpResponseSource`, `rsvpCompanionsCount` e `rsvpFoodRestriction`.
- Futuro painel: listar `rsvp_requests` pendentes por `eventId` para aprovar, rejeitar ou converter em convidado.

## Teste manual

1. Crie ou atualize um documento em `events` com `rsvpEnabled: true` e `rsvpPublicToken`.
2. Teste `/rsvp.html?e=<token>`.
3. Para modo `open`, envie uma resposta e confira `rsvp_requests`.
4. Para modo `reserved`, garanta que convidados tenham `normalizedName`, busque pelo nome e confirme.
5. Confira `confirmationStatus` no documento do convidado.
