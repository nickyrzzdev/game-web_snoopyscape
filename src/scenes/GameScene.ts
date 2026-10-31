import * as ex from 'excalibur'

export class GameScene extends ex.Scene {
  override onInitialize(): void {
    // TODO(Gabriel #1)
    // TODO(Gabriel #2)
    // TODO(Erick #5)
    // TODO(Erick #6)
    // TODO(Erick #7)

    this.add(
      new ex.Label({
        text: 'Game',
        pos: ex.vec(480, 100),
        color: ex.Color.White,
        font: new ex.Font({
          size: 36,
          textAlign: ex.TextAlign.Center,
          baseAlign: ex.BaseAlign.Middle,
        }),
      }),
    )
    this.add(
      new ex.Actor({
        pos: ex.vec(480, 270),
        width: 64,
        height: 64,
        color: ex.Color.fromHex('#ef4444'),
      }),
    )
  }
}
