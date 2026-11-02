import * as ex from 'excalibur'
import { BULLET_LIFETIME_MS, BULLET_SPEED } from '../config/constants'
import { playerBullet } from '../config/collisionGroups'

export class Bullet extends ex.Actor {
  damage = 1
  private age = 0

  constructor(origin: ex.Vector, direction: ex.Vector) {
    super({
      pos: origin,
      radius: 4,
      color: ex.Color.Yellow,
      vel: direction.scale(BULLET_SPEED),
      collisionType: ex.CollisionType.Passive,
      collisionGroup: playerBullet,
    })
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {
    this.age += elapsed

    if (
      this.age >= BULLET_LIFETIME_MS ||
      !engine.screen.getWorldBounds().contains(this.pos)
    ) {
      this.kill()
    }
  }
}
