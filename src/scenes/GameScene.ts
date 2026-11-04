import * as ex from 'excalibur'
import { Resources } from '../assets/resources'
import { Player } from '../actors/Player'
import {wall} from '../config/collisionGroups'
import { Robot } from '../actors/Robot'
import { Hud } from '../ui/Hud'

export class GameScene extends ex.Scene {
  override onInitialize(): void {
    // TODO(Gabriel #1)
    const player = new Player(400, 300)
    this.add(player)
    // TODO(Gabriel #2)
    const robot1 = new Robot(200, 200, player)
    this.add(robot1)

    const robot2 = new Robot(700, 200, player)
    this.add(robot2)
    this.add(new Hud())
    
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
    const assetPreview = new ex.Actor({
      pos: ex.vec(480, 270),
      width: 64,
      height: 64,
    })
    assetPreview.graphics.use(Resources.player.toSprite())
    this.add(assetPreview)
    this.add(
      new ex.Actor({
        pos: ex.vec(480, 270),
        width: 64,
        height: 64,
        color: ex.Color.fromHex('#ef4444'),
        collisionType: ex.CollisionType.Fixed,
        collisionGroup: wall,
      }),
    )
  }
}
