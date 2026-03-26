import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { ResponsiveLayouts } from 'react-grid-layout'

export type UserType = 'front-office' | 'back-office'

type LayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

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

// --- Layout utility functions ---

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

function findAvailablePosition(
  existing: LayoutItem[],
  w: number,
  h: number,
  cols: number,
): { x: number; y: number } {
  const maxY = existing.reduce((max, item) => Math.max(max, item.y + item.h), 0)
  const gridHeight = maxY + h + 1
  const occupied: boolean[][] = Array.from({ length: gridHeight }, () => Array(cols).fill(false))
  for (const item of existing) {
    for (let row = item.y; row < item.y + item.h && row < gridHeight; row++) {
      for (let col = item.x; col < item.x + item.w && col < cols; col++) {
        occupied[row][col] = true
      }
    }
  }
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
    const { x, y } = findAvailablePosition(filtered, ref.w, ref.h, cols)
    result[bp] = [...filtered, { i: id, x, y, w: ref.w, h: ref.h, minW, minH }]
  }
  return result
}

// --- Store types ---

interface PersistedState {
  selectedPortfolioId: string
  userType: UserType
  visibleWidgets: string[]
  userLayouts: Record<UserType, ResponsiveLayouts>
}

interface PortfolioState extends PersistedState {
  portfolios: Portfolio[]
  layouts: ResponsiveLayouts
  poppedOutWidgets: string[]
  savedWidgetItems: Record<string, LayoutItem>
  isLoading: boolean
  selectPortfolio: (id: string) => void
  switchUserType: (userType: UserType) => void
  updatePortfolios: (portfolios: Portfolio[]) => void
  updateLayouts: (layouts: ResponsiveLayouts) => void
  setLoading: (loading: boolean) => void
  popOutWidget: (id: string) => void
  popInWidget: (id: string) => void
  toggleWidget: (id: string) => void
}

// --- Store ---

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      // Persisted state
      selectedPortfolioId: mockPortfolios[0].id,
      userType: 'front-office' as UserType,
      visibleWidgets: ['summary', 'news', 'allocation'],
      userLayouts: {
        'front-office': defaultLayouts,
        'back-office': defaultLayouts,
      },

      // Derived from persisted (set during rehydration via onRehydrateStorage)
      layouts: defaultLayouts,

      // Non-persisted (reset on refresh)
      portfolios: mockPortfolios,
      poppedOutWidgets: [],
      savedWidgetItems: {},
      isLoading: true,

      // Actions
      selectPortfolio: (id) => set({ selectedPortfolioId: id }),

      switchUserType: (userType) =>
        set((state) => {
          // Save current layouts under current user type, then load target
          const updatedUserLayouts = {
            ...state.userLayouts,
            [state.userType]: state.layouts,
          }
          const targetLayouts = ensureMinSizes(updatedUserLayouts[userType] ?? defaultLayouts)
          return {
            userType,
            userLayouts: updatedUserLayouts,
            layouts: targetLayouts,
            poppedOutWidgets: [],
            savedWidgetItems: {},
          }
        }),

      updatePortfolios: (portfolios) => set({ portfolios }),

      updateLayouts: (layouts) =>
        set((state) => {
          // Re-inject any popped-out/hidden widgets so they're not lost
          let fullLayouts = layouts
          for (const [id, savedItem] of Object.entries(state.savedWidgetItems)) {
            fullLayouts = injectWidgetIntoLayouts(fullLayouts, id, savedItem)
          }
          return {
            layouts,
            userLayouts: {
              ...state.userLayouts,
              [state.userType]: fullLayouts,
            },
          }
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      popOutWidget: (id) =>
        set((state) => {
          if (state.poppedOutWidgets.includes(id)) return state
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

      popInWidget: (id) =>
        set((state) => {
          const savedItem = state.savedWidgetItems[id] ?? null
          const newLayouts = injectWidgetIntoLayouts(state.layouts, id, savedItem)
          const remainingSaved = Object.fromEntries(
            Object.entries(state.savedWidgetItems).filter(([key]) => key !== id),
          )
          return {
            poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== id),
            savedWidgetItems: remainingSaved,
            layouts: newLayouts,
            userLayouts: {
              ...state.userLayouts,
              [state.userType]: newLayouts,
            },
          }
        }),

      toggleWidget: (id) =>
        set((state) => {
          const isCurrentlyVisible = state.visibleWidgets.includes(id)

          if (isCurrentlyVisible) {
            const firstBp = Object.keys(state.layouts)[0]
            const items = (state.layouts[firstBp] ?? []) as LayoutItem[]
            const widgetItem = items.find((item) => item.i === id) ?? null
            return {
              visibleWidgets: state.visibleWidgets.filter((w) => w !== id),
              poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== id),
              savedWidgetItems: {
                ...state.savedWidgetItems,
                ...(widgetItem ? { [id]: widgetItem } : {}),
              },
            }
          } else {
            const savedItem = state.savedWidgetItems[id] ?? null
            const newLayouts = injectWidgetIntoLayouts(state.layouts, id, savedItem)
            const remainingToggled = Object.fromEntries(
              Object.entries(state.savedWidgetItems).filter(([key]) => key !== id),
            )
            return {
              visibleWidgets: [...state.visibleWidgets, id],
              savedWidgetItems: remainingToggled,
              layouts: newLayouts,
              userLayouts: {
                ...state.userLayouts,
                [state.userType]: newLayouts,
              },
            }
          }
        }),
    }),
    {
      name: 'financial-dashboard',
      version: 6,
      // Only persist these fields — portfolios, poppedOutWidgets, etc. reset on refresh
      partialize: (state) => ({
        selectedPortfolioId: state.selectedPortfolioId,
        userType: state.userType,
        visibleWidgets: state.visibleWidgets,
        userLayouts: state.userLayouts,
      }),
      // After rehydration, sync `layouts` from the persisted `userLayouts`
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.layouts = ensureMinSizes(state.userLayouts[state.userType] ?? defaultLayouts)
        }
      },
      // Migration from older versions — just reset to defaults
      migrate: () => ({
        selectedPortfolioId: mockPortfolios[0].id,
        userType: 'front-office' as UserType,
        visibleWidgets: ['summary', 'news', 'allocation'],
        userLayouts: {
          'front-office': defaultLayouts,
          'back-office': defaultLayouts,
        },
      }),
    },
  ),
)
