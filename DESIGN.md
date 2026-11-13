# Sistema visual e decisões de interface — eeco

## Identidade preservada

| Uso | Cor |
| --- | --- |
| Amarelo solar | `#FCBF01` |
| Verde-preto | `#111B1E` |
| Ameixa | `#26161F` |
| Azul-marinho | `#0D203B` |
| Azul profundo | `#01111D` |
| Alabastro | `#FFFFF0` |
| Identidade eeco materiais | `#FFFF98` |

Quicksand para texto latino e Noto Sans Arabic para árabe, com arquivos e licenças locais. Os logos fornecidos são preservados. A identidade da agência abrange tecnologia, negócios e regeneração; impressão é uma linha de serviços. Textos EN/PT/AR são mantidos em `source/copy.json`.

## Decisões de implementação

- HTML/CSS/JavaScript estáticos gerados por `build.py`. Não há necessidade de React ou de uma biblioteca de animação apenas para decoração.
- Abertura com arte solar original e órbitas finas; a sequência inicial é breve. Órbitas e ilustrações pausam quando ficam fora da tela ou a aba é ocultada.
- Navegação móvel com ícones SVG geométricos consistentes, rótulos traduzidos e `aria-current` na seção ativa.
- Logos completos com `object-fit: contain`. As superfícies claras e o tratamento multiply preservam a aparência dos recursos originais de Kemet; referências antigas a Alquimia descrevem uma etapa anterior à vitrine Recycla.
- Entradas por rolagem ocorrem uma vez e usam deslocamentos leves de 16–22 px. Não recortam nem redimensionam os cards. Escalonamento somente em elementos da mesma linha desktop; sem atraso extra no mobile. Links profundos e rolagem rápida assentam o conteúdo imediatamente.
- Lagarta, casulo e borboleta têm movimentos SVG próprios, separados dos wrappers de entrada. A lagarta avança, o casulo oscila pelo ponto de suspensão e as asas da borboleta giram junto ao corpo. `IntersectionObserver` limita o movimento aos elementos visíveis.
- Feedback de interação entre 160 e 360 ms; hover de imagens discreto; transição de legendas em 180 ms. O carrossel usa rolagem nativa, sem avanço automático.
- Diálogos nativos com entrada de 320 ms e saída de 150 ms, Escape, fechamento pelo fundo e retorno de foco. Animar opacidade/transformações; evitar blur e dimensões. O fundo mobile não usa blur.
- Leituras de geometria precedem escritas de estilo no feedback de rolagem. A variável de progresso pertence à barra; atributos da navegação mudam só quando a seção ativa muda.
- `prefers-reduced-motion` é respeitado inicialmente e quando muda durante a sessão. Conteúdo deve permanecer legível sem movimento ou JavaScript.
- Controles nativos, teclado/RTL nas abas, foco visível, link de salto e idioma persistente permanecem. Sem numeração decorativa nem link GitHub no rodapé.
- Os diálogos de serviços apresentam título e um parágrafo completo sobre propósito/escopo, sem CTA de contato; mantêm o fechamento.

## eeco materiais na versão 28

O card usa o lockup transparente original. O diálogo apresenta vídeo e formulário lado a lado no desktop, empilhados em telas menores. O vídeo e a capa são arquivos fornecidos por Hapi; preload desativado na página. Controles nativos e alternativa para reprodução bloqueada pelo navegador permanecem.

Os detalhes de impressão/personalização e arte são discutidos na reunião; a nota fica antes do botão WhatsApp, sem esses controles no formulário.

## Referências e verificação

Referências de design registradas no projeto: Impeccable, Emil Kowalski e Web Quality, aplicadas como orientação de acabamento, resposta de interação e acessibilidade. Não são dependências instaladas.

O histórico anterior registra revisão visual em 320/390/768/1280 px, nos três idiomas, com RTL, navegação, logos, abas e teclado. A atualização documental atual verifica construção, sintaxe, recursos, cópias e hashes; não repete aquela revisão visual nem representa uma certificação WCAG ou pontuação Lighthouse.
