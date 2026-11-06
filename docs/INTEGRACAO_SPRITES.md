# Integração dos sprites + tiro dos inimigos (Triggerhell)

Para o **GitHub Copilot** (agent mode) e para o time. Ler junto com `.github/copilot-instructions.md`.

## O que já está pronto neste pacote
| Arquivo | O que é |
|---|---|
| `public/assets/sprites/snoopy.png` | Tira 576×40 = **18 quadros 32×40**: idle 0–3, walk 4–9, jump 10–11, kick 12–14, hurt 15–16, sleep 17 (olha p/ a direita) |
| `public/assets/sprites/snoopy_portrait.png` | Não veio no pacote; o HUD continua usando texto |
| `public/assets/sprites/werewolves.png` | Tira 288×48 = 9 quadros 32×48: variantes `lobo_escuro` (0–2), `lobo_verde` (3–5), `lobo_marrom` (6–8); em cada trio: costas, frente, lado (olha p/ a esquerda) |
| `public/assets/sprites/sharkmen.png` | Igual, para `tubarao_cinza`, `tubarao_azul`, `tubarao_verde` |
| `public/assets/sprites/bone.png` | Imagem-fonte 76×32 do pacote, exibida em 16×8 (aponta p/ a direita) |
| `public/assets/sprites/enemy_bullet.png` | Tiro inimigo 12×12 |
| `public/assets/tiles/floor.png` | 8 tiles de chão 32×32 em tira · `wall.png` parede 32×32 · `torch_1..4.png` tocha animada 16×16 (opcional) |
| `src/assets/sprites.ts` | Carrega as imagens e cria animações/sprites (usa `BASE_URL`) |
| `src/world/RoomGenerator.ts` | Salas Berzerk infinitas: `generateRoom`, `difficultyFor`, `aim8`, `hasLineOfSight`, `nextEntrySide` |
| `src/world/buildRoom.ts` | `buildRoomTileMap(scene, room)`: chão + paredes sólidas |
| `src/systems/enemyFire.ts` | Regra de tiro dos inimigos (pura, testada em `tests/enemyFire.test.ts`) |
| `src/actors/Enemy.ts`, `EnemyBullet.ts` | Inimigo com sprite por direção que atira + projétil inimigo |

> `npm run build` valida os arquivos que importam Excalibur contra a versão 0.32.0 usada pelo projeto.
> A imagem `snoopy_portrait.png` não está incluída; o HUD mantém a exibição textual até esse asset ser fornecido.

## Fase 1 — Sprites (uma branch, um PR)
1. Copiar os arquivos do pacote para a raiz do repositório (as pastas já têm a estrutura certa).
2. Em `src/assets/resources.ts`: `loader.addResources(allSpriteImages)` (importar de `./sprites`). Se o Loader fica no `main.ts`/`GameScene`, adicionar lá.
3. No `Engine`: ativar `pixelArt: true` (resolução do jogo = 20×12 tiles = **640×384**; usar `DisplayMode.FitScreen`).
4. `Player.ts`: após carregar, `const anims = createSnoopyAnimations()`. `idle` parado, `walk` em movimento, `hurt` ao levar dano. Espelhar com `graphics.flipHorizontal` quando a mira/movimento for para a esquerda. Collider `SNOOPY_COLLIDER` e `graphics.offset = vec(0, SNOOPY_GRAPHIC_OFFSET_Y)`.
5. `Bullet.ts`: usar `createBoneSprite()` e `rotation = vel.toAngle()`; collider pequeno (~8×8).
6. `Robot.ts` / `Enemy.ts`: usar `Enemy.ts` (ou fazer `Robot` estender/reutilizar). Vista por direção via `enemyViewFor`.
7. `GameScene.ts`: `const room = generateRoom({ level: 1 })`; `buildRoomTileMap(this, room)`; posicionar o jogador em `room.playerSpawn` (col/row × `room.tileSize` + metade) e criar um `Enemy` para cada item de `room.enemySpawns`.

**Pronto quando:** `npm run build` passa; `npm run dev` mostra Snoopy animado numa sala de catacumba com lobisomens; deploy do Pages carrega as imagens (sem 404 por caminho).

## Fase 2 — Inimigos atirando e níveis infinitos
Implementada: o jogador perde vida ao tocar um inimigo ou ser atingido por um projétil,
fica piscando e invulnerável por 1,5 s, e pode reiniciar após game over. Tiros do jogador
causam dano conforme a variante do inimigo; tiros inimigos não colidem com outros inimigos.
Ao eliminar a sala, as portas abrem e permitem gerar a próxima sala pelo lado oposto,
mantendo as vidas e aumentando nível, inimigos, vida dos inimigos e velocidade/frequência dos tiros.
O HUD mostra vidas, nível e pontuação, e as tochas animadas são opcionais no mapa.

**Pendente:** confirmar e registrar autor/licença do pacote Scary Mobs em `public/assets/CREDITS.md`.

## Ajustes de balanceamento
Tudo em `difficultyFor(level)` no `RoomGenerator.ts`: `enemyCount`, `enemyFireCooldownMs`, `enemyBulletSpeed`, `enemySpeed`, `wallDensity`, tipos liberados por nível. Limite de tiros inimigos simultâneos: `maxEnemyBullets` em `enemyFire.ts` (padrão 4).

## Prompts prontos para o Copilot Chat (modo agent)
- Fase 1: *"Siga docs/INTEGRACAO_SPRITES.md, Fase 1. Crie uma branch `feat/sprites`, integre os sprites, rode `npm run build` e corrija os erros de TypeScript."*
- Fase 2: *"Siga docs/INTEGRACAO_SPRITES.md, Fase 2. Crie uma branch `feat/tiro-inimigos`, ligue Enemy/EnemyBullet na GameScene, implemente dano no jogador e troca de sala infinita."*

(No VS Code também existem como prompts: `.github/prompts/integrar-sprites.prompt.md` e `integrar-tiros-inimigos.prompt.md`.)
