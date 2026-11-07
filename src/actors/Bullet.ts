import * as ex from 'excalibur'
import { BULLET_LIFETIME_MS, BULLET_SPEED } from '../config/constants'
import { playerBullet } from '../config/collisionGroups'
import { Enemy } from './Enemy'
import { createBoneSprite } from '../assets/sprites'

export class Bullet extends ex.Actor {
  damage = 1
  private age = 0

  constructor(origin: ex.Vector, direction: ex.Vector) {
    super({
      pos: origin.clone(),
      radius: 4,
      color: ex.Color.Yellow,
      vel: direction.clone().scale(BULLET_SPEED),
      collisionType: ex.CollisionType.Passive,
      collisionGroup: playerBullet,
    })

    this.rotation = this.vel.toAngle()

    this.on('collisionstart', (event) => {
      const enemy = event.other.owner as Enemy

if (enemy instanceof Enemy) {
  enemy.takeDamage(this.damage)
  this.kill()
}
    })
  }

  override onInitialize(): void {
    this.graphics.use(createBoneSprite())
  }

  override onPreUpdate(
    engine: ex.Engine,
    elapsed: number,
  ): void {
    this.age += elapsed

    if (
      this.age >= BULLET_LIFETIME_MS ||
      !engine.screen.getWorldBounds().contains(this.pos)
    ) {
      this.kill()
    }
  }
}