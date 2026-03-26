# Financial Dashboard

Bloomberg-style multi-portfolio management dashboard built with React, TypeScript, and Electron.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ or v22+
- [pnpm](https://pnpm.io/) v10+

```bash
# Install pnpm if not already installed
npm install -g pnpm
```

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd financial-dashboard

# Install dependencies
pnpm install

# If Electron binary is missing
pnpm rebuild electron
```

## Development

```bash
# Desktop app (Electron)
pnpm dev

# Web-only (browser)
pnpm dev:web
```

## Build

```bash
# macOS
export CSC_IDENTITY_AUTO_DISCOVERY=false   # skip code signing for local builds
pnpm build:mac

# Windows
pnpm build:win

# Linux
pnpm build:linux
```

Build output is in the `release/` directory.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Desktop | Electron 41 |
| State | Zustand 5 (with persist middleware) |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 3 |
| Layout | react-grid-layout 2 |
| Data Fetching | TanStack Query 5 (pre-wired) |

## Features

- **Portfolio Switching** — dropdown to switch between US Growth and Asia Income portfolios
- **3 Widgets** — Portfolio Summary (holdings table + chart), Market News (with sentiment), Asset Allocation (donut chart)
- **Drag & Resize** — widgets can be dragged and resized from any edge or corner
- **Pop-Out Windows** — tear out any widget into a separate OS-level window (Bloomberg multi-monitor style)
- **Widget Manager** — show/hide widgets via dropdown
- **User Type Profiles** — separate saved layouts for Front Office and Back Office
- **Layout Persistence** — widget positions, sizes, and selected portfolio persist across sessions via Zustand persist middleware
- **Real-Time Simulation** — portfolio values and news update every 7 seconds
- **Skeleton Loading** — animated loading states on initial data fetch
- **Error Boundaries** — widget crashes are isolated with retry capability

## Project Structure

```
src/
  components/
    layout/          Dashboard grid, WidgetContainer, PopoutWindow
    widgets/         SummaryWidget, NewsWidget, AllocationWidget
    ui/              ErrorBoundary, Skeleton loaders
  store/             Zustand store with persist middleware
  hooks/             useMockRealtime
  data/              Client mock data + transformer
  types/             TypeScript interfaces
  utils/             Formatting + layout algorithms
electron/
  main.ts            Electron main process
  preload.ts         Secure context bridge
```
