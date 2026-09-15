import { describe, expect, it } from 'vitest'
import { applyMove, createGame } from '../game/engine'
import type { GameState } from '../game/types'
import {
  beginAiThinking,
  canAiPlay,
  canHumanPlay,
  createSession,
  isCellPlayable,
  isHumanTurn,
  playAiMove,
  playHumanMove,
  restart,
  setMode,
  type Session,
} from './session'

const X_WIN_MOVES = [0, 3, 1, 4, 2]
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

function sessionFor(
  moves: readonly number[] = [],
  overrides: Partial<Session> = {},
): Session {
  return { mode: 'ai', game: stateAfter(moves), isAiThinking: false, ...overrides }
}

describe('createSession', () => {
  it('defaults to AI mode with a fresh X-first game', () => {
    const session = createSession()

    expect(session.mode).toBe('ai')
    expect(session.game.board).toEqual([
      null, null, null, null, null, null, null, null, null,
    ])
    expect(session.game.turn).toBe('X')
    expect(session.game.status).toBe('playing')
    expect(session.isAiThinking).toBe(false)
  })

  it('accepts an explicit mode', () => {
    expect(createSession('two-player').mode).toBe('two-player')
  })
})

describe('setMode', () => {
  it('resets the game', () => {
    const started = playHumanMove(createSession(), 0)
    const switched = setMode(started, 'two-player')

    expect(switched.mode).toBe('two-player')
    expect(switched.game.board).toEqual([
      null, null, null, null, null, null, null, null, null,
    ])
    expect(switched.game.turn).toBe('X')
  })

  it('clears AI thinking', () => {
    const thinking = sessionFor([0], { isAiThinking: true })
    const switched = setMode(thinking, 'ai')

    expect(switched.isAiThinking).toBe(false)
  })
})

describe('restart', () => {
  it('preserves the mode and creates a fresh game', () => {
    const session = sessionFor([0, 4], { mode: 'two-player' })
    const restarted = restart(session)

    expect(restarted.mode).toBe('two-player')
    expect(restarted.game.board).toEqual([
      null, null, null, null, null, null, null, null, null,
    ])
    expect(restarted.game.turn).toBe('X')
    expect(restarted.isAiThinking).toBe(false)
  })
})

describe('playHumanMove', () => {
  it('accepts a human X move in AI mode', () => {
    const session = playHumanMove(createSession(), 0)

    expect(session.game.board[0]).toBe('X')
    expect(session.game.turn).toBe('O')
  })

  it('rejects a human O move in AI mode', () => {
    const session = sessionFor([0])

    expect(session.game.turn).toBe('O')
    expect(playHumanMove(session, 1)).toBe(session)
  })

  it('rejects a move while the AI is thinking', () => {
    const session = sessionFor([], { isAiThinking: true })

    expect(playHumanMove(session, 0)).toBe(session)
  })

  it('accepts X and O moves in two-player mode', () => {
    const start = setMode(createSession(), 'two-player')
    const afterX = playHumanMove(start, 0)

    expect(afterX.game.board[0]).toBe('X')
    expect(afterX.game.turn).toBe('O')

    const afterO = playHumanMove(afterX, 4)

    expect(afterO.game.board[4]).toBe('O')
    expect(afterO.game.turn).toBe('X')
  })

  it('returns the unchanged session for occupied, out-of-range, or finished games', () => {
    const occupied = sessionFor([0])
    const fresh = createSession()
    const won = sessionFor(X_WIN_MOVES)

    expect(playHumanMove(occupied, 0)).toBe(occupied)
    expect(playHumanMove(fresh, -1)).toBe(fresh)
    expect(playHumanMove(fresh, 9)).toBe(fresh)
    expect(playHumanMove(won, 7)).toBe(won)
  })
})

describe('canAiPlay and playAiMove', () => {
  it('is never allowed in two-player mode', () => {
    const session = setMode(createSession(), 'two-player')

    expect(canAiPlay(session)).toBe(false)
    expect(playAiMove(session)).toBe(session)
  })

  it('is not allowed on X turn', () => {
    const session = createSession()

    expect(canAiPlay(session)).toBe(false)
    expect(playAiMove(session)).toBe(session)
  })

  it('is not allowed after game over', () => {
    const won = sessionFor(X_WIN_MOVES)

    expect(canAiPlay(won)).toBe(false)
    expect(playAiMove(won)).toBe(won)
  })

  it('is not allowed while already thinking', () => {
    const thinking = sessionFor([0], { isAiThinking: true })

    expect(canAiPlay(thinking)).toBe(false)
  })

  it('applies a legal O move and clears the thinking flag', () => {
    const thinking = beginAiThinking(sessionFor([0]))

    expect(thinking.isAiThinking).toBe(true)
    expect(canAiPlay(thinking)).toBe(false)

    const moved = playAiMove(thinking)

    expect(moved).not.toBe(thinking)
    expect(moved.isAiThinking).toBe(false)
    expect(moved.game.turn).toBe('X')
    expect(moved.game.board.filter((cell) => cell === 'O')).toHaveLength(1)
  })

  it('is safe when there is no move to make', () => {
    const draw = sessionFor(DRAW_MOVES)

    expect(playAiMove(draw)).toBe(draw)
  })
})

describe('isCellPlayable', () => {
  it('is true only for legal human moves', () => {
    const fresh = createSession()
    const afterX = playHumanMove(fresh, 0)

    expect(isCellPlayable(fresh, 0)).toBe(true)
    expect(isCellPlayable(fresh, -1)).toBe(false)
    expect(isCellPlayable(afterX, 1)).toBe(false)
    expect(isCellPlayable(afterX, 0)).toBe(false)
  })
})

describe('derived playability helpers', () => {
  it('reports whose turn it is for humans', () => {
    const aiX = createSession()
    const aiO = sessionFor([0])
    const twoPlayer = setMode(createSession(), 'two-player')

    expect(isHumanTurn(aiX)).toBe(true)
    expect(isHumanTurn(aiO)).toBe(false)
    expect(isHumanTurn(twoPlayer)).toBe(true)
    expect(canHumanPlay(aiX)).toBe(true)
    expect(canHumanPlay(aiO)).toBe(false)
    expect(canAiPlay(aiO)).toBe(true)
  })
})
