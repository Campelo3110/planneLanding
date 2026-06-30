# Auditoria SEO — Planne

Data: 30 de junho de 2026  
Escopo: `https://planneapp.com/`, `/pt-br`, `robots.txt`, `sitemap.xml`, páginas legais e configuração Firebase presente no repositório.

## Resumo executivo

**SEO Health Score estimado: 74/100.** O site é rastreável, tem boa base on-page e internacionalização coerente. O maior limite atual não é uma falha técnica crítica, mas a combinação de pouca cobertura de conteúdo, sinais fracos de autoridade e risco de performance no elemento visual principal.

Tipo detectado: site de produto/SaaS, aplicativo Android para planejamento de eventos, em inglês e português do Brasil.

| Categoria | Nota | Peso | Diagnóstico |
|---|---:|---:|---|
| SEO técnico | 84 | 22% | HTTPS, 200, robots, sitemap, canonicals e hreflang corretos |
| Conteúdo | 64 | 23% | Landing pages boas, mas cobertura temática muito limitada |
| On-page | 82 | 20% | H1 único, titles e descriptions descritivos; titles longos |
| Schema | 84 | 10% | JSON-LD válido e útil, mas entidade da marca pode ser enriquecida |
| Performance | 55 | 10% | Hero externo sem dimensões/preload; medição de campo indisponível |
| Busca por IA/GEO | 60 | 10% | FAQ ajuda, porém faltam autoria, prova, páginas citáveis e presença editorial |
| Imagens | 67 | 5% | Alt presente; OG excessivamente pesada e hero dependente de terceiro |

Não foi encontrado bloqueio crítico de indexação. O domínio respondeu `200` em HTTP/2; homepage, `/pt-br`, sitemap e robots estavam acessíveis na validação ao vivo.

## Principais achados

### Alta prioridade

1. **Cobertura orgânica restrita a duas landing pages comerciais.** O sitemap possui apenas as homepages em EN/PT-BR e duas páginas legais. Não há URLs dedicadas a intenções como “app para organizar casamento”, “lista de convidados”, “controle de orçamento de evento” ou “checklist de casamento”. Uma única landing dificilmente acumula relevância para todas essas buscas.

2. **Hero/LCP depende de uma imagem remota do Unsplash.** A imagem principal é carregada de outro domínio, com `w=2000`, sem `width`, `height`, `srcset`, `fetchpriority="high"` ou preload. Isso adiciona DNS/TLS e cria risco de LCP e CLS. A fonte Inter local existe, mas há preconnects para Google Fonts sem uso aparente.

3. **Autoridade e E-E-A-T fracos.** Não há página institucional/sobre, responsáveis pelo produto, canais de suporte claramente vinculados na landing, estudos de caso, avaliações ou conteúdo assinado. A política usa um Gmail e contém endereço postal incompleto (`__________`), o que reduz confiança e consistência da entidade.

4. **Sem dados reais de busca e CWV no escopo.** Não havia acesso a Google Search Console/GA4/CrUX. A API pública do PageSpeed respondeu com cota excedida. Portanto, rankings, indexação real, cliques e LCP/INP/CLS não foram inferidos.

### Média prioridade

5. **Titles acima do intervalo visual comum.** EN tem 67 caracteres e PT-BR 72; podem ser truncados. As descriptions estão adequadas (144 e 155 caracteres).

6. **Imagem Open Graph com 1,34 MB.** As dimensões 1200×630 são corretas, mas o arquivo deve ser comprimido para reduzir transferência e tempo de renderização em crawlers sociais.

7. **Schema correto, mas isolado.** `Organization`, `WebSite`, `SoftwareApplication` e `FAQPage` são JSON válido. Recomenda-se conectar entidades com `@id`, adicionar `sameAs` para Google Play e perfis oficiais, `inLanguage`, imagem e publisher. Avaliações só devem ser incluídas quando forem reais e visíveis.

8. **Páginas legais misturam idiomas.** `/privacy` está em inglês e `/terms` em português, sem alternativas localizadas. Não é um bloqueio para as landing pages, mas enfraquece experiência e consistência internacional.

9. **Sitemap pode ser mais enxuto.** Páginas legais têm baixo valor como destino de busca. Podem permanecer indexáveis, mas a prioridade do sitemap deve ser conteúdo canônico destinado a aquisição orgânica. Novas páginas comerciais/editoriais devem entrar nele com hreflang recíproco.

### Pontos positivos

- `robots.txt` permite rastreamento e aponta para o sitemap correto.
- Sitemap XML válido com alternates EN, PT-BR e `x-default` nas páginas principais.
- Canonicals autorreferentes e hreflang recíproco no HTML.
- Um H1 por landing, hierarquia H2/H3 clara e FAQ visível compatível com o schema.
- Metadados Open Graph/Twitter completos e imagem com dimensões declaradas.
- `SoftwareApplication` informa Android, categoria, oferta gratuita e URL da Google Play.
- Links externos abertos em nova aba usam `noopener noreferrer`.

## SEO técnico e indexabilidade

- Status ao vivo: `200` para `/`, `/pt-br`, `/sitemap.xml` e `/robots.txt`.
- Canonical: correto em EN e PT-BR.
- Hreflang: correto e recíproco; manter a mesma capitalização (`pt-BR`) por consistência entre HTML e sitemap.
- Hosting: `cleanUrls: true` e `trailingSlash: false` combinam com as URLs canônicas.
- 404: rewrite final envia rotas desconhecidas para `404.html`; deve-se confirmar após deploy que o Firebase devolve status HTTP 404, e não soft 404 com status 200.
- Headers: a resposta publicada mostrou HSTS, mas não exibiu todos os headers definidos atualmente no `firebase.json`, sugerindo que configuração local e deploy podem estar defasados. Isso não altera ranking diretamente, mas requer verificação operacional.

## Conteúdo e intenção de busca

As landing pages explicam problema, funcionalidades, processo e FAQ. O conteúdo é suficiente para conversão de marca, mas insuficiente para criar uma arquitetura de aquisição orgânica. Recomenda-se uma URL canônica por intenção relevante, evitando páginas quase duplicadas:

- `/pt-br/app-organizar-casamento`
- `/pt-br/lista-convidados-casamento`
- `/pt-br/planilha-orcamento-evento` ou uma ferramenta realmente útil
- `/pt-br/checklist-casamento`
- equivalentes em inglês apenas quando houver demanda e tradução editorial de qualidade

Cada página deve responder à intenção completa, demonstrar o produto com capturas próprias, ter FAQ específico e ligar naturalmente à Google Play e às páginas relacionadas.

## Performance e imagens

O HTML principal tem cerca de 64 KB, CSS 45 KB e fonte local 48 KB — tamanhos razoáveis. Os riscos mais claros estão nos recursos visuais e scripts de terceiros:

- Hospedar a imagem hero no próprio domínio em AVIF/WebP, com variações responsivas.
- Declarar `width` e `height`; usar `fetchpriority="high"` apenas na imagem LCP.
- Remover preconnects não utilizados para Google Fonts.
- Hospedar ou versionar Lucide/AOS localmente; avaliar remover AOS acima da dobra.
- Comprimir `og-cover.png` (1,34 MB) sem alterar 1200×630.
- Medir mobile em produção e registrar LCP, INP e CLS por 28 dias no Search Console/CrUX.

## Busca por IA / citabilidade

A FAQ oferece blocos objetivos, mas quase todo conteúdo está em uma única página promocional. Para melhorar citação por buscadores com IA:

- publicar guias com respostas diretas, exemplos, tabelas e data de atualização;
- identificar claramente empresa/equipe e canais oficiais;
- incluir evidências próprias do produto, screenshots e metodologia;
- manter fatos sobre preço/plataformas consistentes no site, Google Play e schema;
- `llms.txt` é opcional e não substitui conteúdo rastreável, sitemap e autoridade.

## Limitações

- Auditoria de código e validação HTTP, não auditoria de dados do Search Console.
- Sem volume de palavras-chave, backlinks ou comparação de SERP/concorrentes.
- Sem métricas Lighthouse/CWV devido à cota da API pública do PageSpeed.
- A busca pública disponível não retornou dados suficientes para afirmar indexação; validar por URL Inspection no Search Console.
