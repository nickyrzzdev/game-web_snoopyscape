import * as ex from 'excalibur'

export const player = ex.CollisionGroupManager.create('player', 0b111100)
export const playerBullet = ex.CollisionGroupManager.create('playerBullet', 0b110100)
export const enemy = ex.CollisionGroupManager.create('enemy', 0b110011)