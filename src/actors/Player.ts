import * as ex from 'excalibur'
import { getInputDirection } from '../input/playerInput'
import {
  PLAYER_BLINK_INTERVAL_MS,
  PLAYER_HURT_MS,
  PLAYER_INVULNERABILITY_MS,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
} from '../config/constants'
import { Pistol } from '../weapons/Pistol'
import { Enemy } from './Enemy'
import {
  createSnoopyAnimations,
  SNOOPY_COLLIDER,
  SNOOPY_GRAPHIC_OFFSET_Y,
} from '../assets/sprites'
import type { SnoopyAnimations } from '../assets/sprites'

type PlayerState = 'idle' | 'walk' | 'hurt' | 'dead'

export class Player extends ex.Actor {
  private readonly pistol = new Pistol()
  private isLeftMouseDown = false
  private animations!: SnoopyAnimations
  private state: PlayerState = 'idle'
  private stateElapsed = 0
  private blinkElapsed = 0
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
    this.animations.idle.reset()
    this.animations.walk.reset()
    this.animations.hurt.reset()
    this.graphics.use(this.animations.idle)
    this.graphics.offset = ex.vec(0, SNOOPY_GRAPHIC_OFFSET_Y)
    this.on('collisionstart', (event) => {
      if (event.other instanceof Enemy) {
        this.takeDamage()
      }
    })
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {
    switch (this.state) {
      case 'idle':
      case 'walk': {
        const direction = this.updateMovement(engine)
        this.setState(direction.size > 0 ? 'walk' : 'idle')
        this.handleShooting(engine)
        break
      }
      case 'hurt': {
        const direction = this.updateMovement(engine)
        this.stateElapsed += elapsed
        this.blinkElapsed += elapsed
        if (this.blinkElapsed >= PLAYER_BLINK_INTERVAL_MS) {
          this.blinkElapsed = 0
          this.graphics.opacity = this.graphics.opacity === 1 ? 0.25 : 1
        }

        if (this.stateElapsed >= PLAYER_HURT_MS) {
          this.useMovementAnimation(direction)
        }
        if (this.stateElapsed >= PLAYER_INVULNERABILITY_MS) {
          this.graphics.opacity = 1
          this.setState(direction.size > 0 ? 'walk' : 'idle')
        }
        this.handleShooting(engine)
        break
      }
      case 'dead':
        this.vel = ex.Vector.Zero
        break
    }
  }

  private updateMovement(engine: ex.Engine): ex.Vector {
    const direction = getInputDirection(engine)
    this.vel = direction.scale(PLAYER_SPEED)
    const pointer = engine.input.pointers.primary.lastWorldPos
    const facingX = pointer.x !== this.pos.x || pointer.y !== this.pos.y
      ? pointer.x - this.pos.x
      : direction.x
    if (facingX !== 0) {
      this.graphics.flipHorizontal = facingX < 0
    }
    return direction
  }

  private useMovementAnimation(direction: ex.Vector): void {
    const animation = direction.size > 0 ? this.animations.walk : this.animations.idle
    if (this.graphics.current !== animation) {
      this.graphics.use(animation)
    }
  }

  private setState(state: PlayerState): void {
    if (this.state === state) {
      return
    }

    this.state = state
    switch (state) {
      case 'idle':
        if (this.graphics.current !== this.animations.idle) {
          this.graphics.use(this.animations.idle)
        }
        break
      case 'walk':
        if (this.graphics.current !== this.animations.walk) {
          this.graphics.use(this.animations.walk)
        }
        break
      case 'hurt':
        this.stateElapsed = 0
        this.blinkElapsed = 0
        this.animations.hurt.reset()
        this.graphics.use(this.animations.hurt)
        this.graphics.opacity = 0.25
        break
      case 'dead':
        this.vel = ex.Vector.Zero
        this.scene?.engine.goToScene('gameover')
        break
    }
  }

  takeDamage(): void {
    if (this.state === 'hurt' || this.state === 'dead') {
      return
    }

    this.lives -= 1
    this.onLivesChanged?.(this.lives)
    this.setState(this.lives === 0 ? 'dead' : 'hurt')
  }

  private handleShooting(engine: ex.Engine): void {
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
      const targetPos = engine.screen.screenToWorldCoordinates(
        pointers.primary.lastScreenPos.clone(),
      )
      this.pistol.tryShoot(
        engine.currentScene,
        this.pos,
        targetPos,
      )
    }
  }
}
