# Instruções do repositório — Triggerhell

Jogo 2D estilo **Berzerk** (salas-labirinto infinitas, inimigos que atiram) feito com **Excalibur.js 0.32.0 + TypeScript + Vite**, publicado no **GitHub Pages**.
Trabalho acadêmico (UEA). Responda e comente o código em **português**.

## Regras de fluxo
- Nunca commitar direto na `main`: criar branch, commits pequenos e abrir Pull Request.
- Antes de concluir qualquer tarefa rode `npm run build` (precisa passar sem erros de TypeScript).
- Não apagar nem reescrever o histórico do Git; não mexer no `package-lock.json` sem necessidade.

## Arquitetura (não quebrar)
- `src/actors/` Player, Bullet (osso do Snoopy), Robot, Enemy, EnemyBullet
- `src/assets/resources.ts` Loader/recursos já existentes · `src/assets/sprites.ts` sprites novos (adicionar ao mesmo Loader)
- `src/world/RoomGenerator.ts` gera salas (dados puros, sem Excalibur) · `src/world/buildRoom.ts` monta chão/paredes
- `src/systems/enemyFire.ts` lógica pura de tiro dos inimigos · `src/scenes/` GameScene, MenuScene
- Mantenha os **exports e nomes** que `GameScene.ts` já usa; ao refatorar, atualize os imports.

## Arte e sprites
- Pixel art, **tile = 32px**. Nunca suavizar: `pixelArt: true` no `Engine` (ou `antialiasing: false`).
- Assets ficam em `public/assets/...`; no código use **sempre** `import.meta.env.BASE_URL` (o Pages serve em `/<repo>/`). Nunca caminho absoluto começando em `/assets`.
- Snoopy: sprite lateral que olha para a **direita**; para a esquerda use `graphics.flipHorizontal = true`.
- Inimigos têm 3 vistas por variante (costas, frente, lado-esquerda), **não** ciclo de caminhada: escolher pela direção do movimento (`enemyViewFor`).
- O osso do jogador (`bone.png`) aponta para a direita: use `rotation = vel.toAngle()`.
- Detalhes dos quadros e tamanhos: `docs/INTEGRACAO_SPRITES.md`.

## Mecânica
- Inimigos só atiram nas **8 direções**, com linha de visão e limite de tiros ativos (`stepEnemyFire`). A dificuldade vem de `difficultyFor(level)`.
- Sala nova: `generateRoom({ level, entrySide })`; ao sair por um lado, `nextEntrySide(side)` define o lado de entrada da próxima.
