import { applyMove, getLegalMoves } from './engine'
import type { Board, GameState, Player } from './types'

export const AI_PLAYER: Player = 'O'

const CENTER = 4
const CORNERS = [0, 2, 6, 8] as const
const EDGES = [1, 3, 5, 7] as const

const PREFERRED_MOVE_ORDER: readonly number[] = [
  CENTER,
  ...CORNERS,
  ...EDGES,
]

function orderMoves(board: Board): readonly number[] {
  const legalMoves = new Set(getLegalMoves(board))

  return PREFERRED_MOVE_ORDER.filter((index) => legalMoves.has(index))
}

function scoreFor(winner: Player, player: Player, depth: number): number {
  return winner === player ? 10 - depth : depth - 10
}

function minimax(state: GameState, player: Player, depth: number): number {
  if (state.status === 'won' && state.winner !== null) {
    return scoreFor(state.winner, player, depth)
  }

  if (state.status === 'draw') {
    return 0
  }

  const isMaximizing = state.turn === player
  let bestScore = isMaximizing ? -Infinity : Infinity

  for (const index of orderMoves(state.board)) {
    const result = applyMove(state, index)

    if (!result.ok) {
      continue
    }

    const score = minimax(result.state, player, depth + 1)
    bestScore = isMaximizing
      ? Math.max(bestScore, score)
      : Math.min(bestScore, score)
  }

  return bestScore
}

export function chooseMove(
  board: Board,
  player: Player = AI_PLAYER,
): number | null {
  const legalMoves = orderMoves(board)

  if (legalMoves.length === 0) {
    return null
  }

  const initialState: GameState = {
    board,
    turn: player,
    status: 'playing',
    winner: null,
    winningLine: null,
  }

  let bestIndex: number | null = null
  let bestScore = -Infinity

  for (const index of legalMoves) {
    const result = applyMove(initialState, index)

    if (!result.ok) {
      continue
    }

    const score = minimax(result.state, player, 1)

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  }

  return bestIndex
}
