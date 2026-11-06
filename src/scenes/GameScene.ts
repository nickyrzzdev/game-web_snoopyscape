import * as ex from 'excalibur'
<<<<<<< HEAD
import { Enemy } from '../actors/Enemy'
=======
import { Resources } from '../assets/resources'
>>>>>>> origin/main
import { Player } from '../actors/Player'
import { Hud } from '../ui/Hud'
import { INITIAL_SCORE, PLAYER_MAX_HEALTH } from '../config/constants'
import { generateRoom, nextEntrySide } from '../world/RoomGenerator'
import type { Room, Side } from '../world/RoomGenerator'
import { buildRoomTileMap } from '../world/buildRoom'

export class GameScene extends ex.Scene {
  private level = 1
  private score = INITIAL_SCORE
  private room?: Room
  private player?: Player
  private hud?: Hud
  private tileMap?: ex.TileMap
  private lockedDoors: ex.Actor[] = []
  private portals: ex.Actor[] = []
  private exitsOpen = false
  private changingRoom = false

  override onActivate(): void {
    this.clear()
    this.level = 1
    this.score = INITIAL_SCORE
    this.room = undefined
    this.player = undefined
    this.hud = undefined
    this.tileMap = undefined
    this.lockedDoors = []
    this.portals = []
    this.exitsOpen = false
    this.changingRoom = false
    this.createRoom('left')
  }

  override onPreUpdate(_engine: ex.Engine, _elapsed: number): void {
    if (!this.player || !this.room) {
      return
    }

    const side = this.exitSideForPlayer(this.player.pos, this.room)
    if (side) {
      this.enterNextRoom(side)
    }
  }

  onEnemyKilled(enemy: Enemy): void {
    this.score += enemy.scoreValue
    this.hud?.setScore(this.score)
  }

  onRoomCleared(): void {
    this.openExits()
  }

  private createRoom(entrySide: Side): void {
    const room = generateRoom({ seed: this.level * 7919, entrySide })
    this.room = room
    this.tileMap = buildRoomTileMap(this, room)
    this.exitsOpen = false

    const spawn = ex.vec(
      room.playerSpawn.col * room.tileSize + room.tileSize / 2,
      room.playerSpawn.row * room.tileSize + room.tileSize / 2,
    )
<<<<<<< HEAD
    if (!this.player) {
      this.hud = new Hud()
      this.add(this.hud)
      this.player = new Player(
        spawn.x,
        spawn.y,
        (lives) => this.hud?.setHealth(lives, PLAYER_MAX_HEALTH),
      )
      this.add(this.player)
      this.hud.setScore(this.score)
    } else {
      this.player.pos = spawn
      this.player.vel = ex.Vector.Zero
    }
    this.hud?.setLevel(this.level)

    this.addLockedDoors(room)
    // Erick deve chamar este método quando a onda terminar.
    this.onRoomCleared()
  }

  private addLockedDoors(room: Room): void {
    const width = room.cols * room.tileSize
    const height = room.rows * room.tileSize
    const doorSize = room.tileSize * 2
    for (const exit of room.exits) {
      const door = new ex.Actor({
        pos: ex.vec(
          exit.side === 'left' ? -room.tileSize / 2 :
            exit.side === 'right' ? width + room.tileSize / 2 : width / 2,
          exit.side === 'top' ? -room.tileSize / 2 :
            exit.side === 'bottom' ? height + room.tileSize / 2 : height / 2,
        ),
        width: doorSize,
        height: doorSize,
        color: ex.Color.fromHex('#71432c'),
=======
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
>>>>>>> origin/main
        collisionType: ex.CollisionType.Fixed,
        z: 1,
      })
      this.lockedDoors.push(door)
      this.add(door)
    }
  }

  private openExits(): void {
    if (this.exitsOpen || !this.room) {
      return
    }

    this.exitsOpen = true
    for (const door of this.lockedDoors) {
      door.kill()
    }
    this.lockedDoors = []

    const { cols, rows, tileSize } = this.room
    const roomWidth = cols * tileSize
    const roomHeight = rows * tileSize
    for (const exit of this.room.exits) {
      const cells = exit.cells
      const col = (cells[0].col + cells[cells.length - 1].col) / 2
      const row = (cells[0].row + cells[cells.length - 1].row) / 2
      const x = exit.side === 'left' ? tileSize / 2 :
        exit.side === 'right' ? roomWidth - tileSize / 2 : col * tileSize + tileSize / 2
      const y = exit.side === 'top' ? tileSize / 2 :
        exit.side === 'bottom' ? roomHeight - tileSize / 2 : row * tileSize + tileSize / 2
      const portal = new ex.Actor({
        pos: ex.vec(x, y),
        radius: tileSize / 3,
        color: ex.Color.Cyan,
        collisionType: ex.CollisionType.PreventCollision,
        z: 1,
      })
      this.portals.push(portal)
      this.add(portal)
    }
  }

  private exitSideForPlayer(pos: ex.Vector, room: Room): Side | undefined {
    const width = room.cols * room.tileSize
    const height = room.rows * room.tileSize
    for (const exit of room.exits) {
      let start = Infinity
      let end = -Infinity
      for (const cell of exit.cells) {
        const coordinate = exit.side === 'left' || exit.side === 'right' ? cell.row : cell.col
        start = Math.min(start, coordinate)
        end = Math.max(end, coordinate)
      }
      const min = start * room.tileSize
      const max = (end + 1) * room.tileSize

      if (exit.side === 'left' && pos.x < 0 && pos.y >= min && pos.y < max) return exit.side
      if (exit.side === 'right' && pos.x > width && pos.y >= min && pos.y < max) return exit.side
      if (exit.side === 'top' && pos.y < 0 && pos.x >= min && pos.x < max) return exit.side
      if (exit.side === 'bottom' && pos.y > height && pos.x >= min && pos.x < max) return exit.side
    }
    return undefined
  }

  private enterNextRoom(side: Side): void {
    if (!this.room || !this.player || this.changingRoom) {
      return
    }

    this.changingRoom = true
    this.level += 1
    this.tileMap?.kill()
    this.tileMap = undefined
    for (const door of this.lockedDoors) {
      door.kill()
    }
    for (const portal of this.portals) {
      portal.kill()
    }
    this.lockedDoors = []
    this.portals = []
    this.createRoom(nextEntrySide(side))
    this.changingRoom = false
  }
}
