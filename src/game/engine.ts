import { BOARD_SIZE } from './types'
import type {
  Board,
  Cell,
  GameState,
  MoveResult,
  Player,
  WinningLine,
} from './types'

export const WINNING_LINES: readonly WinningLine[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function getCell(board: Board, index: number): Cell {
  return board[index] ?? null
}

function findWinner(board: Board): {
  winner: Player | null
  winningLine: WinningLine | null
} {
  for (const line of WINNING_LINES) {
    const [first, second, third] = line
    const mark = getCell(board, first)

    if (
      mark !== null &&
      mark === getCell(board, second) &&
      mark === getCell(board, third)
    ) {
      return { winner: mark, winningLine: line }
    }
  }

  return { winner: null, winningLine: null }
}

export function getWinner(board: Board): Player | null {
  return findWinner(board).winner
}

export function getWinningLine(board: Board): WinningLine | null {
  return findWinner(board).winningLine
}

function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null)
}

export function getLegalMoves(board: Board): readonly number[] {
  if (isGameOver(board)) {
    return []
  }

  const legalMoves: number[] = []

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (getCell(board, index) === null) {
      legalMoves.push(index)
    }
  }

  return legalMoves
}

export function isDraw(board: Board): boolean {
  return getWinner(board) === null && isBoardFull(board)
}

export function isGameOver(board: Board): boolean {
  return getWinner(board) !== null || isBoardFull(board)
}

function isWithinBoard(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < BOARD_SIZE
}

function nextPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X'
}

function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => null)
}

export function createGame(): GameState {
  return {
    board: emptyBoard(),
    turn: 'X',
    status: 'playing',
    winner: null,
    winningLine: null,
  }
}

export function applyMove(state: GameState, index: number): MoveResult {
  if (!isWithinBoard(index)) {
    return { ok: false, reason: 'out-of-range' }
  }

  if (state.status !== 'playing') {
    return { ok: false, reason: 'game-over' }
  }

  if (getCell(state.board, index) !== null) {
    return { ok: false, reason: 'occupied' }
  }

  const board = state.board.map((cell, position) =>
    position === index ? state.turn : cell,
  )
  const { winner, winningLine } = findWinner(board)

  if (winner !== null) {
    return {
      ok: true,
      state: {
        board,
        turn: state.turn,
        status: 'won',
        winner,
        winningLine,
      },
    }
  }

  if (isBoardFull(board)) {
    return {
      ok: true,
      state: {
        board,
        turn: state.turn,
        status: 'draw',
        winner: null,
        winningLine: null,
      },
    }
  }

  return {
    ok: true,
    state: {
      board,
      turn: nextPlayer(state.turn),
      status: 'playing',
      winner: null,
      winningLine: null,
    },
  }
}
