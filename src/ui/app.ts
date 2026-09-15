import {
  beginAiThinking,
  canAiPlay,
  canHumanPlay,
  createSession,
  isCellPlayable,
  playAiMove,
  playHumanMove,
  restart,
  setMode,
  type GameMode,
  type Session,
} from '../state/session'
import { createStore } from '../state/store'
import {
  createBoard,
  nextFocusIndex,
  renderBoard,
  setFocusIndex,
} from './board'
import { createModeSelector, renderModeSelector } from './mode-selector'
import { createStatus, deriveStatus, renderStatus } from './status'

const NAVIGATION_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
])

export function mountApp(appRoot: HTMLElement): void {
  appRoot.classList.add('app')

  const store = createStore(createSession())
  let aiGeneration = 0

  const header = document.createElement('header')
  header.className = 'app__header'

  const title = document.createElement('h1')
  title.className = 'app__title'
  title.textContent = 'Tic Tac Toe'

  const modeSelector = createModeSelector()
  header.append(title, modeSelector.element)

  const main = document.createElement('main')
  main.className = 'app__main'

  const status = createStatus()
  const board = createBoard()
  main.append(status.element, board.element)

  const footer = document.createElement('footer')
  footer.className = 'app__footer'

  const restartButton = document.createElement('button')
  restartButton.type = 'button'
  restartButton.className = 'action'

  const hint = document.createElement('p')
  hint.className = 'app__hint'
  hint.textContent = 'Arrow keys move. Enter or Space places a mark.'

  footer.append(restartButton, hint)

  appRoot.append(header, main, footer)

  const render = (session: Session): void => {
    renderBoard(board, {
      board: session.game.board,
      winningLine: session.game.winningLine,
      turn: session.game.turn,
      isCellAvailable: (index) => isCellPlayable(session, index),
      isBusy: session.isAiThinking,
    })
    renderStatus(status, deriveStatus(session))
    renderModeSelector(modeSelector, session.mode)

    restartButton.textContent =
      session.game.status === 'playing' ? 'New game' : 'Play again'

    appRoot.dataset.mode = session.mode
    appRoot.dataset.turn = session.game.turn
    appRoot.dataset.status = session.game.status
    appRoot.dataset.thinking = String(session.isAiThinking)
    appRoot.dataset.ambient =
      session.game.status === 'playing' ? session.game.turn.toLowerCase() : 'none'
  }

  const scheduleAiMove = (): void => {
    const scheduled = store.get()

    if (!canAiPlay(scheduled)) {
      return
    }

    const scheduledGame = scheduled.game
    const generation = (aiGeneration += 1)

    store.set(beginAiThinking(scheduled))

    requestAnimationFrame(() => {
      if (generation !== aiGeneration) {
        return
      }

      const session = store.get()

      if (session.game !== scheduledGame) {
        return
      }

      const next = playAiMove(session)

      if (next !== session) {
        store.set(next)
      } else if (session.isAiThinking) {
        store.set({ ...session, isAiThinking: false })
      }
    })
  }

  const activateCell = (index: number): void => {
    const session = store.get()

    if (!canHumanPlay(session)) {
      return
    }

    const next = playHumanMove(session, index)

    if (next === session) {
      return
    }

    store.set(next)
    scheduleAiMove()
  }

  board.element.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const cell = target.closest<HTMLButtonElement>('.cell')

    if (!cell) {
      return
    }

    const index = Number(cell.dataset.index)

    if (!Number.isInteger(index)) {
      return
    }

    setFocusIndex(board, index, false)
    activateCell(index)
  })

  board.element.addEventListener('keydown', (event) => {
    if (!NAVIGATION_KEYS.has(event.key)) {
      return
    }

    event.preventDefault()
    setFocusIndex(board, nextFocusIndex(board.focusIndex, event.key), true)
  })

  modeSelector.element.addEventListener('change', (event) => {
    const target = event.target

    if (!(target instanceof HTMLInputElement) || !target.checked) {
      return
    }

    aiGeneration += 1
    setFocusIndex(board, 0, false)
    store.set(setMode(store.get(), target.value as GameMode))
  })

  restartButton.addEventListener('click', () => {
    aiGeneration += 1
    store.set(restart(store.get()))
  })

  store.subscribe(render)
  render(store.get())
}
