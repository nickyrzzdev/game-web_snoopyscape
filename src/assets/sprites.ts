// Sprites do Triggerhell (Snoopy, lobisomens, homens-tubarão, projéteis e tiles).
// NÃO substitui o src/assets/resources.ts: adicione `allSpriteImages` ao Loader existente
// (ex.: `loader.addResources(allSpriteImages)`) e só chame as funções create*() DEPOIS do carregamento.
import { Animation, AnimationStrategy, ImageSource, Sprite, SpriteSheet } from 'excalibur';

// BASE_URL é obrigatório: o deploy no GitHub Pages roda em /<repo>/, não em /
const url = (p: string) => `${import.meta.env.BASE_URL}assets/${p}`;

export const spriteImages = {
  snoopy: new ImageSource(url('sprites/snoopy.png')),           // 18 quadros 32x40 em tira
  werewolves: new ImageSource(url('sprites/werewolves.png')),   // 9 quadros 32x48 (3 variantes x 3 vistas)
  sharkmen: new ImageSource(url('sprites/sharkmen.png')),       // 9 quadros 32x48 (3 variantes x 3 vistas)
  bone: new ImageSource(url('sprites/bone.png')),               // 16x8, aponta para a direita
  enemyBullet: new ImageSource(url('sprites/enemy_bullet.png')),// 12x12
  floor: new ImageSource(url('tiles/floor.png')),               // 8 tiles 32x32 em tira
  wall: new ImageSource(url('tiles/wall.png')),                 // 32x32
  torch1: new ImageSource(url('tiles/torch_1.png')),
  torch2: new ImageSource(url('tiles/torch_2.png')),
  torch3: new ImageSource(url('tiles/torch_3.png')),
  torch4: new ImageSource(url('tiles/torch_4.png')),
};
export const allSpriteImages: ImageSource[] = Object.values(spriteImages);

// ---------- Snoopy (vista lateral, olha para a DIREITA; espelhe com graphics.flipHorizontal) ----------
export const SNOOPY_CELL = { width: 32, height: 40 };
export const SNOOPY_COLLIDER = { width: 18, height: 26 }; // caixa de colisão sugerida (pés alinhados embaixo)
/** Offset do gráfico para alinhar os pés do sprite com a base do collider: actor.graphics.offset = vec(0, SNOOPY_GRAPHIC_OFFSET_Y) */
export const SNOOPY_GRAPHIC_OFFSET_Y = -(SNOOPY_CELL.height - SNOOPY_COLLIDER.height) / 2;

export const SNOOPY_FRAMES = {
  idle: [0, 1, 2, 3],
  walk: [4, 5, 6, 7, 8, 9],
  jump: [10, 11],
  kick: [12, 13, 14],
  hurt: [15, 16],
  sleep: [17],
} as const;

export interface SnoopyAnimations {
  idle: Animation; walk: Animation; hurt: Animation; kick: Animation; jump: Animation; sleep: Animation;
}
export function createSnoopyAnimations(): SnoopyAnimations {
  const sheet = SpriteSheet.fromImageSource({
    image: spriteImages.snoopy,
    grid: { rows: 1, columns: 18, spriteWidth: SNOOPY_CELL.width, spriteHeight: SNOOPY_CELL.height },
  });
  const mk = (f: readonly number[], ms: number, s = AnimationStrategy.Loop) =>
    Animation.fromSpriteSheet(sheet, [...f], ms, s);
  return {
    idle: mk(SNOOPY_FRAMES.idle, 400),
    walk: mk(SNOOPY_FRAMES.walk, 90),
    hurt: mk(SNOOPY_FRAMES.hurt, 120, AnimationStrategy.End),
    kick: mk(SNOOPY_FRAMES.kick, 90, AnimationStrategy.End),
    jump: mk(SNOOPY_FRAMES.jump, 120, AnimationStrategy.End),
    sleep: mk(SNOOPY_FRAMES.sleep, 1000),
  };
}

// ---------- Inimigos: cada variante tem 3 VISTAS (não é ciclo de caminhada) ----------
// quadro 0 = costas (indo para cima), 1 = frente (indo para baixo), 2 = lado (olha para a ESQUERDA)
export const ENEMY_CELL = { width: 32, height: 48 };
export const ENEMY_COLLIDER = { width: 20, height: 30 };
export const ENEMY_GRAPHIC_OFFSET_Y = -(ENEMY_CELL.height - ENEMY_COLLIDER.height) / 2;

// chaves = `type` devolvido por generateRoom().enemySpawns[].type
export const ENEMY_VARIANTS: Record<string, { sheet: 'werewolves' | 'sharkmen'; variant: number }> = {
  lobo_escuro: { sheet: 'werewolves', variant: 0 },
  lobo_verde: { sheet: 'werewolves', variant: 1 },
  lobo_marrom: { sheet: 'werewolves', variant: 2 },
  tubarao_cinza: { sheet: 'sharkmen', variant: 0 },
  tubarao_azul: { sheet: 'sharkmen', variant: 1 },
  tubarao_verde: { sheet: 'sharkmen', variant: 2 },
};
export type EnemyView = 'up' | 'down' | 'side';
export interface EnemySprites { up: Sprite; down: Sprite; side: Sprite }

export function createEnemySprites(type: string): EnemySprites {
  const def = ENEMY_VARIANTS[type] ?? ENEMY_VARIANTS.lobo_escuro;
  const sheet = SpriteSheet.fromImageSource({
    image: spriteImages[def.sheet],
    grid: { rows: 1, columns: 9, spriteWidth: ENEMY_CELL.width, spriteHeight: ENEMY_CELL.height },
  });
  const i = def.variant * 3;
  return { up: sheet.getSprite(i, 0)!, down: sheet.getSprite(i + 1, 0)!, side: sheet.getSprite(i + 2, 0)! };
}

/** Escolhe a vista pela direção do movimento. `flip` = true quando o sprite de lado precisa ser espelhado (indo para a direita). */
export function enemyViewFor(dx: number, dy: number): { view: EnemyView; flip: boolean } {
  if (Math.abs(dx) > Math.abs(dy)) return { view: 'side', flip: dx > 0 };
  return { view: dy < 0 ? 'up' : 'down', flip: false };
}

// ---------- Tiles ----------
export const TILE = 32;
export const FLOOR_TILE_COUNT = 8;
export function createFloorSprites(): Sprite[] {
  const sheet = SpriteSheet.fromImageSource({
    image: spriteImages.floor,
    grid: { rows: 1, columns: FLOOR_TILE_COUNT, spriteWidth: TILE, spriteHeight: TILE },
  });
  return Array.from({ length: FLOOR_TILE_COUNT }, (_, c) => sheet.getSprite(c, 0)!);
}
export const createWallSprite = (): Sprite => spriteImages.wall.toSprite();
export const createBoneSprite = (): Sprite =>
  spriteImages.bone.toSprite({ destSize: { width: 16, height: 8 } });
export const createEnemyBulletSprite = (): Sprite => spriteImages.enemyBullet.toSprite();

export function createTorchAnimation(): Animation {
  const frames = [spriteImages.torch1, spriteImages.torch2, spriteImages.torch3, spriteImages.torch4]
  return new Animation({
    frames: frames.map((image) => ({
      graphic: image.toSprite({ destSize: { width: 16, height: 16 } }),
    })),
    frameDuration: 120,
    strategy: AnimationStrategy.Loop,
  })
}
