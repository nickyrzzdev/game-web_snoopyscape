import { Actor, CollisionType, Engine, Vector, vec } from 'excalibur';
import { ENEMY_COLLIDER, ENEMY_GRAPHIC_OFFSET_Y, createEnemySprites, enemyViewFor } from '../assets/sprites';
import type { EnemySprites } from '../assets/sprites';
import { EnemyBullet } from './EnemyBullet';
import { createFireState, stepEnemyFire } from '../systems/enemyFire';
import type { Difficulty, Room } from '../world/RoomGenerator';

export interface EnemyOptions {
  pos: Vector;
  type: string;
  target: Actor;
  room: Room;
  difficulty: Difficulty;
  onPlayerHit?: () => void;
}

const ENEMY_HEALTH: Record<string, number> = {
  lobo_escuro: 1,
  lobo_verde: 2,
  lobo_marrom: 3,
  tubarao_cinza: 2,
  tubarao_azul: 3,
  tubarao_verde: 4,
}

export class Enemy extends Actor {
  private sprites!: EnemySprites;
  private fire = createFireState();
  private bullets = new Set<EnemyBullet>();
  health: number;
  readonly scoreValue: number;

  constructor(private readonly o: EnemyOptions) {
    super({
      pos: o.pos.clone(),
      width: ENEMY_COLLIDER.width,
      height: ENEMY_COLLIDER.height,
      collisionType: CollisionType.Active,
    });
    this.health = (ENEMY_HEALTH[o.type] ?? 1) + Math.floor((o.room.level - 1) / 4)
    this.scoreValue = this.health * 10
  }

  override onInitialize(): void {
    this.sprites = createEnemySprites(this.o.type);
    this.graphics.use(this.sprites.down);
    this.graphics.offset = vec(0, ENEMY_GRAPHIC_OFFSET_Y);
    this.on('kill', () => {
      for (const bullet of this.bullets) {
        bullet.kill()
      }
    })
  }

  override onPreUpdate(_engine: Engine, delta: number): void {
    const dx = this.o.target.pos.x - this.pos.x
    const dy = this.o.target.pos.y - this.pos.y
    const distance = Math.hypot(dx, dy)
    const speed = distance > 1 ? this.o.difficulty.enemySpeed / distance : 0
    this.vel.setTo(dx * speed, dy * speed)

    const { view, flip } = enemyViewFor(dx, dy)
    const sprite = this.sprites[view]
    if (this.graphics.current !== sprite) this.graphics.use(sprite)
    this.graphics.flipHorizontal = flip

    const shot = stepEnemyFire(this.fire, {
      dtMs: delta,
      enemyPos: this.pos,
      playerPos: this.o.target.pos,
      difficulty: this.o.difficulty,
      room: this.o.room,
      activeEnemyBullets: this.bullets.size,
    });
    if (shot && this.scene) {
      const b = new EnemyBullet({
        pos: this.pos.clone(),
        dir: shot,
        speed: this.o.difficulty.enemyBulletSpeed,
        target: this.o.target,
        room: this.o.room,
        onHitPlayer: () => this.o.onPlayerHit?.(),
      });
      this.bullets.add(b);
      b.on('kill', () => this.bullets.delete(b));
      this.scene.add(b);
    }
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage)
    if (this.health === 0) {
      this.kill()
    }
  }
}
