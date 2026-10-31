import * as ex from 'excalibur'
import './style.css'
import { loader } from './assets/resources'
import { GAME_HEIGHT, GAME_WIDTH } from './config/constants'
import { GameOverScene } from './scenes/GameOverScene'
import { GameScene } from './scenes/GameScene'
import { MenuScene } from './scenes/MenuScene'

export const game = new ex.Engine({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  displayMode: ex.DisplayMode.FitScreen,
  backgroundColor: ex.Color.fromHex('#151821'),
  physics: {
    solver: ex.SolverStrategy.Arcade,
    gravity: ex.vec(0, 0),
  },
})

game.addScene('menu', new MenuScene())
game.addScene('game', new GameScene())
game.addScene('gameover', new GameOverScene())

game.start(loader).then(() => game.goToScene('menu'))
