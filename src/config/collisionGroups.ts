import * as ex from 'excalibur'

// Collision categories follow the order used to assign their bit masks.
export const player = ex.CollisionGroupManager.create('player', 0b111100)
export const playerBullet = ex.CollisionGroupManager.create('playerBullet', 0b110100)
