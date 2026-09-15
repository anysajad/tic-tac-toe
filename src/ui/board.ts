import type { Board, Cell, Player, WinningLine } from '../game/types'

const ROW_LENGTH = 3
const ROW_COUNT = 3
const CELL_COUNT = ROW_LENGTH * ROW_COUNT

export function rowOf(index: number): number {
  return Math.floor(index / ROW_LENGTH)
}

export function columnOf(index: number): number {
  return index % ROW_LENGTH
}

export function describeCell(
  index: number,
  mark: Cell,
  isWinning: boolean,
): string {
  const content = mark === null ? 'empty' : mark
  const winningSuffix = isWinning ? ', winning cell' : ''

  return `Row ${rowOf(index) + 1}, column ${columnOf(index) + 1}, ${content}${winningSuffix}`
}

export function nextFocusIndex(current: number, key: string): number {
  const rowStart = rowOf(current) * ROW_LENGTH
  const rowEnd = rowStart + ROW_LENGTH - 1

  switch (key) {
    case 'ArrowLeft':
      return current > rowStart ? current - 1 : current
    case 'ArrowRight':
      return current < rowEnd ? current + 1 : current
    case 'ArrowUp':
      return current - ROW_LENGTH >= 0 ? current - ROW_LENGTH : current
    case 'ArrowDown':
      return current + ROW_LENGTH < CELL_COUNT ? current + ROW_LENGTH : current
    case 'Home':
      return rowStart
    case 'End':
      return rowEnd
    default:
      return current
  }
}

export type BoardView = {
  readonly element: HTMLDivElement
  readonly cells: readonly HTMLButtonElement[]
  focusIndex: number
}

export type BoardRenderState = {
  readonly board: Board
  readonly winningLine: WinningLine | null
  readonly turn: Player
  readonly isCellAvailable: (index: number) => boolean
  readonly isBusy: boolean
}

function createGhost(player: Player): HTMLSpanElement {
  const ghost = document.createElement('span')
  ghost.className = `cell__ghost cell__ghost--${player.toLowerCase()}`
  ghost.textContent = player
  ghost.setAttribute('aria-hidden', 'true')

  return ghost
}

export function createBoard(): BoardView {
  const element = document.createElement('div')
  element.className = 'board'
  element.setAttribute('role', 'grid')
  element.setAttribute('aria-label', 'Tic Tac Toe board')

  const cells: HTMLButtonElement[] = []

  for (let row = 0; row < ROW_COUNT; row += 1) {
    const rowElement = document.createElement('div')
    rowElement.className = 'board__row'
    rowElement.setAttribute('role', 'row')

    for (let column = 0; column < ROW_LENGTH; column += 1) {
      const index = row * ROW_LENGTH + column
      const cell = document.createElement('button')
      cell.type = 'button'
      cell.className = 'cell'
      cell.setAttribute('role', 'gridcell')
      cell.dataset.index = String(index)
      cell.append(createGhost('X'), createGhost('O'))

      cells.push(cell)
      rowElement.append(cell)
    }

    element.append(rowElement)
  }

  return { element, cells, focusIndex: 0 }
}

function renderCell(
  cell: HTMLButtonElement,
  index: number,
  view: BoardView,
  state: BoardRenderState,
): void {
  const mark = state.board[index] ?? null
  const isWinning = state.winningLine?.includes(index) ?? false
  const isAvailable = mark === null && state.isCellAvailable(index)

  cell.dataset.mark = mark ?? ''
  cell.dataset.available = String(isAvailable)
  cell.dataset.win = String(isWinning)
  cell.tabIndex = index === view.focusIndex ? 0 : -1
  cell.setAttribute('aria-disabled', String(!isAvailable))
  cell.setAttribute('aria-label', describeCell(index, mark, isWinning))

  const existingMark = cell.querySelector<HTMLSpanElement>('.cell__mark')
  const existingValue = existingMark?.dataset.mark ?? ''

  if (existingValue === (mark ?? '')) {
    return
  }

  existingMark?.remove()

  if (mark !== null) {
    const markElement = document.createElement('span')
    markElement.className = 'cell__mark'
    markElement.dataset.mark = mark
    markElement.textContent = mark
    markElement.setAttribute('aria-hidden', 'true')
    cell.append(markElement)
  }
}

export function renderBoard(view: BoardView, state: BoardRenderState): void {
  view.element.dataset.turn = state.turn
  view.element.setAttribute('aria-busy', String(state.isBusy))

  view.cells.forEach((cell, index) => {
    renderCell(cell, index, view, state)
  })
}

export function setFocusIndex(
  view: BoardView,
  index: number,
  focus: boolean,
): void {
  const clamped = Math.min(Math.max(index, 0), view.cells.length - 1)
  view.focusIndex = clamped

  view.cells.forEach((cell, position) => {
    cell.tabIndex = position === clamped ? 0 : -1
  })

  if (focus) {
    view.cells[clamped]?.focus()
  }
}
