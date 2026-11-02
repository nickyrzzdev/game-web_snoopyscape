import * as ex from 'excalibur'
import { Bullet } from '../actors/Bullet'
import { SHOOT_COOLDOWN_MS } from '../config/constants'

export class Pistol {
  private lastShotAt = Number.NEGATIVE_INFINITY

  tryShoot(scene: ex.Scene, origin: ex.Vector, targetPos: ex.Vector): boolean {
    const direction = targetPos.sub(origin)
    if (direction.x === 0 && direction.y === 0) {
      return false
    }

    const now = scene.engine.clock.now()
    if (now - this.lastShotAt < SHOOT_COOLDOWN_MS) {
      return false
    }

    this.lastShotAt = now
    scene.add(new Bullet(origin, direction.normalize()))
    return true
  }
}
