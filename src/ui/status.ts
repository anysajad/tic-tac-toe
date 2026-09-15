import type { Session } from '../state/session'

export type StatusTone =
  | 'turn-x'
  | 'turn-o'
  | 'thinking'
  | 'won-x'
  | 'won-o'
  | 'draw'

export type Status = {
  readonly eyebrow: string
  readonly value: string
  readonly tone: StatusTone
}

export function deriveStatus(session: Session): Status {
  const { game, mode } = session

  if (game.status === 'draw') {
    return { eyebrow: 'Result', value: 'Draw', tone: 'draw' }
  }

  if (game.status === 'won' && game.winner !== null) {
    if (mode === 'ai') {
      return game.winner === 'X'
        ? { eyebrow: 'Result', value: 'You win', tone: 'won-x' }
        : { eyebrow: 'Result', value: 'Computer wins', tone: 'won-o' }
    }

    return game.winner === 'X'
      ? { eyebrow: 'Result', value: 'X wins', tone: 'won-x' }
      : { eyebrow: 'Result', value: 'O wins', tone: 'won-o' }
  }

  if (mode === 'ai') {
    return game.turn === 'X'
      ? { eyebrow: 'Turn', value: 'Your turn', tone: 'turn-x' }
      : { eyebrow: 'Turn', value: 'Computer is thinking', tone: 'thinking' }
  }

  return game.turn === 'X'
    ? { eyebrow: 'Turn', value: "X's turn", tone: 'turn-x' }
    : { eyebrow: 'Turn', value: "O's turn", tone: 'turn-o' }
}

export type StatusView = {
  readonly element: HTMLParagraphElement
  readonly eyebrow: HTMLSpanElement
  readonly value: HTMLSpanElement
}

export function createStatus(): StatusView {
  const element = document.createElement('p')
  element.className = 'status'
  element.setAttribute('role', 'status')
  element.setAttribute('aria-live', 'polite')

  const eyebrow = document.createElement('span')
  eyebrow.className = 'status__eyebrow'
  const value = document.createElement('span')
  value.className = 'status__value'

  element.append(eyebrow, value)

  return { element, eyebrow, value }
}

export function renderStatus(view: StatusView, status: Status): void {
  view.eyebrow.textContent = status.eyebrow
  view.value.textContent = status.value
  view.element.dataset.tone = status.tone
}
