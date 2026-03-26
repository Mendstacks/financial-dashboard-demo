import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { ResponsiveLayouts } from 'react-grid-layout'
import {
  type LayoutItem,
  defaultLayouts,
  ensureMinSizes,
  injectWidgetIntoLayouts,
} from '../utils/layout'

export type UserType = 'front-office' | 'back-office'

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

      // Derived from persisted (synced via onRehydrateStorage)
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
      partialize: (state) => ({
        selectedPortfolioId: state.selectedPortfolioId,
        userType: state.userType,
        visibleWidgets: state.visibleWidgets,
        userLayouts: state.userLayouts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.layouts = ensureMinSizes(state.userLayouts[state.userType] ?? defaultLayouts)
        }
      },
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
