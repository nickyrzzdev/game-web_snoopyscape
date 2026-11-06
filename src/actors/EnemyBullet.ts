import { Actor, CollisionType, Engine, Vector } from 'excalibur';
import { createEnemyBulletSprite } from '../assets/sprites';
import type { Room } from '../world/RoomGenerator';

export interface EnemyBulletOptions {
  pos: Vector;
  dir: { x: number; y: number }; // unitária
  speed: number;                 // px/s (difficulty.enemyBulletSpeed)
  target: Actor;                 // jogador
  room?: Room;                   // se informado, o tiro some ao bater em parede do grid
  hitRadius?: number;            // raio de acerto no jogador (padrão 10px)
  onHitPlayer?: (bullet: EnemyBullet) => void; // ex.: player.takeDamage(1)
}

/**
 * Tiro inimigo. Faz a checagem de parede (grid da sala) e de acerto no jogador "na mão",
 * para não depender do sistema de colisão do projeto. Se o projeto já tem colisão/dano
 * padronizados, o Copilot pode trocar por collider + onCollisionStart.
 */
export class EnemyBullet extends Actor {
  private ageMs = 0;
  constructor(private readonly opts: EnemyBulletOptions) {
    super({ pos: opts.pos.clone(), width: 8, height: 8, collisionType: CollisionType.PreventCollision, z: 5 });
  }
  onInitialize(): void {
    this.graphics.use(createEnemyBulletSprite());
    this.vel = new Vector(this.opts.dir.x, this.opts.dir.y).scale(this.opts.speed);
  }
  onPreUpdate(_engine: Engine, delta: number): void {
    this.ageMs += delta;
    if (this.ageMs > 4000) { this.kill(); return; } // segurança contra tiros "perdidos"
    const room = this.opts.room;
    if (room) {
      const col = Math.floor(this.pos.x / room.tileSize), row = Math.floor(this.pos.y / room.tileSize);
      if (room.walls[row]?.[col] ?? true) { this.kill(); return; } // parede ou fora da sala
    }
    if (this.pos.distance(this.opts.target.pos) < (this.opts.hitRadius ?? 10)) {
      this.opts.onHitPlayer?.(this);
      this.kill();
    }
  }
}
