# toi_writer

A minimal, focused Markdown writer for macOS. Built with Electron, React and TypeScript.

> Work in progress — see the roadmap below.

## Development

Requires Node.js and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev          # run the app with HMR
pnpm typecheck    # type-check main + renderer
pnpm lint
pnpm build:mac    # build a .dmg
```

## Roadmap

1. ~~Skeleton: window, themes, i18n (ES/EN)~~
2. ~~Editor (CodeMirror 6), typography~~
3. Files: open a folder, create / rename / delete, autosave ← _current_
4. Focus and typewriter modes
5. Word count and reading time
6. Preview and export (HTML / PDF)
7. Polish: icon, menu, shortcuts, `.dmg`
