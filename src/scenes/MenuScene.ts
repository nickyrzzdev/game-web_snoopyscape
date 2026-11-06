import * as ex from 'excalibur'
import {
  createFloorSprites,
  createSnoopyAnimations,
  createTorchAnimation,
  createWallSprite,
} from '../assets/sprites'
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config/constants'

export class MenuScene extends ex.Scene {
  private prompt?: ex.Label
  private blinkElapsed = 0

  override onInitialize(): void {
    const columns = GAME_WIDTH / TILE_SIZE
    const rows = GAME_HEIGHT / TILE_SIZE
    const floors = createFloorSprites()
    const background = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      columns,
      rows,
    })
    background.z = -10

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const tile = background.tiles[row * columns + col]
        const isWall = row === 0 || row === rows - 1 || col === 0 || col === columns - 1
        if (isWall) {
          tile.addGraphic(createWallSprite())
          if ((row === 0 || row === rows - 1) && col % 5 === 2) {
            tile.addGraphic(createTorchAnimation(), { offset: ex.vec(8, 8) })
          }
        } else {
          tile.addGraphic(floors[(row * 3 + col * 5) % floors.length])
        }
      }
    }
    this.add(background)

    this.add(
      new ex.Label({
        text: 'SnoopyScape',
        pos: ex.vec(GAME_WIDTH / 2, 112),
        color: ex.Color.fromHex('#ff6b35'),
        font: new ex.Font({
          size: 60,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
          shadow: { color: ex.Color.Black, offset: ex.vec(3, 4), blur: 2 },
        }),
      }),
    )

    const snoopy = new ex.Actor({ pos: ex.vec(GAME_WIDTH / 2, 196), z: 1 })
    snoopy.graphics.use(createSnoopyAnimations().idle)
    this.add(snoopy)

    this.prompt = new ex.Label({
      text: 'Clique ou aperte uma tecla para começar',
      pos: ex.vec(GAME_WIDTH / 2, 276),
      color: ex.Color.fromHex('#f8fafc'),
      font: new ex.Font({
        size: 20,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Middle,
        shadow: { color: ex.Color.Black, offset: ex.vec(2, 2), blur: 1 },
      }),
    })
    this.add(this.prompt)
    this.add(
      new ex.Label({
        text: 'Mover: WASD / setas    Atirar: botão esquerdo do mouse',
        pos: ex.vec(GAME_WIDTH / 2, 328),
        color: ex.Color.fromHex('#cbd5e1'),
        font: new ex.Font({
          size: 14,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )

    this.input.pointers.primary.on('down', () => this.engine.goToScene('game'))
    this.input.keyboard.on('press', () => this.engine.goToScene('game'))
  }

  override onPostUpdate(_engine: ex.Engine, elapsed: number): void {
    this.blinkElapsed += elapsed
    if (this.blinkElapsed >= 600) {
      this.blinkElapsed = 0
      if (this.prompt) {
        this.prompt.opacity = this.prompt.opacity === 1 ? 0.35 : 1
      }
    }
  }
}
