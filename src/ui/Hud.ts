import * as ex from 'excalibur'
import { GAME_WIDTH, INITIAL_SCORE, PLAYER_MAX_HEALTH } from '../config/constants'

export class Hud extends ex.ScreenElement {
  private readonly healthLabel: ex.Label
  private readonly levelLabel: ex.Label
  private readonly scoreLabel: ex.Label

  constructor() {
    super()

    this.healthLabel = new ex.Label({
      text: `Vida: ${PLAYER_MAX_HEALTH}/${PLAYER_MAX_HEALTH}`,
      pos: ex.vec(20, 20),
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        bold: true,
        textAlign: ex.TextAlign.Left,
        baseAlign: ex.BaseAlign.Top,
        shadow: {
          blur: 2,
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    })
    this.levelLabel = new ex.Label({
      text: 'Nível: 1',
      pos: ex.vec(GAME_WIDTH / 2, 20),
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        bold: true,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Top,
        shadow: {
          blur: 2,
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    })
    this.scoreLabel = new ex.Label({
      text: `Pontos: ${INITIAL_SCORE}`,
      pos: ex.vec(GAME_WIDTH - 20, 20),
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        bold: true,
        textAlign: ex.TextAlign.Right,
        baseAlign: ex.BaseAlign.Top,
        shadow: {
          blur: 2,
          offset: ex.vec(1, 1),
          color: ex.Color.Black,
        },
      }),
    })

    this.addChild(this.healthLabel)
    this.addChild(this.levelLabel)
    this.addChild(this.scoreLabel)
  }

  setHealth(current: number, max: number): void {
    this.healthLabel.text = `Vida: ${current}/${max}`
  }

  setLevel(level: number): void {
    this.levelLabel.text = `Nível: ${level}`
  }

  setScore(score: number): void {
    this.scoreLabel.text = `Pontos: ${score}`
  }
}
