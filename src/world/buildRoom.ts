import { Scene, TileMap, vec } from 'excalibur';
import { createFloorSprites, createTorchAnimation, createWallSprite, TILE } from '../assets/sprites';
import type { Room } from './RoomGenerator';

/**
 * Cria o chão e as paredes da sala em um único TileMap (paredes = tiles sólidos).
 * Se o jogo já usa atores de parede para colisão, o Copilot pode manter isso e usar o TileMap só como visual.
 */
export function buildRoomTileMap(scene: Scene, room: Room, seed = room.seed): TileMap {
  const tm = new TileMap({
    pos: vec(0, 0),
    tileWidth: TILE,
    tileHeight: TILE,
    columns: room.cols,
    rows: room.rows,
  });
  tm.z = -10;
  const floors = createFloorSprites();
  let s = seed >>> 0; // RNG simples para escolher a variação do chão sempre igual na mesma sala
  const next = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let r = 0; r < room.rows; r++) {
    for (let c = 0; c < room.cols; c++) {
      const tile = tm.tiles[r * room.cols + c];
      if (room.walls[r][c]) {
        tile.addGraphic(createWallSprite());
        tile.solid = true;
        if (next() < 0.06) {
          tile.addGraphic(createTorchAnimation(), { offset: vec(8, 8) });
        }
      } else {
        tile.addGraphic(floors[Math.floor(next() * floors.length)]);
      }
    }
  }
  scene.add(tm);
  return tm;
}
