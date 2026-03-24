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
- Widget grid layouts (persisted to localStorage)
- Widget visibility and pop-out state
- Loading state

**Widget System**: Widgets are defined in `WIDGET_CONFIG` in `Dashboard.tsx`. Each widget:
- Lives in `src/components/widgets/`
- Has a skeleton loader in `src/components/ui/Skeleton.tsx`
- Can be dragged, resized, hidden, or popped out to separate window
- Is wrapped in ErrorBoundary

**Real-time Simulation**: `useMockRealtime` hook updates portfolio values and rotates news headlines every 7 seconds using mock data from `src/data/mockData.ts`.

**Dual Mode**: Vite config supports both Electron and web-only builds via `WEB_ONLY` env var.

### Adding a New Widget
1. Create component in `src/components/widgets/`
2. Add skeleton to `src/components/ui/Skeleton.tsx`
3. Register in `WIDGET_CONFIG` in `Dashboard.tsx`
4. Add to `defaultLayouts` in store
5. Add to initial `visibleWidgets` array in store
