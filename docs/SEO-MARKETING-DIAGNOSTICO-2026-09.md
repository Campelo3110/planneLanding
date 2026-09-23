# Diagnóstico SEO e marketing — Planne

Data: 23 de setembro de 2026. Escopo: páginas públicas de aquisição, sem incluir
o app autenticado, RSVP funcional ou ferramentas internas.

## Resumo executivo

A Planne apresenta uma experiência móvel editorial e premium consistente. As doze
landings indexáveis (home e cinco ocasiões em EN/PT-BR) têm title, descrição,
canonical, hreflang, H1 e JSON-LD. O principal risco técnico era o rewrite global
para o convite, que devolvia HTTP 200 para URLs inexistentes. As páginas de
ocasião também compartilham estrutura e vocabulário demais para que cada uma
conquiste uma intenção de busca própria.

Saúde SEO estimada antes da Fase 1: **70/100**.

| Área | Avaliação | Observação |
| --- | --- | --- |
| Técnico | Atenção | Soft 404s causados pelo fallback universal de RSVP. |
| On-page | Forte | Metadados e canonicals presentes nas landings. |
| Internacional | Bom | Pares EN/PT-BR completos; `/pt-br` precisava de URL uniforme no sitemap. |
| Conteúdo | Atenção | Páginas de ocasião têm 71–82% de sobreposição lexical. |
| Performance | Misto | Home: Lighthouse Performance 96; wedding: 72, LCP 4,8 s em laboratório. |
| Conversão | Base boa | CTA Google Play claro, mas mensuração e prova social ainda são oportunidades. |

## Posicionamento de trabalho

> Planne transforma o convite em um site bonito para convidados e mantém RSVP,
> pessoas, mesas, tarefas e orçamento juntos para quem organiza.

Alternativas reais a enfrentar: planilhas/WhatsApp, Canva + formulário, serviços
de convite isolados e suites de casamento. A formulação é uma hipótese de marca;
não deve ser transformada em alegação comparativa sem evidência.

## Plano aprovado para execução

### Fase 1 — fundação técnica e medição

1. Preservar os slugs de convite válidos, restringir o fallback de Hosting a um
   segmento e impedir a indexação de convites públicos.
2. Publicar `/llms.txt` real, em vez de deixar a URL cair no fallback de RSVP.
3. Uniformizar a URL canônica de `/pt-br/` no sitemap/hreflang.
4. Manter o contrato de eventos de clique da landing e incluir atribuição de
   origem no link do Google Play, sem adicionar coleta de terceiros ou tocar no app.
5. Entregar fontes WOFF2 para reduzir bytes críticos das páginas públicas.

### Fase 2 — páginas e conversão

- Criar blocos funcionais específicos por ocasião, preservando o design editorial.
- Incluir CTA secundário de demonstração e prova social somente quando verificável.
- Tornar a explicação Free/Premium mais clara, sem descaracterizar a marca.

### Fase 3 — conteúdo e expansão internacional

- Priorizar hubs de casamento/RSVP, convites por ocasião e organização de convidados.
- Validar demanda antes de criar uma versão ES culturalmente localizada para
  quinceañera.
- Criar conteúdo próprio citável: exemplos reais autorizados, guias e dados de uso.

## Limitações do diagnóstico

Não havia acesso a Search Console, GA4 ou dados de palavras-chave. Performance é
uma leitura Lighthouse de laboratório; resultados de instalação/conversão devem
ser validados depois da publicação.
