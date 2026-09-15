import { describe, expect, it } from 'vitest'
import {
  WINNING_LINES,
  applyMove,
  createGame,
  getCell,
  getLegalMoves,
  getWinner,
  getWinningLine,
  isDraw,
  isGameOver,
} from './engine'
import type { GameState, WinningLine } from './types'

function playMoves(moves: readonly number[]): GameState {
  let state = createGame()

  for (const index of moves) {
    const result = applyMove(state, index)

    if (!result.ok) {
      throw new Error(`Unexpected rejected move at ${index}: ${result.reason}`)
    }

    state = result.state
  }

  return state
}

const WINNING_SEQUENCES: { line: WinningLine; moves: readonly number[] }[] = [
  { line: [0, 1, 2], moves: [0, 3, 1, 4, 2] },
  { line: [3, 4, 5], moves: [3, 0, 4, 1, 5] },
  { line: [6, 7, 8], moves: [6, 0, 7, 1, 8] },
  { line: [0, 3, 6], moves: [0, 1, 3, 2, 6] },
  { line: [1, 4, 7], moves: [1, 0, 4, 2, 7] },
  { line: [2, 5, 8], moves: [2, 0, 5, 1, 8] },
  { line: [0, 4, 8], moves: [0, 3, 4, 5, 8] },
  { line: [2, 4, 6], moves: [2, 0, 4, 1, 6] },
]

const DRAW_MOVES = [0, 4, 1, 2, 7, 3, 5, 8, 6]

describe('createGame', () => {
  it('starts with an empty board and X to move', () => {
    const state = createGame()

    expect(state.board).toEqual([null, null, null, null, null, null, null, null, null])
    expect(state.turn).toBe('X')
    expect(state.status).toBe('playing')
    expect(state.winner).toBeNull()
    expect(state.winningLine).toBeNull()
  })

  it('returns a fresh independent game each time', () => {
    const firstGame = createGame()
    const result = applyMove(firstGame, 0)

    if (!result.ok) {
      throw new Error('Expected the opening move to be accepted')
    }

    const secondGame = createGame()

    expect(secondGame.board).toEqual([
      null, null, null, null, null, null, null, null, null,
    ])
    expect(result.state.board).toEqual([
      'X', null, null, null, null, null, null, null, null,
    ])
    expect(firstGame.board).toEqual([
      null, null, null, null, null, null, null, null, null,
    ])
  })
})

describe('applyMove', () => {
  it('places the current mark and alternates the turn', () => {
    const first = playMoves([0])
    const second = playMoves([0, 4])

    expect(first.board[0]).toBe('X')
    expect(first.turn).toBe('O')
    expect(second.board[4]).toBe('O')
    expect(second.turn).toBe('X')
  })

  it('does not mutate the input state and returns a new object', () => {
    const state = createGame()
    const snapshot = [...state.board]
    const result = applyMove(state, 0)

    expect(result.ok).toBe(true)
    expect(state.board).toEqual(snapshot)
    expect(result.ok && result.state).not.toBe(state)
    expect(result.ok && result.state.board).not.toBe(state.board)
  })

  it('rejects occupied cells', () => {
    const state = playMoves([0])
    const result = applyMove(state, 0)

    expect(result).toEqual({ ok: false, reason: 'occupied' })
  })

  it('rejects out-of-range indices', () => {
    const state = createGame()

    for (const index of [-1, 9, 1.5, Number.NaN]) {
      expect(applyMove(state, index)).toEqual({
        ok: false,
        reason: 'out-of-range',
      })
    }
  })

  it('detects a win and records the winner and winning line', () => {
    const state = playMoves([0, 3, 1, 4, 2])

    expect(state.status).toBe('won')
    expect(state.winner).toBe('X')
    expect(state.winningLine).toEqual([0, 1, 2])
  })

  it('detects every winning line', () => {
    expect(WINNING_LINES).toHaveLength(8)

    for (const { line, moves } of WINNING_SEQUENCES) {
      const state = playMoves(moves)

      expect(state.status).toBe('won')
      expect(state.winner).toBe('X')
      expect(state.winningLine).toEqual(line)
    }
  })

  it('detects a draw on a full board without a winner', () => {
    const state = playMoves(DRAW_MOVES)

    expect(state.status).toBe('draw')
    expect(state.winner).toBeNull()
    expect(state.winningLine).toBeNull()
  })

  it('does not report a draw when a winner exists', () => {
    const state = playMoves([0, 3, 1, 4, 2])

    expect(isDraw(state.board)).toBe(false)
  })

  it('rejects moves after a win', () => {
    const state = playMoves([0, 3, 1, 4, 2])
    const result = applyMove(state, 7)

    expect(result).toEqual({ ok: false, reason: 'game-over' })
  })

  it('rejects moves after a draw', () => {
    const state = playMoves(DRAW_MOVES)
    const result = applyMove(state, 0)

    expect(result).toEqual({ ok: false, reason: 'game-over' })
  })
})

describe('getLegalMoves', () => {
  it('lists every empty cell on an empty board', () => {
    expect(getLegalMoves(createGame().board)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('excludes occupied cells', () => {
    const state = playMoves([0, 4])

    expect(getLegalMoves(state.board)).toEqual([1, 2, 3, 5, 6, 7, 8])
  })

  it('returns no moves for a won board', () => {
    const state = playMoves([0, 3, 1, 4, 2])

    expect(getLegalMoves(state.board)).toEqual([])
  })

  it('returns no moves for a drawn board', () => {
    const state = playMoves(DRAW_MOVES)

    expect(getLegalMoves(state.board)).toEqual([])
  })
})

describe('getWinner and getWinningLine', () => {
  it('return null while the game is in progress', () => {
    const state = playMoves([0, 4])

    expect(getWinner(state.board)).toBeNull()
    expect(getWinningLine(state.board)).toBeNull()
  })

  it('return the winner and line for a won board', () => {
    const state = playMoves([0, 3, 4, 5, 8])

    expect(getWinner(state.board)).toBe('X')
    expect(getWinningLine(state.board)).toEqual([0, 4, 8])
  })
})

describe('isGameOver and isDraw', () => {
  it('are false while playing', () => {
    const board = playMoves([0, 4]).board

    expect(isGameOver(board)).toBe(false)
    expect(isDraw(board)).toBe(false)
  })

  it('are true for a draw', () => {
    const board = playMoves(DRAW_MOVES).board

    expect(isGameOver(board)).toBe(true)
    expect(isDraw(board)).toBe(true)
  })

  it('isGameOver is true but isDraw is false after a win', () => {
    const board = playMoves([0, 3, 1, 4, 2]).board

    expect(isGameOver(board)).toBe(true)
    expect(isDraw(board)).toBe(false)
  })
})

describe('getCell', () => {
  it('returns the mark after it is placed', () => {
    const board = playMoves([0]).board

    expect(getCell(board, 0)).toBe('X')
  })

  it('returns null for empty or out-of-range indices', () => {
    const board = createGame().board

    expect(getCell(board, 5)).toBeNull()
    expect(getCell(board, 99)).toBeNull()
  })
})
