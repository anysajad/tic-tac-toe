import { describe, expect, it } from 'vitest'
import { AI_PLAYER, chooseMove } from './ai'
import { applyMove, createGame, getLegalMoves } from './engine'
import type { Board, GameState } from './types'

function boardFrom(cells: string): Board {
  return cells
    .split('')
    .map((char) => (char === 'X' || char === 'O' ? char : null))
}

function assertLegalMove(board: Board): number {
  const move = chooseMove(board)

  expect(move).not.toBeNull()

  if (move === null) {
    throw new Error('Expected the AI to return a move')
  }

  expect(getLegalMoves(board)).toContain(move)

  return move
}

function humanCanWin(state: GameState): boolean {
  if (state.status === 'won') {
    return state.winner === 'X'
  }

  if (state.status === 'draw') {
    return false
  }

  if (state.turn === 'X') {
    return getLegalMoves(state.board).some((index) => {
      const result = applyMove(state, index)

      return result.ok && humanCanWin(result.state)
    })
  }

  const aiMove = chooseMove(state.board, 'O')

  if (aiMove === null || !getLegalMoves(state.board).includes(aiMove)) {
    throw new Error('AI returned an illegal move')
  }

  const result = applyMove(state, aiMove)

  return result.ok ? humanCanWin(result.state) : false
}

describe('chooseMove', () => {
  it('always plays as O by default', () => {
    expect(AI_PLAYER).toBe('O')

    const board = boardFrom('XX.O.....')

    expect(chooseMove(board)).toBe(chooseMove(board, 'O'))
  })

  it('returns a legal move', () => {
    for (const board of [
      createGame().board,
      boardFrom('XX.O.....'),
      boardFrom('X.O.X....'),
    ]) {
      assertLegalMove(board)
    }
  })

  it('takes an immediate winning move', () => {
    const board = boardFrom('OO.XX...X')

    expect(chooseMove(board)).toBe(2)
  })

  it('blocks an immediate X win', () => {
    const board = boardFrom('XX.O.....')

    expect(chooseMove(board)).toBe(2)
  })

  it('returns null for a full drawn board', () => {
    expect(chooseMove(boardFrom('XXOOOXXXO'))).toBeNull()
  })

  it('returns null for a terminal won board', () => {
    expect(chooseMove(boardFrom('XXXOO....'))).toBeNull()
  })

  it('is deterministic for an identical board', () => {
    const board = boardFrom('XX.O.....')

    expect(chooseMove(board)).toBe(chooseMove(board))
  })

  it('prefers the center when it is the best move', () => {
    expect(chooseMove(createGame().board)).toBe(4)
  })

  it('prefers a corner over an edge when moves tie', () => {
    const board = boardFrom('OXXOO.XX.')

    expect(chooseMove(board)).toBe(8)
  })

  it('prefers the first corner when corner moves tie', () => {
    const board = boardFrom('OXOXOX.X.')

    expect(chooseMove(board)).toBe(6)
  })
})

describe('exhaustive validation', () => {
  it('cannot be beaten by X from the initial position', () => {
    expect(() => humanCanWin(createGame())).not.toThrow()
    expect(humanCanWin(createGame())).toBe(false)
  })

  it('detects a position that X can still win (validator sanity check)', () => {
    let state = createGame()

    for (const index of [0, 4, 1, 5]) {
      const result = applyMove(state, index)

      if (!result.ok) {
        throw new Error('Unexpected rejected setup move')
      }

      state = result.state
    }

    expect(state.turn).toBe('X')
    expect(humanCanWin(state)).toBe(true)
  })
})
