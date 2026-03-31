import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Portfolio } from '../types/portfolio'
import { mockPortfolios } from '../data/mockData'
import type { ResponsiveLayouts } from 'react-grid-layout'
import type { WidgetInstance } from '../widgets/types'
import {
  WIDGET_TYPE_META,
  INITIAL_INSTANCES,
  generateInstanceId,
  extractWidgetType,
  getAutoTitle,
} from '../widgets/defaults'
import {
  type LayoutItem,
  defaultLayouts,
  ensureMinSizes,
  injectWidgetIntoLayouts,
  createLayoutsForNewInstance,
} from '../utils/layout'

export type UserType = 'front-office' | 'back-office'

interface PersistedState {
  selectedPortfolioId: string
  userType: UserType
  widgetInstances: Record<string, WidgetInstance>
  userLayouts: Record<UserType, ResponsiveLayouts>
  poppedOutWidgets: string[]
  savedWidgetItems: Record<string, LayoutItem>
}

interface PortfolioState extends PersistedState {
  portfolios: Portfolio[]
  layouts: ResponsiveLayouts
  isLoading: boolean
  lastAddedInstanceId: string | null
  selectPortfolio: (id: string) => void
  switchUserType: (userType: UserType) => void
  updatePortfolios: (portfolios: Portfolio[]) => void
  updateLayouts: (layouts: ResponsiveLayouts) => void
  setLoading: (loading: boolean) => void
  popOutWidget: (id: string) => void
  popInWidget: (id: string) => void
  addWidgetInstance: (type: string) => void
  removeWidgetInstance: (instanceId: string) => void
  renameWidgetInstance: (instanceId: string, newTitle: string) => void
  duplicateWidgetInstance: (instanceId: string) => void
  clearLastAdded: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      // Persisted state
      selectedPortfolioId: mockPortfolios[0].id,
      userType: 'front-office' as UserType,
      widgetInstances: INITIAL_INSTANCES,
      userLayouts: {
        'front-office': defaultLayouts,
        'back-office': defaultLayouts,
      },

      poppedOutWidgets: [],
      savedWidgetItems: {},

      // Transient UI state
      lastAddedInstanceId: null,

      // Derived from persisted (synced via onRehydrateStorage)
      layouts: defaultLayouts,

      // Non-persisted
      portfolios: mockPortfolios,
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
            const type = extractWidgetType(id)
            const minSize = WIDGET_TYPE_META[type]?.minSize ?? { minW: 3, minH: 3 }
            fullLayouts = injectWidgetIntoLayouts(fullLayouts, id, savedItem, minSize)
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
          const type = extractWidgetType(id)
          const minSize = WIDGET_TYPE_META[type]?.minSize ?? { minW: 3, minH: 3 }
          const newLayouts = injectWidgetIntoLayouts(state.layouts, id, savedItem, minSize)
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

      addWidgetInstance: (type) =>
        set((state) => {
          const meta = WIDGET_TYPE_META[type]
          if (!meta) return state
          const instanceId = generateInstanceId(type)
          const title = getAutoTitle(type, state.widgetInstances)
          const newInstance: WidgetInstance = { instanceId, type, title }
          const newLayouts = createLayoutsForNewInstance(
            instanceId,
            meta.defaultSize,
            meta.minSize,
            state.layouts,
          )
          return {
            widgetInstances: { ...state.widgetInstances, [instanceId]: newInstance },
            layouts: newLayouts,
            lastAddedInstanceId: instanceId,
            userLayouts: {
              ...state.userLayouts,
              [state.userType]: newLayouts,
            },
          }
        }),

      removeWidgetInstance: (instanceId) =>
        set((state) => {
          const remainingInstances = Object.fromEntries(
            Object.entries(state.widgetInstances).filter(([key]) => key !== instanceId),
          )
          // Remove from all breakpoint layouts
          const newLayouts: ResponsiveLayouts = {}
          for (const [bp, items] of Object.entries(state.layouts)) {
            newLayouts[bp] = (items as LayoutItem[]).filter((item) => item.i !== instanceId)
          }
          const newUserLayouts: ResponsiveLayouts = {}
          for (const [bp, items] of Object.entries(state.userLayouts[state.userType] ?? {})) {
            newUserLayouts[bp] = (items as LayoutItem[]).filter((item) => item.i !== instanceId)
          }
          const remainingSaved = Object.fromEntries(
            Object.entries(state.savedWidgetItems).filter(([key]) => key !== instanceId),
          )
          return {
            widgetInstances: remainingInstances,
            poppedOutWidgets: state.poppedOutWidgets.filter((w) => w !== instanceId),
            savedWidgetItems: remainingSaved,
            layouts: newLayouts,
            userLayouts: {
              ...state.userLayouts,
              [state.userType]: newUserLayouts,
            },
          }
        }),

      renameWidgetInstance: (instanceId, newTitle) =>
        set((state) => {
          const instance = state.widgetInstances[instanceId]
          if (!instance) return state
          const trimmed = newTitle.trim()
          return {
            widgetInstances: {
              ...state.widgetInstances,
              [instanceId]: { ...instance, title: trimmed || instance.title },
            },
          }
        }),

      duplicateWidgetInstance: (instanceId) =>
        set((state) => {
          const original = state.widgetInstances[instanceId]
          if (!original) return state
          const meta = WIDGET_TYPE_META[original.type]
          if (!meta) return state
          const newInstanceId = generateInstanceId(original.type)
          const title = getAutoTitle(original.type, state.widgetInstances)
          const newInstance: WidgetInstance = { instanceId: newInstanceId, type: original.type, title }
          const newLayouts = createLayoutsForNewInstance(
            newInstanceId,
            meta.defaultSize,
            meta.minSize,
            state.layouts,
          )
          return {
            widgetInstances: { ...state.widgetInstances, [newInstanceId]: newInstance },
            layouts: newLayouts,
            lastAddedInstanceId: newInstanceId,
            userLayouts: {
              ...state.userLayouts,
              [state.userType]: newLayouts,
            },
          }
        }),

      clearLastAdded: () => set({ lastAddedInstanceId: null }),
    }),
    {
      name: 'financial-dashboard',
      version: 8,
      partialize: (state) => ({
        selectedPortfolioId: state.selectedPortfolioId,
        userType: state.userType,
        widgetInstances: state.widgetInstances,
        userLayouts: state.userLayouts,
        poppedOutWidgets: state.poppedOutWidgets,
        savedWidgetItems: state.savedWidgetItems,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.layouts = ensureMinSizes(state.userLayouts[state.userType] ?? defaultLayouts)
        }
      },
      migrate: () => ({
        selectedPortfolioId: mockPortfolios[0].id,
        userType: 'front-office' as UserType,
        widgetInstances: INITIAL_INSTANCES,
        userLayouts: {
          'front-office': defaultLayouts,
          'back-office': defaultLayouts,
        },
        poppedOutWidgets: [],
        savedWidgetItems: {},
      }),
    },
  ),
)
