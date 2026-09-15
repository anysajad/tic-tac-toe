import type { GameMode } from '../state/session'

export type ModeSelectorView = {
  readonly element: HTMLDivElement
  readonly inputs: Readonly<Record<GameMode, HTMLInputElement>>
}

const OPTIONS: readonly { mode: GameMode; label: string }[] = [
  { mode: 'ai', label: 'AI / Computer' },
  { mode: 'two-player', label: 'Two Players' },
]

export function createModeSelector(): ModeSelectorView {
  const element = document.createElement('div')
  element.className = 'mode-selector'
  element.setAttribute('role', 'radiogroup')
  element.setAttribute('aria-label', 'Game mode')

  const inputs = {} as Record<GameMode, HTMLInputElement>

  for (const { mode, label } of OPTIONS) {
    const option = document.createElement('label')
    option.className = 'mode-selector__option'

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'game-mode'
    input.value = mode
    input.className = 'mode-selector__input'

    const text = document.createElement('span')
    text.className = 'mode-selector__label'
    text.textContent = label

    option.append(input, text)
    element.append(option)
    inputs[mode] = input
  }

  return { element, inputs }
}

export function renderModeSelector(view: ModeSelectorView, mode: GameMode): void {
  view.inputs[mode].checked = true
}
