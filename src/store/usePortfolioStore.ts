import { create } from 'zustand'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { Layouts } from 'react-grid-layout'

const LAYOUTS_STORAGE_KEY = 'financial-dashboard-layouts'

const defaultLayouts: Layouts = {
  lg: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 3 },
    { i: 'news', x: 6, y: 0, w: 6, h: 3 },
    { i: 'allocation', x: 0, y: 3, w: 6, h: 3 },
  ],
  md: [
    { i: 'summary', x: 0, y: 0, w: 5, h: 3 },
    { i: 'news', x: 5, y: 0, w: 5, h: 3 },
    { i: 'allocation', x: 0, y: 3, w: 5, h: 3 },
  ],
  sm: [
    { i: 'summary', x: 0, y: 0, w: 6, h: 3 },
    { i: 'news', x: 0, y: 3, w: 6, h: 3 },
    { i: 'allocation', x: 0, y: 6, w: 6, h: 3 },
  ],
}

function loadLayouts(): Layouts {
  try {
    const stored = localStorage.getItem(LAYOUTS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // fall through to default
  }
  return defaultLayouts
}

interface PortfolioState {
  portfolios: Portfolio[]
  selectedPortfolioId: string
  layouts: Layouts
  selectPortfolio: (id: string) => void
  updatePortfolios: (portfolios: Portfolio[]) => void
  updateLayouts: (layouts: Layouts) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: mockPortfolios,
  selectedPortfolioId: mockPortfolios[0].id,
  layouts: loadLayouts(),
  selectPortfolio: (id) => set({ selectedPortfolioId: id }),
  updatePortfolios: (portfolios) => set({ portfolios }),
  updateLayouts: (layouts) => {
    localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(layouts))
    set({ layouts })
  },
}))
