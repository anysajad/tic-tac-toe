export type Player = 'X' | 'O'

export type Cell = Player | null

export type Board = readonly Cell[]

export type GameStatus = 'playing' | 'won' | 'draw'

export type WinningLine = readonly [number, number, number]

export type GameState = {
  readonly board: Board
  readonly turn: Player
  readonly status: GameStatus
  readonly winner: Player | null
  readonly winningLine: WinningLine | null
}

export type MoveError = 'out-of-range' | 'occupied' | 'game-over'

export type MoveResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: MoveError }

export const BOARD_SIZE = 9
