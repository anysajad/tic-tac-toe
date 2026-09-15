import { describe, expect, it } from 'vitest'
import { applyMove, createGame } from '../game/engine'
import type { GameState } from '../game/types'
import { createSession, type Session } from '../state/session'
import { deriveStatus } from './status'

const X_WIN_MOVES = [0, 3, 1, 4, 2]
const O_WIN_MOVES = [0, 3, 1, 4, 7, 5]
const DRAW_MOVES = [0, 4, 1, 2, 7, 3, 5, 8, 6]

function stateAfter(moves: readonly number[]): GameState {
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

function sessionFor(moves: readonly number[], mode: Session['mode']): Session {
  return { mode, game: stateAfter(moves), isAiThinking: false }
}

describe('deriveStatus in AI mode', () => {
  it('describes the human turn', () => {
    expect(deriveStatus(createSession())).toEqual({
      eyebrow: 'Turn',
      value: 'Your turn',
      tone: 'turn-x',
    })
  })

  it('describes the computer turn', () => {
    expect(deriveStatus(sessionFor([0], 'ai'))).toEqual({
      eyebrow: 'Turn',
      value: 'Computer is thinking',
      tone: 'thinking',
    })
  })

  it('describes a human win', () => {
    expect(deriveStatus(sessionFor(X_WIN_MOVES, 'ai'))).toEqual({
      eyebrow: 'Result',
      value: 'You win',
      tone: 'won-x',
    })
  })

  it('describes a computer win', () => {
    expect(deriveStatus(sessionFor(O_WIN_MOVES, 'ai'))).toEqual({
      eyebrow: 'Result',
      value: 'Computer wins',
      tone: 'won-o',
    })
  })

  it('describes a draw', () => {
    expect(deriveStatus(sessionFor(DRAW_MOVES, 'ai'))).toEqual({
      eyebrow: 'Result',
      value: 'Draw',
      tone: 'draw',
    })
  })
})

describe('deriveStatus in two-player mode', () => {
  it('describes each turn', () => {
    expect(deriveStatus(sessionFor([], 'two-player'))).toEqual({
      eyebrow: 'Turn',
      value: "X's turn",
      tone: 'turn-x',
    })
    expect(deriveStatus(sessionFor([0], 'two-player'))).toEqual({
      eyebrow: 'Turn',
      value: "O's turn",
      tone: 'turn-o',
    })
  })

  it('describes each winner', () => {
    expect(deriveStatus(sessionFor(X_WIN_MOVES, 'two-player'))).toEqual({
      eyebrow: 'Result',
      value: 'X wins',
      tone: 'won-x',
    })
    expect(deriveStatus(sessionFor(O_WIN_MOVES, 'two-player'))).toEqual({
      eyebrow: 'Result',
      value: 'O wins',
      tone: 'won-o',
    })
  })

  it('describes a draw', () => {
    expect(deriveStatus(sessionFor(DRAW_MOVES, 'two-player'))).toEqual({
      eyebrow: 'Result',
      value: 'Draw',
      tone: 'draw',
    })
  })
})
