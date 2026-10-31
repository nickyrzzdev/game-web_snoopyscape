import * as ex from 'excalibur'

export class MenuScene extends ex.Scene {
  override onInitialize(): void {
    this.add(
      new ex.Label({
        text: 'TriggerHell',
        pos: ex.vec(480, 220),
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
        pos: ex.vec(480, 300),
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
