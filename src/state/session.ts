import { AI_PLAYER, chooseMove } from '../game/ai'
import { applyMove, createGame, getLegalMoves } from '../game/engine'
import type { GameState } from '../game/types'

export type GameMode = 'ai' | 'two-player'

export type Session = {
  readonly mode: GameMode
  readonly game: GameState
  readonly isAiThinking: boolean
}

const DEFAULT_MODE: GameMode = 'ai'

export function createSession(mode: GameMode = DEFAULT_MODE): Session {
  return { mode, game: createGame(), isAiThinking: false }
}

export function setMode(_session: Session, mode: GameMode): Session {
  return { mode, game: createGame(), isAiThinking: false }
}

export function restart(session: Session): Session {
  return { ...session, game: createGame(), isAiThinking: false }
}

export function isHumanTurn(session: Session): boolean {
  return session.mode === 'two-player' || session.game.turn === 'X'
}

export function canHumanPlay(session: Session): boolean {
  return (
    session.game.status === 'playing' &&
    !session.isAiThinking &&
    isHumanTurn(session)
  )
}

export function canAiPlay(session: Session): boolean {
  return (
    session.mode === 'ai' &&
    session.game.status === 'playing' &&
    session.game.turn === AI_PLAYER &&
    !session.isAiThinking
  )
}

export function isCellPlayable(session: Session, index: number): boolean {
  return canHumanPlay(session) && getLegalMoves(session.game.board).includes(index)
}

export function playHumanMove(session: Session, index: number): Session {
  if (!canHumanPlay(session)) {
    return session
  }

  const result = applyMove(session.game, index)

  if (!result.ok) {
    return session
  }

  return { ...session, game: result.state }
}

export function beginAiThinking(session: Session): Session {
  if (!canAiPlay(session)) {
    return session
  }

  return { ...session, isAiThinking: true }
}

export function playAiMove(session: Session): Session {
  if (
    session.mode !== 'ai' ||
    session.game.status !== 'playing' ||
    session.game.turn !== AI_PLAYER
  ) {
    return session
  }

  const index = chooseMove(session.game.board, AI_PLAYER)

  if (index === null) {
    return { ...session, isAiThinking: false }
  }

  const result = applyMove(session.game, index)

  if (!result.ok) {
    return { ...session, isAiThinking: false }
  }

  return { ...session, game: result.state, isAiThinking: false }
}
