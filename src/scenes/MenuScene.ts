import * as ex from 'excalibur'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants'

export class MenuScene extends ex.Scene {
  override onInitialize(): void {
    this.add(
      new ex.Label({
        text: 'TriggerHell',
        pos: ex.vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30),
        color: ex.Color.White,
        font: new ex.Font({
          size: 52,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )
    this.add(
      new ex.Label({
        text: 'Clique ou aperte uma tecla para começar',
        pos: ex.vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50),
        color: ex.Color.fromHex('#cbd5e1'),
        font: new ex.Font({
          size: 22,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )

    this.input.pointers.primary.on('down', () => this.engine.goToScene('game'))
    this.input.keyboard.on('press', () => this.engine.goToScene('game'))
  }
}
