import * as ex from 'excalibur'

// Collision categories follow the order used to assign their bit masks.
export const player = ex.CollisionGroupManager.create('player', 0b111100)
export const playerBullet = ex.CollisionGroupManager.create('playerBullet', 0b110100)
export const enemy = ex.CollisionGroupManager.create('enemy', 0b010011)
export const enemyBullet = ex.CollisionGroupManager.create('enemyBullet', 0b010001)
export const wall = ex.CollisionGroupManager.create('wall', 0b001111)
export const boss = ex.CollisionGroupManager.create('boss', 0b000011)
