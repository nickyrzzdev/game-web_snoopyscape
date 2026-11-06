import * as ex from 'excalibur'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants'

export class GameOverScene extends ex.Scene {
  override onInitialize(): void {
    this.add(
      new ex.Label({
        text: 'Game Over',
        pos: ex.vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30),
        color: ex.Color.White,
        font: new ex.Font({
          size: 48,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )

    this.add(
      new ex.Label({
        text: 'Clique ou aperte uma tecla para reiniciar',
        pos: ex.vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40),
        color: ex.Color.fromHex('#cbd5e1'),
        font: new ex.Font({
          size: 20,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )

    this.input.pointers.primary.on('down', () => this.engine.goToScene('game'))
    this.input.keyboard.on('press', () => this.engine.goToScene('game'))
  }
}
