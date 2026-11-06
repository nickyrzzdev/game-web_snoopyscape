import * as ex from 'excalibur'
import { Enemy } from '../actors/Enemy'
import { Player } from '../actors/Player'
import { Robot } from '../actors/Robot'
import { Hud } from '../ui/Hud'
import { PLAYER_MAX_HEALTH } from '../config/constants'
import { generateRoom, nextEntrySide } from '../world/RoomGenerator'
import type { Room, Side } from '../world/RoomGenerator'
import { buildRoomTileMap } from '../world/buildRoom'

export class GameScene extends ex.Scene {
  private level = 1
  private room?: Room
  private player?: Player
  private hud?: Hud
  private tileMap?: ex.TileMap
  private roomActors: ex.Actor[] = []
  private enemies = new Set<Enemy>()
  private lockedDoors: ex.Actor[] = []
  private exitsOpen = false
  private changingRoom = false

  override onActivate(): void {
    this.clear()
    this.level = 1
    this.room = undefined
    this.player = undefined
    this.hud = undefined
    this.tileMap = undefined
    this.roomActors = []
    this.enemies.clear()
    this.lockedDoors = []
    this.exitsOpen = false
    this.changingRoom = false
    this.createRoom('left')
  }

  override onPreUpdate(_engine: ex.Engine, _elapsed: number): void {
    if (!this.player || !this.room || this.enemies.size > 0) {
      return
    }

    const side = this.exitSideForPlayer(this.player.pos, this.room)
    if (side) {
      this.enterNextRoom(side)
    }
  }

  private createRoom(entrySide: Side): void {
    const room = generateRoom({ level: this.level, entrySide })
    this.room = room
    this.tileMap = buildRoomTileMap(this, room)
    this.exitsOpen = false

    const spawn = ex.vec(
      room.playerSpawn.col * room.tileSize + room.tileSize / 2,
      room.playerSpawn.row * room.tileSize + room.tileSize / 2,
    )
    if (!this.player) {
      this.hud = new Hud()
      this.add(this.hud)
      this.player = new Player(
        spawn.x,
        spawn.y,
        (lives) => this.hud?.setHealth(lives, PLAYER_MAX_HEALTH),
      )
      this.add(this.player)
    } else {
      this.player.pos = spawn
      this.player.vel = ex.Vector.Zero
    }
    this.hud?.setLevel(this.level)

    this.enemies = new Set()
    for (const spawnPoint of room.enemySpawns) {
      const enemy = new Robot(
        spawnPoint.cell.col * room.tileSize + room.tileSize / 2,
        spawnPoint.cell.row * room.tileSize + room.tileSize / 2,
        this.player,
        room,
        spawnPoint.type,
        () => this.player?.takeDamage(),
      )
      this.enemies.add(enemy)
      this.roomActors.push(enemy)
      enemy.on('kill', () => {
        this.enemies.delete(enemy)
        if (this.enemies.size === 0 && !this.changingRoom) {
          this.openExits()
        }
      })
      this.add(enemy)
    }

    this.addLockedDoors(room)
    if (this.enemies.size === 0) {
      this.openExits()
    }
  }

  private addLockedDoors(room: Room): void {
    const width = room.cols * room.tileSize
    const height = room.rows * room.tileSize
    for (const exit of room.exits) {
      const horizontal = exit.side === 'left' || exit.side === 'right'
      const door = new ex.Actor({
        pos: horizontal
          ? ex.vec(exit.side === 'left' ? -room.tileSize / 2 : width + room.tileSize / 2, height / 2)
          : ex.vec(width / 2, exit.side === 'top' ? -room.tileSize / 2 : height + room.tileSize / 2),
        width: room.tileSize * 2,
        height: room.tileSize * 2,
        color: ex.Color.fromHex('#71432c'),
        collisionType: ex.CollisionType.Fixed,
        z: 1,
      })
      this.lockedDoors.push(door)
      this.roomActors.push(door)
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

    const roomWidth = this.room.cols * this.room.tileSize
    const roomHeight = this.room.rows * this.room.tileSize
    for (const exit of this.room.exits) {
      const cells = exit.cells
      const col = (cells[0].col + cells[cells.length - 1].col) / 2
      const row = (cells[0].row + cells[cells.length - 1].row) / 2
      let x = col * this.room.tileSize + this.room.tileSize / 2
      let y = row * this.room.tileSize + this.room.tileSize / 2
      if (exit.side === 'left') x = this.room.tileSize / 2
      if (exit.side === 'right') x = roomWidth - this.room.tileSize / 2
      if (exit.side === 'top') y = this.room.tileSize / 2
      if (exit.side === 'bottom') y = roomHeight - this.room.tileSize / 2
      const portal = new ex.Actor({
        pos: ex.vec(x, y),
        radius: this.room.tileSize / 3,
        color: ex.Color.Cyan,
        collisionType: ex.CollisionType.PreventCollision,
        z: 1,
      })
      this.roomActors.push(portal)
      this.add(portal)
    }
  }

  private exitSideForPlayer(pos: ex.Vector, room: Room): Side | undefined {
    const width = room.cols * room.tileSize
    const height = room.rows * room.tileSize
    for (const exit of room.exits) {
      const min = Math.min(...exit.cells.map((cell) =>
        exit.side === 'left' || exit.side === 'right' ? cell.row : cell.col,
      )) * room.tileSize
      const max = (Math.max(...exit.cells.map((cell) =>
        exit.side === 'left' || exit.side === 'right' ? cell.row : cell.col,
      )) + 1) * room.tileSize

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
    this.enemies.clear()
    for (const actor of this.roomActors) {
      actor.kill()
    }
    this.roomActors = []
    this.lockedDoors = []
    this.createRoom(nextEntrySide(side))
    this.changingRoom = false
  }
}
