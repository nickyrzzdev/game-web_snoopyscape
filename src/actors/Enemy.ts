import { Actor, CollisionType, Engine, Vector, vec } from 'excalibur';
import { ENEMY_COLLIDER, ENEMY_GRAPHIC_OFFSET_Y, createEnemySprites, enemyViewFor } from '../assets/sprites';
import type { EnemySprites } from '../assets/sprites';
import { EnemyBullet } from './EnemyBullet';
import { createFireState, stepEnemyFire } from '../systems/enemyFire';
import type { Difficulty, Room } from '../world/RoomGenerator';

export interface EnemyOptions {
  pos: Vector;
  type: string;           // 'lobo_escuro' | 'lobo_verde' | ... (enemySpawns[].type)
  target: Actor;          // jogador
  room: Room;
  difficulty: Difficulty; // room.difficulty
  onPlayerHit?: () => void; // chamado quando um tiro deste inimigo acerta o jogador
}

const ENEMY_HEALTH: Record<string, number> = {
  lobo_escuro: 1,
  lobo_verde: 2,
  lobo_marrom: 3,
  tubarao_cinza: 2,
  tubarao_azul: 3,
  tubarao_verde: 4,
}

/**
 * Inimigo com sprite por direção e tiro estilo Berzerk.
 * Pode substituir o Robot.ts ou o Robot.ts pode passar a estender esta classe — o Copilot decide
 * olhando como a GameScene instancia os inimigos (manter os exports que ela usa).
 */
export class Enemy extends Actor {
  private sprites!: EnemySprites;
  private fire = createFireState();
  private bullets = new Set<EnemyBullet>();
  health: number;

  constructor(private readonly o: EnemyOptions) {
    super({
      pos: o.pos.clone(),
      width: ENEMY_COLLIDER.width,
      height: ENEMY_COLLIDER.height,
      collisionType: CollisionType.Active,
    });
    this.health = (ENEMY_HEALTH[o.type] ?? 1) + Math.floor((o.room.level - 1) / 4)
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
    // 1) perseguir o jogador (simples; o Erick pode trocar pela IA de perseguição dele)
    const toPlayer = this.o.target.pos.sub(this.pos);
    const dir = toPlayer.size > 1 ? toPlayer.normalize() : Vector.Zero;
    this.vel = dir.scale(this.o.difficulty.enemySpeed);

    // 2) sprite pela direção do movimento
    const { view, flip } = enemyViewFor(dir.x, dir.y);
    this.graphics.use(this.sprites[view]);
    this.graphics.flipHorizontal = flip;

    // 3) atirar (só alinhado nas 8 direções, com linha de visão e limite de tiros ativos)
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
