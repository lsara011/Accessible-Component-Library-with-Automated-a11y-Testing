# Accessible Component Library with Automated a11y Testing

A React and TypeScript component workshop that combines Storybook, automated accessibility checks, keyboard interaction tests, and visual regression testing.

The purpose of this project is to make accessibility part of everyday frontend development: build a component, exercise its different states, detect barriers, and keep tests that catch regressions when the code changes. It is a learning project and a practical reference for bringing these checks into personal or client projects.

## What this project demonstrates

- Building reusable components with typed props and appropriate HTML semantics.
- Developing and reviewing component states in Storybook.
- Scanning rendered states with axe-core.
- Testing keyboard navigation and focus management in a real browser.
- Comparing screenshots with reviewed baselines.
- Checking light and dark themes through a shared toolbar.
- Running accessibility and visual suites on pull requests with GitHub Actions.

## Why use several kinds of tests?

| Check | What it helps detect | Example |
| --- | --- | --- |
| Accessibility scan | Missing names, labels, invalid ARIA, and some contrast failures | A Send button with no accessible name |
| Interaction test | Incorrect keyboard or focus behavior | Focus does not return to the opener after closing a modal |
| Visual regression test | Unexpected changes in appearance | A light-mode message becomes white text on a dark background |
| Manual review | Barriers automation cannot fully evaluate | Whether a screen reader announces new chat messages meaningfully |

A component can look correct while its controls have no accessible names. An accessibility scan can pass while the layout is broken. These checks cover different parts of the experience.

## Components and examples

| Component | Examples |
| --- | --- |
| Button and Button2 | Default, primary, disabled, and long-label states across the two components |
| ChatBubble | Sent and received messages, long messages, optional timestamps, photos, and light/dark themes |
| Modal | Native dialog semantics, initial focus, Tab containment, Escape dismissal, and focus restoration |
| Header, Footer, and Page | Navigation and page composition examples |

Some stories are educational examples rather than finished production components. Review their implementation before reusing them.

## Technology

| Tool | Purpose |
| --- | --- |
| React and TypeScript | Component implementation and typed props |
| Vite and Tailwind CSS v4 | Development tooling and styling |
| Storybook | Component examples, controls, documentation, and theme switching |
| axe-core through Storybook's accessibility addon | Automated accessibility scanning |
| Vitest with Playwright's browser provider | Browser-based story and interaction tests |
| Playwright Test | Screenshot comparisons and HTML reports |
| GitHub Actions | Pull-request checks and report artifacts |

## Getting started

Use Node.js 24 and npm to match CI. Run commands from the directory containing `package.json`.

~~~sh
npm ci
npx playwright install chromium
npm run storybook
~~~

Open [Storybook](http://localhost:6006), select a story, adjust its props in Controls, and inspect the Accessibility panel.

To run the React application separately:

~~~sh
npm run dev
~~~

Use the URL printed by Vite.

## Accessibility and interaction checks

Run the story suite once:

~~~sh
npm run test:a11y
~~~

Rerun affected stories while developing:

~~~sh
npx vitest --project storybook
~~~

The browser provider runs Chromium headlessly. Story `play` functions exercise interactions; accessibility checks inspect the resulting rendered state.

The default in [.storybook/preview.tsx](.storybook/preview.tsx) is:

~~~ts
a11y: {
  test: 'error',
}
~~~

Detected violations fail the story test. Educational stories can override this with `test: 'todo'`: findings remain reviewable but do not block the suite. Use `error` for a deliberate failing-PR demonstration.

The modal also has focused Playwright checks for keyboard navigation and focus restoration:

~~~sh
npm run build-storybook
node scripts/test-modal.mjs
~~~

## Light and dark mode

The paintbrush Theme button adds a `light` or `dark` class to the preview document. Tailwind's `dark:` styles respond to that class, and the canvas background changes with it.

- Regular stories follow the toolbar selection.
- ChatBubble's Light Mode and Dark Mode stories lock their theme for repeatable testing.
- Storybook's interface appearance is separate from the component theme.

Shared Tailwind configuration and fonts live in `src/index.css`. Component CSS files should not import another full copy of Tailwind.

## Visual regression checks

Build Storybook, then compare the current UI with committed screenshots:

~~~sh
npm run build-storybook
npm run test:visual
~~~

Playwright automatically starts a server for the static Storybook build on port 6006. Locally, it can reuse an existing server on that port. Stop a stale Storybook server to ensure the tests use the new build.

`all-components.spec.ts` reads the built story index and creates a visual test for each story. `chatbubble.spec.ts` also captures the bubble in its fixed light and dark themes. Rebuild Storybook after adding, removing, or renaming stories.

Open the report:

~~~sh
npx playwright show-report
~~~

For a failed comparison, the report shows:

| Image | Meaning |
| --- | --- |
| Expected | The previously reviewed and approved screenshot |
| Actual | The screenshot captured during the current run |
| Diff | Highlighted pixels that changed |

The report does not open automatically. Passing comparisons generally do not include failure comparison images.

### Updating baselines

For an intentional design change:

~~~sh
npm run build-storybook
npx playwright test --update-snapshots
~~~

Review and commit the PNGs in the tests' `*-snapshots` directories. Do not update snapshots just to silence an unexplained failure: an incorrect baseline preserves an incorrect design.

Existing baselines are Windows screenshots. Keep the OS, browser version, viewport, fonts, and content consistent. Other operating systems need separate reviewed baselines; renaming Windows images does not make them Linux baselines. Google Fonts also introduce a network dependency.

Generic visual tests do not guarantee that a story's `play` function has finished. Add explicit readiness assertions for important states, such as waiting for an open dialog, before capturing their screenshots.

## Continuous integration

[The Component quality workflow](.github/workflows/quality.yaml) runs on pull requests and pushes to `main`, with two independent checks:

| Check | Commands | Purpose |
| --- | --- | --- |
| a11y | `npm run test:a11y` | Run stories, interactions, and accessibility scans in Chromium |
| visual | `npm run build-storybook`, then `npm run test:visual` | Compare screenshots with committed baselines |

The workflow uses Windows 2025 runners and Node.js 24. It caches `node_modules` using an OS, architecture, Node version, and lockfile-based key, installs dependencies on cache misses, and cancels superseded runs. Each job has a ten-minute timeout; measure actual duration in GitHub Actions.

Visual reports and test results are uploaded as a `visual-report` artifact, including after failed visual tests, with 14-day retention. CI is configured not to create or update screenshot baselines.

### Making failures block merging

A failed workflow is not automatically a required merge gate. Configure an active GitHub branch ruleset for `main` requiring the `a11y` and `visual` status checks before merging. Repository rules are configured on GitHub, separately from this workflow.

### Evidence of the gate

The failing-PR screenshot has not been added yet. Complete the demonstration by:

1. Establishing a passing baseline on the default branch.
2. Opening a separate PR that removes a button's accessible name in a story checked with `test: 'error'`.
3. Confirming the check fails for the intended violation and required checks block merging.
4. Saving a screenshot of the actual failed check and blocked merge section as `docs/ci-blocked-pr.png`.
5. Embedding that image here and linking the demonstration PR. Close the deliberately broken PR without merging it.

Use a real GitHub screenshot as evidence, rather than a mockup or a local report.

## Project structure

~~~text
.github/workflows/quality.yaml   Pull-request checks
.storybook/                     Storybook, accessibility, and theme configuration
src/components/                 Modal implementation and styles
src/stories/                    Components, stories, and educational examples
src/index.css                   Shared Tailwind configuration and fonts
tests/visual/                   Visual tests and approved screenshot baselines
scripts/                        Focused browser-check scripts
playwright.config.ts            Visual-test browser, server, and reporter settings
vite.config.ts                  Vite and browser-based Vitest configuration
~~~

## Adding another component

1. Create the React component with typed props and appropriate HTML semantics.
2. Add a matching `.stories.ts` file, or `.stories.tsx` when the story contains JSX.
3. Include relevant states: disabled controls, errors, long content, and themes.
4. Add `play` functions and focused browser tests for interactions and focus behavior.
5. Run accessibility checks, build Storybook, and review visual baselines.
6. Commit the component, stories, tests, and approved snapshots together.

## Accessibility scope

This project demonstrates testing practices; it does not certify WCAG conformance. A passing automated suite means its checks passed, not that every user can complete every task.

Complement automation with keyboard-only testing, screen-reader testing, zoom and reflow checks, and review of meaningful labels, reading order, errors, and live announcements. Follow component checks with integration tests on the pages where the components are used.
