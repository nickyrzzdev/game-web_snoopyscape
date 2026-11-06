// Sem dependência do Excalibur: devolve só dados do layout da sala.
import { TILE_SIZE } from '../config/constants'

export type Side = 'top' | 'bottom' | 'left' | 'right';
export interface Cell { col: number; row: number }

export interface Room {
  seed: number;
  cols: number;
  rows: number;
  tileSize: number;
  walls: boolean[][];          // walls[row][col] === true -> parede
  exits: { side: Side; cells: Cell[] }[]; // vão de 2 tiles em cada lado (exceto onde o jogador entrou: fica fechado até limpar a sala, decisão do jogo)
  entrySide: Side;
  playerSpawn: Cell;
}

export interface RoomOptions {
  entrySide?: Side;
  seed?: number;
  cols?: number;
  rows?: number;
  tileSize?: number;
}

// RNG determinístico (mulberry32)
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SIDES: Side[] = ['top', 'bottom', 'left', 'right'];
const WALL_DENSITY = 0.77;
const INWARD: Record<Side, Cell> = {
  left: { col: 1, row: 0 },
  right: { col: -1, row: 0 },
  top: { col: 0, row: 1 },
  bottom: { col: 0, row: -1 },
};
const opposite: Record<Side, Side> = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };

function exitCells(side: Side, cols: number, rows: number): Cell[] {
  const mc = Math.floor(cols / 2), mr = Math.floor(rows / 2);
  switch (side) {
    case 'top': return [{ col: mc - 1, row: 0 }, { col: mc, row: 0 }];
    case 'bottom': return [{ col: mc - 1, row: rows - 1 }, { col: mc, row: rows - 1 }];
    case 'left': return [{ col: 0, row: mr - 1 }, { col: 0, row: mr }];
    case 'right': return [{ col: cols - 1, row: mr - 1 }, { col: cols - 1, row: mr }];
  }
}

function reachable(walls: boolean[][], starts: Cell[]): Set<number> {
  const rows = walls.length, cols = walls[0].length;
  const seen = new Set<number>();
  const stack = [...starts];
  while (stack.length) {
    const c = stack.pop()!;
    const k = c.row * cols + c.col;
    if (c.col < 0 || c.row < 0 || c.col >= cols || c.row >= rows || walls[c.row][c.col] || seen.has(k)) continue;
    seen.add(k);
    for (const [dx, dy] of DIRS) stack.push({ col: c.col + dx, row: c.row + dy });
  }
  return seen;
}

export function generateRoom(opts: RoomOptions): Room {
  const cols = opts.cols ?? 20, rows = opts.rows ?? 12, tileSize = opts.tileSize ?? TILE_SIZE;
  const seed = opts.seed ?? 7919;
  const entrySide = opts.entrySide ?? 'left';
  const rand = rng(seed);

  const walls: boolean[][] = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  for (let c = 0; c < cols; c++) { walls[0][c] = true; walls[rows - 1][c] = true; }
  for (let r = 0; r < rows; r++) { walls[r][0] = true; walls[r][cols - 1] = true; }
  // saídas nos 4 lados (Berzerk: sempre dá para sair por qualquer lado)
  const exits = SIDES.map((side) => ({ side, cells: exitCells(side, cols, rows) }));
  for (const e of exits) for (const c of e.cells) walls[c.row][c.col] = false;

  // espaço livre garantido na frente de cada saída (3 tiles) para o jogador nunca ficar preso
  const keepFree = new Set<number>();
  for (const e of exits) for (const c of e.cells) {
    const direction = INWARD[e.side];
    for (let i = 0; i <= 3; i++) {
      keepFree.add((c.row + direction.row * i) * cols + c.col + direction.col * i);
    }
  }

  const freeStarts = exits[0].cells; // qualquer saída serve de ponto de partida (todas ligam à moldura livre)
  for (let row = 3; row <= rows - 4; row += 3) {
    for (let col = 3; col <= cols - 4; col += 3) {
      if (rand() > WALL_DENSITY) continue;
      const [dx, dy] = DIRS[Math.floor(rand() * DIRS.length)];
      const len = 2 + Math.floor(rand() * 3);
      const added: Cell[] = [{ col, row }];
      for (let i = 1; i <= len; i++) added.push({ col: col + dx * i, row: row + dy * i });
      const touched: Cell[] = [];
      for (const c of added) {
        if (c.col < 1 || c.row < 1 || c.col > cols - 2 || c.row > rows - 2) continue;
        if (keepFree.has(c.row * cols + c.col) || walls[c.row][c.col]) continue;
        walls[c.row][c.col] = true;
        touched.push(c);
      }
      const totalFree = walls.flat().filter((wall) => !wall).length;
      if (reachable(walls, freeStarts).size !== totalFree) {
        for (const cell of touched) walls[cell.row][cell.col] = false;
      }
    }
  }

  const front = exits.find((e) => e.side === entrySide)!;
  const direction = INWARD[entrySide];
  const playerSpawn: Cell = {
    col: front.cells[0].col + direction.col * 2,
    row: front.cells[0].row + direction.row * 2,
  };
  walls[playerSpawn.row][playerSpawn.col] = false;

  return { seed, cols, rows, tileSize, walls, exits, entrySide, playerSpawn };
}

// Lado oposto: se o jogador saiu pela direita, a próxima sala começa com entrySide = 'left'
export function nextEntrySide(exitedThrough: Side): Side { return opposite[exitedThrough]; }

export interface Vec { x: number; y: number }
/** Devolve a direção mais próxima em 8 sentidos, ou null se o jogador não estiver alinhado. */
export function aim8(from: Vec, to: Vec, tolerancePx = 20): Vec | null {
  const dx = to.x - from.x, dy = to.y - from.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  const sx = Math.sign(dx), sy = Math.sign(dy);
  if (ady <= tolerancePx) return { x: sx, y: 0 };            // horizontal
  if (adx <= tolerancePx) return { x: 0, y: sy };            // vertical
  if (Math.abs(adx - ady) <= tolerancePx) { const n = Math.SQRT2; return { x: sx / n, y: sy / n }; } // diagonal
  return null;
}
/** Linha de visão simples sobre o grid (amostragem): true se nenhuma parede entre os dois pontos. */
export function hasLineOfSight(room: Room, a: Vec, b: Vec): boolean {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (room.tileSize / 2));
  for (let i = 1; i < steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps, y = a.y + ((b.y - a.y) * i) / steps;
    if (room.walls[Math.floor(y / room.tileSize)]?.[Math.floor(x / room.tileSize)]) return false;
  }
  return true;
}
