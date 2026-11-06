import { Actor, CollisionType, Engine, Vector } from 'excalibur';
import { createEnemyBulletSprite } from '../assets/sprites';
import type { Room } from '../world/RoomGenerator';

export interface EnemyBulletOptions {
  pos: Vector;
  dir: { x: number; y: number };
  speed: number;
  target: Actor;
  room?: Room;
  hitRadius?: number;
  onHitPlayer?: (bullet: EnemyBullet) => void;
}

export class EnemyBullet extends Actor {
  private ageMs = 0;

  constructor(private readonly opts: EnemyBulletOptions) {
    super({
      pos: opts.pos.clone(),
      width: 8,
      height: 8,
      collisionType: CollisionType.PreventCollision,
      z: 5,
    });
  }

  override onInitialize(): void {
    this.graphics.use(createEnemyBulletSprite());
    this.vel = new Vector(this.opts.dir.x, this.opts.dir.y).scale(this.opts.speed);
  }

  override onPreUpdate(_engine: Engine, delta: number): void {
    this.ageMs += delta;
    if (this.ageMs > 4000) {
      this.kill();
      return;
    }

    const room = this.opts.room;
    if (room) {
      const col = Math.floor(this.pos.x / room.tileSize);
      const row = Math.floor(this.pos.y / room.tileSize);
      if (room.walls[row]?.[col] ?? true) {
        this.kill();
        return;
      }
    }

    if (this.pos.distance(this.opts.target.pos) < (this.opts.hitRadius ?? 10)) {
      this.opts.onHitPlayer?.(this);
      this.kill();
    }
  }
}
