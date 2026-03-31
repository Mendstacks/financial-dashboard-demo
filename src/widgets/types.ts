import type { ComponentType } from 'react'
import type { Portfolio } from '../types/portfolio'

/** Persisted per-instance state stored in the Zustand store */
export interface WidgetInstance {
  instanceId: string // Unique ID e.g. 'summary-a3x9'
  type: string // Widget type key e.g. 'summary' — maps to registry
  title: string // User-visible title, can be renamed
}

/** Widget type metadata — no React references, safe for store/layout imports */
export interface WidgetTypeMeta {
  type: string
  defaultTitle: string
  accent: string
  defaultSize: Record<string, { w: number; h: number }> // keyed by breakpoint
  minSize: { minW: number; minH: number }
}

/** Full registry entry — extends metadata with React component references */
export interface WidgetRegistryEntry extends WidgetTypeMeta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  skeleton: ComponentType
  resolveProps: (portfolio: Portfolio) => Record<string, unknown>
}
