# eeco — site institucional

Site de Hapi para a eeco, uma agência de soluções inovadoras em tecnologia e negócios, orientada por regeneração, sustentabilidade e impacto ambiental positivo. Impressão e personalização são uma linha de serviços da agência.

**Referência publicada: versão 28 · 13/11/2026, 09:01:00 · America/Sao_Paulo (UTC−03:00).**

[Site](https://eeco-by-hapi.hapi-alquimias.chatgpt.site) · [Recycla](https://eeco-by-hapi.hapi-alquimias.chatgpt.site/recycla/) · [Histórico](CHANGELOG.md) · [Ficha da versão 28](docs/releases/v28.md)

Este repositório guarda código editável, distribuição e documentação. A publicação é gerenciada pelo Sites; um commit no GitHub, por si só, não publica o site. O número 28 pertence ao histórico do Sites e é independente da versão 0.5.0 do APK Recycla.

## Começar ou retomar

```sh
git clone https://github.com/abdelhayalm/eeco-website.git
cd eeco-website
python3 scripts/verify_release.py
python3 build.py
node --check source/main.js
node --check recycla/page.js
python3 scripts/verify_release.py
python3 -m http.server 8000 --directory dist
```

Abra `http://localhost:8000`. A construção usa a biblioteca padrão do Python 3; Node.js verifica a sintaxe JavaScript. Não há instalação npm nem backend do formulário.

| Caminho | Responsabilidade |
| --- | --- |
| `source/template.html` | Estrutura e fallback em inglês |
| `source/style.css` | Identidade, responsividade, RTL e movimento |
| `source/copy.json` | Conteúdo EN, PT-BR e árabe egípcio |
| `source/main.js` | Idiomas, navegação, diálogos, vídeo e pedido WhatsApp |
| `source/assets/`, `source/assets.json` | Fontes, licenças e imagens incorporadas |
| `assets/` | Galeria Carmen, identidade e mídia externa ao HTML |
| `recycla/` | Vitrine Recycla, ilustrações e APK |
| `Recycla/index.html` | Entrada alternativa com inicial maiúscula |
| `build.py` | Gera HTML raiz/dist e copia os recursos |
| `dist/` | Saída estática para publicação |
| `.openai/hosting.json` | Identidade do Site e diretório estático |
| `scripts/verify_release.py` | Verificação de integridade da referência |
| `docs/releases/v28-sha256.txt` | Manifesto SHA-256 de código e distribuição |

## Estado funcional da versão 28

- Interface EN/PT/AR com persistência do idioma e suporte RTL.
- Formulário eeco materiais com nome, projeto, material, quantidade, local, data e observações. Impressão, personalização e arte são tratadas na reunião, conforme a nota antes do botão.
- Vídeo final de 33 segundos e capa fornecidos por Hapi; controles nativos e carregamento ao abrir. O navegador decide se permite som; há botão alternativo. Fechar pausa e reinicia o vídeo; ocultar a aba pausa.
- O formulário abre o WhatsApp com o pedido para o visitante revisar e enviar; não armazena leads nem agenda reuniões automaticamente.
- Carmen: galeria de 15 fotos, toque, arraste, teclado e miniaturas.
- Recycla: prévias e APK assinado 0.5.0 em `/recycla/` e `/Recycla/`. A assinatura Android é mantida no projeto Recycla-App.

## Documentação

- [Desenvolvimento, publicação e recuperação](docs/OPERACAO.md)
- [Versão 28: origem, alterações e validação](docs/releases/v28.md)
- [Metadados da publicação](docs/releases/v28.json)
- [Sistema visual](DESIGN.md)
- [Galeria Carmen](docs/carmen-gallery.md)
- [Histórico de alterações](CHANGELOG.md)

Logos originais preservados; Quicksand e Noto Sans Arabic locais com licenças incluídas. A orientação regenerativa não equivale a uma certificação ou a resultados ambientais medidos.

## Limites da conferência

A publicação foi confirmada na URL do Sites. O domínio independente `eeco.abdelhayalm.com` não foi validado nesta atualização. O acesso atual do Sites é restrito ao proprietário, sem alteração nesta atualização documental.

Os checks desta atualização cobrem construção, sintaxe, traduções, recursos, cópias geradas e hashes. Não representam uma nova auditoria visual em todos os dispositivos nem certificação de acessibilidade. Veja a ficha da versão para a evidência e o ponto de retomada.
