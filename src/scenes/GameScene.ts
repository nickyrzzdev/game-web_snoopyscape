import * as ex from 'excalibur'
import { Enemy } from '../actors/Enemy'
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
  private enemies: Enemy[] = []
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
    this.enemies = []
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

  this.enemies = this.enemies.filter(
    (item) => item !== enemy,
  )

  if (this.enemies.length === 0) {
    this.onRoomCleared()
  }
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
    
    this.createEnemies(room)
  }

private getEnemySpawnCells(
  room: Room,
  amount: number,
): { col: number; row: number }[] {
  if (!this.player) {
    return []
  }

  const playerCol = room.playerSpawn.col
  const playerRow = room.playerSpawn.row

  const candidates: { col: number; row: number }[] = []

  for (let row = 1; row < room.rows - 1; row++) {
    for (let col = 1; col < room.cols - 1; col++) {

  
      if (room.walls[row][col]) {
        continue
      }

      
      const distance = Math.hypot(
        col - playerCol,
        row - playerRow,
      )

      if (distance < 5) {
        continue
      }

      candidates.push({ col, row })
    }
  }

  
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    const temp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = temp
  }

  return candidates.slice(0, amount)
}

  private createEnemies(room: Room): void {
  if (!this.player) {
    return
  }

  const enemyTypes = [
    'lobo_escuro',
    'lobo_verde',
    'lobo_marrom',
    'tubarao_cinza',
    'tubarao_azul',
    'tubarao_verde',
  ]

  const enemyCount = Math.min(2 + this.level, 6)

  const spawnCells = this.getEnemySpawnCells(
    room,
    enemyCount,
  )

  for (let i = 0; i < spawnCells.length; i++) {
    const cell = spawnCells[i]

    const position = ex.vec(
      cell.col * room.tileSize + room.tileSize / 2,
      cell.row * room.tileSize + room.tileSize / 2,
    )

    const enemy = new Enemy({
      pos: position,
      type: enemyTypes[i % enemyTypes.length],
      target: this.player,
      room: room,
      enemySpeed: 60,
      enemyBulletSpeed: 200,
      enemyFireCooldownMs: 1000,

      onPlayerHit: () => {
  this.player?.takeDamage()
},
    })

    // Quando esse inimigo morrer:
    enemy.on('kill', () => {
      this.onEnemyKilled(enemy)
    })

    this.enemies.push(enemy)
    this.add(enemy)
  }
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
