import { create } from 'zustand'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { ResponsiveLayouts } from 'react-grid-layout'

const LAYOUTS_STORAGE_KEY = 'financial-dashboard-layouts'

const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 3, minW: 3, minH: 3 },
    { i: 'news', x: 6, y: 0, w: 6, h: 3, minW: 3, minH: 3 },
    { i: 'allocation', x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'summary', x: 0, y: 0, w: 5, h: 3, minW: 3, minH: 3 },
    { i: 'news', x: 5, y: 0, w: 5, h: 3, minW: 3, minH: 3 },
    { i: 'allocation', x: 0, y: 3, w: 5, h: 3, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 3, minW: 2, minH: 3 },
    { i: 'news', x: 0, y: 3, w: 6, h: 3, minW: 2, minH: 3 },
    { i: 'allocation', x: 0, y: 6, w: 6, h: 3, minW: 2, minH: 3 },
  ],
}

function ensureMinSizes(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    result[bp] = (items as Array<{ i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number }>).map((item) => ({
      ...item,
      w: Math.max(item.w, 3),
      h: Math.max(item.h, 3),
      minW: item.minW ?? 3,
      minH: item.minH ?? 3,
    }))
  }
  return result
}

function loadLayouts(): ResponsiveLayouts {
  try {
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
  selectedPortfolioId: mockPortfolios[0].id,
  layouts: loadLayouts(),
  poppedOutWidgets: [],
  visibleWidgets: ['summary', 'news', 'allocation'],
  isLoading: true,
  selectPortfolio: (id) => set({ selectedPortfolioId: id }),
  updatePortfolios: (portfolios) => set({ portfolios }),
  updateLayouts: (layouts) => {
    localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(layouts))
    set({ layouts })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  popOutWidget: (id) =>
    set((state) =>
      state.poppedOutWidgets.includes(id)
        ? state
        : { poppedOutWidgets: [...state.poppedOutWidgets, id] },
    ),
  popInWidget: (id) =>
    set((state) => {
      // Restore default layout size for the returning widget
      const restoredLayouts: ResponsiveLayouts = {}
      for (const [bp, items] of Object.entries(state.layouts)) {
        const defaultItems = (defaultLayouts[bp] ?? []) as Array<{ i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number }>
        const defaultItem = defaultItems.find((d) => d.i === id)
        const existing = (items as Array<{ i: string; x: number; y: number; w: number; h: number }>).find((item) => item.i === id)

        if (existing && existing.w >= 3 && existing.h >= 3) {
          // Already has a good size, keep as is
          restoredLayouts[bp] = items
        } else {
          // Widget is missing or too small — inject default size
          const filtered = (items as Array<{ i: string; x: number; y: number; w: number; h: number }>).filter((item) => item.i !== id)
          const restored = defaultItem ?? { i: id, x: 0, y: 100, w: 6, h: 3, minW: 3, minH: 3 }
          restoredLayouts[bp] = [...filtered, restored]
        }
      }

      localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(restoredLayouts))
      return {
        poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== id),
        layouts: restoredLayouts,
      }
    }),
  toggleWidget: (id) =>
    set((state) => ({
      visibleWidgets: state.visibleWidgets.includes(id)
        ? state.visibleWidgets.filter((w) => w !== id)
        : [...state.visibleWidgets, id],
    })),
}))
