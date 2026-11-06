// Lógica PURA do tiro dos inimigos (sem Excalibur) para ser testável.
// Regra estilo Berzerk: o inimigo só atira se o jogador estiver alinhado em uma das 8 direções,
// sem parede no meio e com o cooldown zerado.
import { aim8, hasLineOfSight } from '../world/RoomGenerator';
import type { Room, Vec } from '../world/RoomGenerator';

export interface EnemyFireState { cooldownMs: number }

/** Atraso inicial aleatório (0.5s–1.5s) para os inimigos não atirarem todos no instante em que a sala carrega. */
export function createFireState(rand: () => number = Math.random): EnemyFireState {
  return { cooldownMs: 500 + rand() * 1000 };
}

export interface FireContext {
  dtMs: number;
  enemyPos: Vec;
  playerPos: Vec;
  enemyFireCooldownMs: number;
  room?: Room;              // se informado, bloqueia tiro através de parede
  activeEnemyBullets?: number; // quantos tiros inimigos existem agora
  maxEnemyBullets?: number;    // limite global (Berzerk clássico: poucos tiros na tela). Padrão: 4
  rand?: () => number;
}

/** Avança o cooldown. Devolve a direção UNITÁRIA do tiro, ou null se não deve atirar neste frame. */
export function stepEnemyFire(state: EnemyFireState, ctx: FireContext): Vec | null {
  state.cooldownMs -= ctx.dtMs;
  if (state.cooldownMs > 0) return null;
  const dir = aim8(ctx.enemyPos, ctx.playerPos);
  if (!dir) { state.cooldownMs = 0; return null; }                       // pronto, esperando alinhar
  if (ctx.room && !hasLineOfSight(ctx.room, ctx.enemyPos, ctx.playerPos)) return null;
  if ((ctx.activeEnemyBullets ?? 0) >= (ctx.maxEnemyBullets ?? 4)) return null;
  const rand = ctx.rand ?? Math.random;
  state.cooldownMs = ctx.enemyFireCooldownMs * (0.8 + rand() * 0.4);
  return dir;
}
