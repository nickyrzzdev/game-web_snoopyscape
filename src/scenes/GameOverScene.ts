import * as ex from 'excalibur'

export class GameOverScene extends ex.Scene {
  override onInitialize(): void {
    this.add(
      new ex.Label({
        text: 'Game Over',
        pos: ex.vec(480, 270),
        color: ex.Color.White,
        font: new ex.Font({
          size: 48,
          bold: true,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )

    this.input.pointers.primary.on('down', () => this.engine.goToScene('menu'))
  }
}
