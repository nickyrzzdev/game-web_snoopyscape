import * as ex from 'excalibur'
import { getInputDirection } from '../input/playerInput'
import { PLAYER_SPEED } from '../config/constants'
import { Pistol } from '../weapons/Pistol'
import { Enemy } from './Enemy'
import {
  createSnoopyAnimations,
  SNOOPY_COLLIDER,
  SNOOPY_GRAPHIC_OFFSET_Y,
} from '../assets/sprites'
import type { SnoopyAnimations } from '../assets/sprites'
import { PLAYER_MAX_HEALTH } from '../config/constants'

export class Player extends ex.Actor {
  private readonly pistol = new Pistol()
  private isLeftMouseDown = false
  private animations!: SnoopyAnimations
  private invulnerabilityMs = 0
  private hurtMs = 0
  private blinkMs = 0
  private isVisible = true
  lives = PLAYER_MAX_HEALTH

  constructor(
    x: number,
    y: number,
    private readonly onLivesChanged?: (lives: number) => void,
  ) {
    super({
      x,
      y,
      width: SNOOPY_COLLIDER.width,
      height: SNOOPY_COLLIDER.height,
      collisionType: ex.CollisionType.Active,
      collisionGroup: ex.CollisionGroupManager.groupByName('player')
    })
  }

  override onInitialize(): void {
    this.animations = createSnoopyAnimations()
    this.graphics.use(this.animations.idle)
    this.graphics.offset = ex.vec(0, SNOOPY_GRAPHIC_OFFSET_Y)
    this.on('collisionstart', (event) => {
      if (event.other instanceof Enemy) {
        this.takeDamage()
      }
    })
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {
    if (this.invulnerabilityMs > 0) {
      this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - elapsed)
      this.hurtMs = Math.max(0, this.hurtMs - elapsed)
      this.blinkMs += elapsed

      if (this.blinkMs >= 100) {
        this.blinkMs = 0
        this.isVisible = !this.isVisible
        this.graphics.opacity = this.isVisible ? 1 : 0.25
      }

      if (this.invulnerabilityMs === 0) {
        this.graphics.opacity = 1
        this.isVisible = true
      }
    }

    // Lê os controles a cada atualização e aplica a velocidade do jogador.
    const direction = getInputDirection(engine)
    this.vel = direction.scale(PLAYER_SPEED)
    const animation = direction.size > 0 ? this.animations.walk : this.animations.idle
    if (this.hurtMs > 0) {
      if (this.graphics.current !== this.animations.hurt) {
        this.animations.hurt.reset()
        this.graphics.use(this.animations.hurt)
      }
    } else if (this.graphics.current !== animation) {
      this.graphics.use(animation)
    }

    const aimDirection = engine.input.pointers.primary.lastWorldPos.sub(this.pos)
    const facingX = aimDirection.size > 0 ? aimDirection.x : direction.x
    if (facingX !== 0) {
      this.graphics.flipHorizontal = facingX < 0
    }

    this.handleShooting(engine)
  }

  takeDamage(): void {
    if (this.invulnerabilityMs > 0 || this.lives <= 0) {
      return
    }

    this.lives -= 1
    this.onLivesChanged?.(this.lives)
    this.invulnerabilityMs = 1500
    this.hurtMs = 350
    this.blinkMs = 0
    this.isVisible = false
    this.graphics.opacity = 0.25

    if (this.lives === 0) {
      this.scene?.engine.goToScene('gameover')
    }
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
