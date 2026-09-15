# Tic Tac Toe

A premium, local-first Tic Tac Toe web game with a calm, refined interface designed around the "Quiet Precision" visual direction.

## Status

MVP complete. The game is fully playable, responsive, accessible, and tested. No further features are planned for the MVP scope.

## Modes

- **AI / Computer** — Play as X against a deterministic, unbeatable Minimax AI playing as O. X always starts.
- **Two Players** — Two people play locally on the same device, alternating X and O.

Switching modes starts a fresh game.

## Features

- Deterministic Minimax opponent that cannot be beaten
- Responsive layout from small mobile to desktop
- Light and dark themes following the system preference
- Keyboard support with roving focus and arrow-key navigation across the board
- Accessible semantics, live status announcements, visible focus, and reduced-motion support
- Local-first: no backend, no accounts, and no network requests

## Tech Stack

- Vite
- Vanilla TypeScript (no UI framework)
- Plain CSS with custom-property design tokens
- Vitest for unit tests
- Zero runtime dependencies

The game rules and AI are implemented as a pure, dependency-free domain layer, kept separate from the session and UI code.

## Development

```bash
npm install      # install dev dependencies
npm run dev      # start the development server
npm test         # run the unit tests
npm run typecheck # type-check with the TypeScript compiler
npm run build    # type-check and create a production build in dist/
npm run preview  # serve the production build locally
```

## Scope and Constraints

- Local-first single-page application; no backend, database, or authentication
- No persistence, accounts, sound, haptics, or networked multiplayer
- No external fonts or runtime libraries

## License

No license has been defined for this project yet.
