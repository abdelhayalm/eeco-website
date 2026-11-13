# Desenvolvimento, publicação e recuperação

## Ponto de partida

Leia `README.md`, `CHANGELOG.md` e `docs/releases/v28.md`. Confira `git status` e a publicação atual no Sites. Reutilize o projeto de `.openai/hosting.json`.

GitHub é a cópia de manutenção; o Sites tem um repositório de origem separado. Os SHAs são diferentes. A ficha da versão e os hashes relacionam os arquivos.

## Atualizar o site

1. Crie um branch, por exemplo `git switch -c update/descricao`.
2. Edite textos em `source/copy.json`, mantendo EN/PT/AR alinhados. Novos elementos traduzíveis precisam de fallback HTML e atributos de tradução.
3. Edite estrutura, estilo e comportamento em `source/template.html`, `source/style.css` e `source/main.js`. Evite editar apenas o HTML gerado.
4. Mantenha mídia em `assets/`, logos originais e licenças. Ao substituir vídeo/capa, atualize `src`/`poster` e use nomes novos.
5. Edite a vitrine em `recycla/`; o builder copia a entrada HTML para `Recycla/`. Confira caminhos absolutos dos recursos e do APK.
6. Execute `python3 build.py`, `node --check source/main.js`, `node --check recycla/page.js` e `python3 scripts/verify_release.py --skip-hashes`. Hashes diferentes são esperados após mudanças intencionais; o manifesto v28 permanece como referência.
7. Sirva `dist/` com `python3 -m http.server 8000 --directory dist`. Revise as mudanças em mobile/desktop, nos três idiomas, com RTL, teclado, foco, Escape e movimento reduzido.
8. Confira `git diff`; inclua fonte, mídia e distribuição no commit. Atualize o changelog. Para um novo lançamento, crie outro manifesto com o número real da nova versão.

O builder usa cópia com `dirs_exist_ok=True`: não remove arquivos antigos. Exclua também de `dist/` uma mídia obsoleta, depois de conferir que não é referenciada. Preserve o APK ao limpar saídas.

## Publicar uma alteração real

1. Leia configuração e audiência atuais no Sites; preserve a audiência salvo pedido explícito do proprietário.
2. Obtenha acesso à origem do mesmo projeto e abra um checkout atualizado pelo fluxo suportado. Credenciais são temporárias: nunca as grave no repositório, em documentação, URLs ou histórico.
3. Copie os arquivos revisados sem substituir `.git`; preserve identidade e campos existentes de `.openai/hosting.json`.
4. Verifique, construa, faça commit/push da origem e empacote o mesmo estado pelo fluxo Sites. O SHA de publicação deve existir nessa origem, não apenas no GitHub.
5. Salve e publique no projeto existente com a operação adequada à audiência. Acompanhe a implantação até estado terminal; só registre sucesso após `succeeded`.
6. Registre número, SHA da origem, ID da implantação, data/hora com fuso e URL retornada. Sincronize a cópia GitHub e a documentação.

Um push GitHub não executa essas etapas. Não há pipeline automático declarado. Uma atualização exclusivamente documental não exige republicar uma página idêntica.

## Recuperar uma versão

**Sites:** consulte as versões atuais e selecione a desejada. Leia seus metadados e use seu ID exato no mesmo projeto; v28/v27 estão em `docs/releases/v28.json`. Publique a versão salva com a audiência vigente, aguarde o resultado final e registre a operação. Um rollback não altera automaticamente o GitHub.

**GitHub:** use `git log` para encontrar o snapshot. Inspecione sem alterar `main`:

```sh
git worktree add ../eeco-inspecao COMMIT_CONFIRMADO
```

Substitua `COMMIT_CONFIRMADO` por um SHA real. Para desfazer uma alteração, prefira `git revert SHA_DO_COMMIT` em um branch e revise o resultado. Não use force push em `main`. Antes de publicar a restauração, construa, verifique e siga o fluxo Sites.

## Integridade da referência v28

```sh
python3 scripts/verify_release.py
sha256sum -c docs/releases/v28-sha256.txt
```

O manifesto cobre fontes, builder, configuração e distribuição. Documentos e o próprio manifesto ficam fora para evitar autorreferência. Para uma nova versão use `python3 scripts/verify_release.py --write-manifest docs/releases/vNN-sha256.txt`, substituindo `NN` pelo número real; preserve o manifesto anterior.

## Pontos de retomada

- Verificar separadamente `eeco.abdelhayalm.com`; esta atualização confirma a publicação no Sites.
- O formulário encaminha ao WhatsApp e não agenda reuniões nem envia mensagens automaticamente.
- Confirmar a instalação do APK no telefone de Hapi com o próprio usuário. Build e assinatura pertencem ao [Recycla-App](https://github.com/abdelhayalm/Recycla-App/tree/main/releases/v0.5.0); não gere outra chave para atualizar uma instalação existente.
- Repetir a revisão visual no navegador quando houver mudança visual. Hashes e checks estruturais não a substituem.
