import './showcase.css'

type Swatch = { name: string; token: string; surface?: boolean }

const surfaceSwatches: Swatch[] = [
  { name: 'Background', token: '--color-bg' },
  { name: 'Surface', token: '--color-surface' },
  { name: 'Elevated surface', token: '--color-surface-elevated' },
  { name: 'Sunken surface', token: '--color-surface-sunken' },
  { name: 'Border', token: '--color-border' },
]

const stateSwatches: Swatch[] = [
  { name: 'Accent', token: '--color-accent' },
  { name: 'Accent soft', token: '--color-accent-soft' },
  { name: 'On accent', token: '--color-on-accent' },
  { name: 'X', token: '--color-x' },
  { name: 'O', token: '--color-o' },
  { name: 'Win', token: '--color-win' },
  { name: 'Win soft', token: '--color-win-soft' },
  { name: 'Draw', token: '--color-draw' },
]

const textSamples = ['--color-text', '--color-text-secondary', '--color-text-muted']

const typeSamples: { label: string; className: string }[] = [
  { label: 'Display / 40 / 600', className: 'dev-type__display' },
  { label: 'Title / 28 / 600', className: 'dev-type__title' },
  { label: 'Heading / 20 / 600', className: 'dev-type__heading' },
  { label: 'Body / 17 / 400', className: 'dev-type__body' },
  { label: 'Label / 13 / 600 / wide', className: 'dev-type__label' },
  { label: 'Caption / 13 / 400', className: 'dev-type__caption' },
]

const spaceSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const radiusTokens = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-full',
]

function renderSwatch({ name, token }: Swatch): string {
  return `
    <div class="dev-swatch">
      <div class="dev-swatch__chip" style="background: var(${token})"></div>
      <div class="dev-swatch__name">${name}</div>
      <div class="dev-swatch__token">${token}</div>
    </div>
  `
}

function renderSwatches(swatches: Swatch[]): string {
  return swatches.map(renderSwatch).join('')
}

function renderTextSamples(): string {
  return textSamples
    .map(
      (token) => `
        <div class="dev-type__row">
          <span style="color: var(${token})">The quick brown fox jumps over the lazy dog.</span>
          <span class="dev-type__meta">${token}</span>
        </div>
      `,
    )
    .join('')
}

function renderTypeSamples(): string {
  return typeSamples
    .map(
      ({ label, className }) => `
        <div class="dev-type__row">
          <span class="${className}">Tic Tac Toe</span>
          <span class="dev-type__meta">${label}</span>
        </div>
      `,
    )
    .join('')
}

function renderSpacing(): string {
  return spaceSteps
    .map(
      (step) => `
        <div class="dev-space__row">
          <span class="dev-space__label">--space-${step}</span>
          <span class="dev-space__bar" style="width: var(--space-${step})"></span>
        </div>
      `,
    )
    .join('')
}

function renderRadii(): string {
  return radiusTokens
    .map(
      (token) => `
        <div class="dev-radius">
          <div class="dev-radius__box" style="border-radius: var(${token})"></div>
          <span>${token}</span>
        </div>
      `,
    )
    .join('')
}

export function mountDesignShowcase(root: HTMLElement): void {
  root.innerHTML = `
    <main class="dev-showcase">
      <header class="dev-showcase__header">
        <span class="dev-showcase__eyebrow">Development only</span>
        <h1>Design foundation</h1>
        <p class="dev-showcase__note">
          Token reference for the Quiet Precision design language. Toggle your
          operating system appearance to inspect the light and dark themes. This
          page is excluded from production builds.
        </p>
      </header>

      <section class="dev-section">
        <h2 class="dev-section__title">Surfaces</h2>
        <div class="dev-swatches">${renderSwatches(surfaceSwatches)}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Text</h2>
        <div class="dev-type">${renderTextSamples()}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Accent, marks &amp; states</h2>
        <div class="dev-swatches">${renderSwatches(stateSwatches)}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Typography</h2>
        <div class="dev-type">${renderTypeSamples()}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Spacing</h2>
        <div class="dev-space">${renderSpacing()}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Radius</h2>
        <div class="dev-radii">${renderRadii()}</div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Elevation</h2>
        <div class="dev-elevations">
          <div class="dev-elevation dev-elevation--1">--shadow-1</div>
          <div class="dev-elevation dev-elevation--2">--shadow-2</div>
          <div class="dev-elevation dev-elevation--3">--shadow-3</div>
        </div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Focus &amp; controls</h2>
        <div class="dev-controls">
          <button class="dev-button" type="button">Primary</button>
          <button class="dev-button dev-button--quiet" type="button">Secondary</button>
        </div>
      </section>

      <section class="dev-section">
        <h2 class="dev-section__title">Motion</h2>
        <div class="dev-motion">
          <p class="dev-showcase__note">Hover the track to preview the base easing.</p>
          <div class="dev-motion__track">
            <div class="dev-motion__dot"></div>
          </div>
        </div>
      </section>
    </main>
  `
}
