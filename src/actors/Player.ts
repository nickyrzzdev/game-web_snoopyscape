import * as ex from 'excalibur'
import { getInputDirection } from '../input/playerInput'
import { PLAYER_SPEED } from '../config/constants'

export class Player extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      x,
      y,
      width: 32,
      height: 32,
      color: ex.Color.Cyan,
    })
  }

  override onPreUpdate(engine: ex.Engine, _elapsed: number): void {
    // Lê os controles a cada atualização e aplica a velocidade do jogador.
    this.vel = getInputDirection(engine).scale(PLAYER_SPEED)
  }
}
