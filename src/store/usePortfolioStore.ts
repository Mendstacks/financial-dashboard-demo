import { create } from 'zustand'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { ResponsiveLayouts } from 'react-grid-layout'

const LAYOUTS_STORAGE_KEY = 'financial-dashboard-layouts'
const LAYOUTS_VERSION_KEY = 'financial-dashboard-layouts-version'
const SELECTED_PORTFOLIO_KEY = 'financial-dashboard-selected-portfolio'
const CURRENT_LAYOUT_VERSION = 4

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number }

const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: 'summary', x: 0, y: 0, w: 7, h: 6, minW: 4, minH: 4 },
    { i: 'news', x: 7, y: 0, w: 5, h: 3, minW: 3, minH: 3 },
    { i: 'allocation', x: 7, y: 3, w: 5, h: 3, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'news', x: 6, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
    { i: 'allocation', x: 6, y: 3, w: 4, h: 3, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 4 },
    { i: 'news', x: 0, y: 5, w: 6, h: 3, minW: 2, minH: 3 },
    { i: 'allocation', x: 0, y: 8, w: 6, h: 3, minW: 2, minH: 3 },
  ],
}

function getMinSizes(id: string) {
  const isSummary = id === 'summary'
  return { minW: isSummary ? 4 : 3, minH: isSummary ? 4 : 3 }
}

function ensureMinSizes(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    result[bp] = (items as LayoutItem[]).map((item) => {
      const { minW, minH } = getMinSizes(item.i)
      return {
        ...item,
        w: Math.max(item.w, minW),
        h: Math.max(item.h, minH),
        minW: item.minW ?? minW,
        minH: item.minH ?? minH,
      }
    })
  }
  return result
}

function getDefaultItemForWidget(id: string): LayoutItem {
  const lgItem = (defaultLayouts.lg as LayoutItem[]).find((d) => d.i === id)
  return lgItem ?? { i: id, x: 0, y: 0, w: 5, h: 3, ...getMinSizes(id) }
}

const BREAKPOINT_COLS: Record<string, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

function findAvailablePosition(existing: LayoutItem[], w: number, h: number, cols: number): { x: number; y: number } {
  // Build a grid occupancy map
  const maxY = existing.reduce((max, item) => Math.max(max, item.y + item.h), 0)
  const gridHeight = maxY + h + 1

  // Create occupied grid
  const occupied: boolean[][] = Array.from({ length: gridHeight }, () => Array(cols).fill(false))
  for (const item of existing) {
    for (let row = item.y; row < item.y + item.h && row < gridHeight; row++) {
      for (let col = item.x; col < item.x + item.w && col < cols; col++) {
        occupied[row][col] = true
      }
    }
  }

  // Scan top-to-bottom, left-to-right for first position that fits
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col <= cols - w; col++) {
      let fits = true
      for (let dy = 0; dy < h && fits; dy++) {
        for (let dx = 0; dx < w && fits; dx++) {
          if (row + dy >= gridHeight || occupied[row + dy][col + dx]) {
            fits = false
          }
        }
      }
      if (fits) return { x: col, y: row }
    }
  }

  // No space found — place at bottom
  return { x: 0, y: maxY }
}

function injectWidgetIntoLayouts(
  currentLayouts: ResponsiveLayouts,
  id: string,
  savedItem: LayoutItem | null,
): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(currentLayouts)) {
    const filtered = (items as LayoutItem[]).filter((item) => item.i !== id)
    const { minW, minH } = getMinSizes(id)
    const ref = savedItem ?? getDefaultItemForWidget(id)
    const cols = BREAKPOINT_COLS[bp] ?? 12

    // Find first available position that fits this widget
    const { x, y } = findAvailablePosition(filtered, ref.w, ref.h, cols)

    result[bp] = [
      ...filtered,
      { i: id, x, y, w: ref.w, h: ref.h, minW, minH },
    ]
  }
  return result
}

function loadLayouts(): ResponsiveLayouts {
  try {
    const version = Number(localStorage.getItem(LAYOUTS_VERSION_KEY) ?? 0)
    if (version < CURRENT_LAYOUT_VERSION) {
      localStorage.removeItem(LAYOUTS_STORAGE_KEY)
      localStorage.setItem(LAYOUTS_VERSION_KEY, String(CURRENT_LAYOUT_VERSION))
      return defaultLayouts
    }
    const stored = localStorage.getItem(LAYOUTS_STORAGE_KEY)
    if (stored) return ensureMinSizes(JSON.parse(stored))
  } catch {
    // fall through to default
  }
  return defaultLayouts
}

interface PortfolioState {
  portfolios: Portfolio[]
  selectedPortfolioId: string
  layouts: ResponsiveLayouts
  poppedOutWidgets: string[]
  savedWidgetItems: Record<string, LayoutItem>
  visibleWidgets: string[]
  isLoading: boolean
  selectPortfolio: (id: string) => void
  updatePortfolios: (portfolios: Portfolio[]) => void
  updateLayouts: (layouts: ResponsiveLayouts) => void
  setLoading: (loading: boolean) => void
  popOutWidget: (id: string) => void
  popInWidget: (id: string) => void
  toggleWidget: (id: string) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: mockPortfolios,
  selectedPortfolioId: localStorage.getItem(SELECTED_PORTFOLIO_KEY) ?? mockPortfolios[0].id,
  layouts: loadLayouts(),
  poppedOutWidgets: [],
  savedWidgetItems: {},
  visibleWidgets: ['summary', 'news', 'allocation'],
  isLoading: true,
  selectPortfolio: (id) => {
    localStorage.setItem(SELECTED_PORTFOLIO_KEY, id)
    set({ selectedPortfolioId: id })
  },
  updatePortfolios: (portfolios) => set({ portfolios }),
  updateLayouts: (layouts) => {
    // When saving, re-inject any popped-out/hidden widgets so they're not lost
    const state = usePortfolioStore.getState()
    let fullLayouts = layouts
    for (const [id, savedItem] of Object.entries(state.savedWidgetItems)) {
      fullLayouts = injectWidgetIntoLayouts(fullLayouts, id, savedItem)
    }
    localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(fullLayouts))
    set({ layouts })
  },
  setLoading: (loading) => set({ isLoading: loading }),

  // Bug 1 fix: save widget's layout ITEM (not full snapshot) before pop-out
  popOutWidget: (id) =>
    set((state) => {
      if (state.poppedOutWidgets.includes(id)) return state
      // Save this widget's layout item from the first available breakpoint
      const firstBp = Object.keys(state.layouts)[0]
      const items = (state.layouts[firstBp] ?? []) as LayoutItem[]
      const widgetItem = items.find((item) => item.i === id) ?? null

      return {
        poppedOutWidgets: [...state.poppedOutWidgets, id],
        savedWidgetItems: {
          ...state.savedWidgetItems,
          ...(widgetItem ? { [id]: widgetItem } : {}),
        },
      }
    }),

  // Bug 1 fix: inject widget into CURRENT layout (don't replace entire layout)
  popInWidget: (id) =>
    set((state) => {
      const savedItem = state.savedWidgetItems[id] ?? null
      const newLayouts = injectWidgetIntoLayouts(state.layouts, id, savedItem)
      const remainingSaved = Object.fromEntries(
        Object.entries(state.savedWidgetItems).filter(([key]) => key !== id),
      )

      localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(newLayouts))
      return {
        poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== id),
        savedWidgetItems: remainingSaved,
        layouts: newLayouts,
      }
    }),

  toggleWidget: (id) =>
    set((state) => {
      const isCurrentlyVisible = state.visibleWidgets.includes(id)

      if (isCurrentlyVisible) {
        // Hiding widget — save its layout item and also close pop-out if open (Bug 2 fix)
        const firstBp = Object.keys(state.layouts)[0]
        const items = (state.layouts[firstBp] ?? []) as LayoutItem[]
        const widgetItem = items.find((item) => item.i === id) ?? null

        return {
          visibleWidgets: state.visibleWidgets.filter((w) => w !== id),
          poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== id), // Bug 2: close pop-out
          savedWidgetItems: {
            ...state.savedWidgetItems,
            ...(widgetItem ? { [id]: widgetItem } : {}),
          },
        }
      } else {
        // Showing widget — restore its saved layout item (Bug 3 fix)
        const savedItem = state.savedWidgetItems[id] ?? null
        const newLayouts = injectWidgetIntoLayouts(state.layouts, id, savedItem)
        const remainingToggled = Object.fromEntries(
          Object.entries(state.savedWidgetItems).filter(([key]) => key !== id),
        )

        localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(newLayouts))
        return {
          visibleWidgets: [...state.visibleWidgets, id],
          savedWidgetItems: remainingToggled,
          layouts: newLayouts,
        }
      }
    }),
}))
