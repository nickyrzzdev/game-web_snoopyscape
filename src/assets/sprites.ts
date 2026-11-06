import { Animation, AnimationStrategy, ImageSource, Sprite, SpriteSheet } from 'excalibur'
import { TILE_SIZE } from '../config/constants'

// BASE_URL é obrigatório: o deploy no GitHub Pages roda em /<repo>/, não em /
const url = (p: string) => `${import.meta.env.BASE_URL}assets/${p}`

const spriteImages = {
  snoopy: new ImageSource(url('sprites/snoopy.png')),
  werewolves: new ImageSource(url('sprites/werewolves.png')),
  sharkmen: new ImageSource(url('sprites/sharkmen.png')),
  bone: new ImageSource(url('sprites/bone.png')),
  enemyBullet: new ImageSource(url('sprites/enemy_bullet.png')),
  floor: new ImageSource(url('tiles/floor.png')),
  wall: new ImageSource(url('tiles/wall.png')),
  torch1: new ImageSource(url('tiles/torch_1.png')),
  torch2: new ImageSource(url('tiles/torch_2.png')),
  torch3: new ImageSource(url('tiles/torch_3.png')),
  torch4: new ImageSource(url('tiles/torch_4.png')),
}
export const allSpriteImages: ImageSource[] = Object.values(spriteImages)

// Snoopy olha para a direita; use graphics.flipHorizontal para inverter.
export const SNOOPY_CELL = { width: 32, height: 40 }
export const SNOOPY_COLLIDER = { width: 18, height: 26 }
export const SNOOPY_GRAPHIC_OFFSET_Y = -(SNOOPY_CELL.height - SNOOPY_COLLIDER.height) / 2

const SNOOPY_FRAMES = {
  idle: [0, 1, 2, 3],
  walk: [4, 5, 6, 7, 8, 9],
  hurt: [15, 16],
} as const

export interface SnoopyAnimations {
  idle: Animation
  walk: Animation
  hurt: Animation
}
let snoopyAnimations: SnoopyAnimations | undefined

export function createSnoopyAnimations(): SnoopyAnimations {
  if (!snoopyAnimations) {
    const sheet = SpriteSheet.fromImageSource({
      image: spriteImages.snoopy,
      grid: { rows: 1, columns: 18, spriteWidth: SNOOPY_CELL.width, spriteHeight: SNOOPY_CELL.height },
    })
    const make = (frames: readonly number[], duration: number, strategy = AnimationStrategy.Loop) =>
      Animation.fromSpriteSheet(sheet, [...frames], duration, strategy)
    snoopyAnimations = {
      idle: make(SNOOPY_FRAMES.idle, 400),
      walk: make(SNOOPY_FRAMES.walk, 90),
      hurt: make(SNOOPY_FRAMES.hurt, 120, AnimationStrategy.End),
    }
  }
  return snoopyAnimations
}

// Cada variante tem três vistas, não um ciclo de caminhada.
// quadro 0 = costas (indo para cima), 1 = frente (indo para baixo), 2 = lado (olha para a ESQUERDA)
export const ENEMY_CELL = { width: 32, height: 48 }
export const ENEMY_COLLIDER = { width: 20, height: 30 }
export const ENEMY_GRAPHIC_OFFSET_Y = -(ENEMY_CELL.height - ENEMY_COLLIDER.height) / 2

const ENEMY_VARIANTS: Record<string, { sheet: 'werewolves' | 'sharkmen'; variant: number }> = {
  lobo_escuro: { sheet: 'werewolves', variant: 0 },
  lobo_verde: { sheet: 'werewolves', variant: 1 },
  lobo_marrom: { sheet: 'werewolves', variant: 2 },
  tubarao_cinza: { sheet: 'sharkmen', variant: 0 },
  tubarao_azul: { sheet: 'sharkmen', variant: 1 },
  tubarao_verde: { sheet: 'sharkmen', variant: 2 },
}
type EnemyView = 'up' | 'down' | 'side'
export interface EnemySprites { up: Sprite; down: Sprite; side: Sprite }

const enemySpriteCache = new Map<string, EnemySprites>()
let werewolfSheet: SpriteSheet | undefined
let sharkmanSheet: SpriteSheet | undefined
export function createEnemySprites(type: string): EnemySprites {
  const def = ENEMY_VARIANTS[type] ?? ENEMY_VARIANTS.lobo_escuro
  let sprites = enemySpriteCache.get(type)
  if (!sprites) {
    const sheet = def.sheet === 'werewolves'
      ? (werewolfSheet ??= SpriteSheet.fromImageSource({
        image: spriteImages.werewolves,
        grid: { rows: 1, columns: 9, spriteWidth: ENEMY_CELL.width, spriteHeight: ENEMY_CELL.height },
      }))
      : (sharkmanSheet ??= SpriteSheet.fromImageSource({
        image: spriteImages.sharkmen,
        grid: { rows: 1, columns: 9, spriteWidth: ENEMY_CELL.width, spriteHeight: ENEMY_CELL.height },
      }))
    const i = def.variant * 3
    sprites = { up: sheet.getSprite(i, 0)!, down: sheet.getSprite(i + 1, 0)!, side: sheet.getSprite(i + 2, 0)! }
    enemySpriteCache.set(type, sprites)
  }
  return sprites
}

const enemyViews = {
  up: { view: 'up', flip: false },
  down: { view: 'down', flip: false },
  left: { view: 'side', flip: false },
  right: { view: 'side', flip: true },
} as const

export function enemyViewFor(dx: number, dy: number): { view: EnemyView; flip: boolean } {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? enemyViews.right : enemyViews.left
  return dy < 0 ? enemyViews.up : enemyViews.down
}

const FLOOR_TILE_COUNT = 8
let floorSprites: Sprite[] | undefined
export function createFloorSprites(): Sprite[] {
  if (!floorSprites) {
    const sheet = SpriteSheet.fromImageSource({
      image: spriteImages.floor,
      grid: { rows: 1, columns: FLOOR_TILE_COUNT, spriteWidth: TILE_SIZE, spriteHeight: TILE_SIZE },
    })
    floorSprites = Array.from({ length: FLOOR_TILE_COUNT }, (_, col) => sheet.getSprite(col, 0)!)
  }
  return floorSprites
}
let wallSprite: Sprite | undefined
let boneSprite: Sprite | undefined
let enemyBulletSprite: Sprite | undefined
export const createWallSprite = (): Sprite => (wallSprite ??= spriteImages.wall.toSprite())
export const createBoneSprite = (): Sprite =>
  (boneSprite ??= spriteImages.bone.toSprite({ destSize: { width: 16, height: 8 } }))
export const createEnemyBulletSprite = (): Sprite =>
  (enemyBulletSprite ??= spriteImages.enemyBullet.toSprite())

let torchSprites: Sprite[] | undefined
export function createTorchAnimation(): Animation {
  torchSprites ??= [spriteImages.torch1, spriteImages.torch2, spriteImages.torch3, spriteImages.torch4]
    .map((image) => image.toSprite({ destSize: { width: 16, height: 16 } }))
  return new Animation({
    frames: torchSprites.map((graphic) => ({ graphic })),
    frameDuration: 120,
    strategy: AnimationStrategy.Loop,
  })
}
