import * as ex from 'excalibur'
import { getInputDirection } from '../input/playerInput'
import { PLAYER_SPEED } from '../config/constants'
import { Pistol } from '../weapons/Pistol'

export class Player extends ex.Actor {
  private readonly pistol = new Pistol()
  private isLeftMouseDown = false

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
    this.handleShooting(engine)
  }

  handleShooting(engine: ex.Engine): void {
    const pointers = engine.input.pointers
    const leftMousePressed = pointers.currentFrameDown.some(
      (event) =>
        event.pointerType === ex.PointerType.Mouse &&
        event.button === ex.PointerButton.Left,
    )
    const leftMouseReleased = pointers.currentFrameUp.some(
      (event) =>
        event.pointerType === ex.PointerType.Mouse &&
        event.button === ex.PointerButton.Left,
    )

    if (leftMousePressed) {
      this.isLeftMouseDown = true
    }

    if (leftMouseReleased) {
      this.isLeftMouseDown = false
    }

    if (leftMousePressed || this.isLeftMouseDown) {
      this.pistol.tryShoot(
        engine.currentScene,
        this.pos,
        pointers.primary.lastWorldPos,
      )
    }
  }
}
