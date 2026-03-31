# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Electron app with hot reload
pnpm dev:web      # Start web-only mode (no Electron)
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint
pnpm build:mac    # Build macOS distributable
pnpm build:win    # Build Windows distributable
pnpm build:linux  # Build Linux distributable
```

## Architecture

Bloomberg-style financial dashboard built as an Electron + React app with web fallback.

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS 4 with custom terminal theme (`--color-terminal-*` in `src/index.css`)
- Zustand for state management
- react-grid-layout for draggable/resizable widget grid
- Recharts for charts

### Key Patterns

**State Management**: Single Zustand store at `src/store/usePortfolioStore.ts` manages:
- Portfolio data and selection
- Widget instances (`widgetInstances: Record<instanceId, WidgetInstance>`)
- Widget grid layouts (persisted to localStorage)
- Widget pop-out state
- Loading state

**Widget System**: Plugin-style architecture with a centralized registry.
- Widget types are defined in `src/widgets/defaults.ts` (metadata) and `src/widgets/registry.ts` (components + prop resolution)
- Multiple instances of the same widget type are supported
- Each instance has a unique ID (`{type}-{suffix}`), can be renamed, duplicated, or removed
- Widget components live in `src/components/widgets/` with skeletons in `src/components/ui/Skeleton.tsx`
- Dashboard (`src/components/layout/Dashboard.tsx`) is fully generic — driven by registry + instances
- Widgets can be dragged, resized, popped out to a separate window, or removed via overflow menu
- Closing a pop-out window returns the widget to the grid (pop-in); removal is a separate action via the `⋯` menu

**Real-time Simulation**: `useMockRealtime` hook updates portfolio values and rotates news headlines every 7 seconds using mock data from `src/data/mockData.ts`.

**Dual Mode**: Vite config supports both Electron and web-only builds via `WEB_ONLY` env var.

### Adding a New Widget
1. Create component in `src/components/widgets/`
2. Add skeleton to `src/components/ui/Skeleton.tsx`
3. Add a `WidgetTypeMeta` entry to `src/widgets/defaults.ts`
4. Add a `WidgetRegistryEntry` to `src/widgets/registry.ts`
5. Done — no changes to Dashboard, store, or layout code needed
