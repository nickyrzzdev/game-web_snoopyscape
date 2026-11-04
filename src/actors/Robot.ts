
import * as ex from 'excalibur'
import { Player } from './Player'
import { ROBOT_SPEED } from '../config/constants'

export class Robot extends ex.Actor {

  private player: Player

  constructor(x: number, y: number, player: Player) {
    super({
      x,
      y,
      width: 32,
      height: 32,
      color: ex.Color.Red,
      collisionType: ex.CollisionType.Active,
    })

    this.player = player
  }

  override onPreUpdate(_engine: ex.Engine, _elapsed: number): void {

    // Calcula a direção entre o robô e o jogador
    const direction = this.player.pos.sub(this.pos)

    // Calcula a distância até o jogador
    const distance = direction.magnitude

    // Se estiver perto, o robô para
    if (distance < 30) {
      this.vel = new ex.Vector(0, 0)
      return
    }

    // Normaliza a direção e aplica a velocidade
    this.vel = direction.normalize().scale(ROBOT_SPEED)
  }
}
