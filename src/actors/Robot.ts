import * as ex from 'excalibur'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { generateRoom } from '../world/RoomGenerator'
import type { Room } from '../world/RoomGenerator'

export class Robot extends Enemy {
  constructor(
    x: number,
    y: number,
    player: Player,
    room?: Room,
    type = 'lobo_escuro',
    onPlayerHit?: () => void,
  ) {
    const activeRoom = room ?? generateRoom({ level: 1 })
    super({
      pos: ex.vec(x, y),
      type,
      target: player,
      room: activeRoom,
      difficulty: activeRoom.difficulty,
      onPlayerHit,
    })
  }
}
