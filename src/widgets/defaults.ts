import type { ResponsiveLayouts } from 'react-grid-layout'
import type { WidgetInstance, WidgetTypeMeta } from './types'

// ---------------------------------------------------------------------------
// Widget type metadata (no React imports — safe for store & layout to import)
// ---------------------------------------------------------------------------

export const WIDGET_TYPE_META: Record<string, WidgetTypeMeta> = {
  summary: {
    type: 'summary',
    defaultTitle: 'Portfolio Summary',
    accent: '#3b82f6',
    defaultSize: {
      lg: { w: 7, h: 6 },
      md: { w: 6, h: 6 },
      sm: { w: 6, h: 5 },
    },
    minSize: { minW: 4, minH: 4 },
  },
  news: {
    type: 'news',
    defaultTitle: 'Market News',
    accent: '#ff6b35',
    defaultSize: {
      lg: { w: 5, h: 3 },
      md: { w: 4, h: 3 },
      sm: { w: 6, h: 3 },
    },
    minSize: { minW: 3, minH: 3 },
  },
  allocation: {
    type: 'allocation',
    defaultTitle: 'Asset Allocation',
    accent: '#00d26a',
    defaultSize: {
      lg: { w: 5, h: 3 },
      md: { w: 4, h: 3 },
      sm: { w: 6, h: 3 },
    },
    minSize: { minW: 3, minH: 3 },
  },
}

// ---------------------------------------------------------------------------
// Seed instances (deterministic IDs for fresh / migrated state)
// ---------------------------------------------------------------------------

export const INITIAL_INSTANCES: Record<string, WidgetInstance> = {
  'summary-0001': { instanceId: 'summary-0001', type: 'summary', title: 'Portfolio Summary' },
  'news-0001': { instanceId: 'news-0001', type: 'news', title: 'Market News' },
  'allocation-0001': { instanceId: 'allocation-0001', type: 'allocation', title: 'Asset Allocation' },
}

// ---------------------------------------------------------------------------
// Initial layouts (same positions as the old defaultLayouts, instance-ID keyed)
// ---------------------------------------------------------------------------

export const INITIAL_LAYOUT: ResponsiveLayouts = {
  lg: [
    { i: 'summary-0001', x: 0, y: 0, w: 7, h: 6, minW: 4, minH: 4 },
    { i: 'news-0001', x: 7, y: 0, w: 5, h: 3, minW: 3, minH: 3 },
    { i: 'allocation-0001', x: 7, y: 3, w: 5, h: 3, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'summary-0001', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'news-0001', x: 6, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
    { i: 'allocation-0001', x: 6, y: 3, w: 4, h: 3, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'summary-0001', x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 4 },
    { i: 'news-0001', x: 0, y: 5, w: 6, h: 3, minW: 2, minH: 3 },
    { i: 'allocation-0001', x: 0, y: 8, w: 6, h: 3, minW: 2, minH: 3 },
  ],
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Generate a unique instance ID for a widget type */
export function generateInstanceId(type: string): string {
  return `${type}-${Math.random().toString(36).substring(2, 6)}`
}

/** Extract the widget type from an instance ID (e.g. 'summary-a3x9' → 'summary') */
export function extractWidgetType(instanceId: string): string {
  return instanceId.substring(0, instanceId.lastIndexOf('-'))
}

/** Compute an auto-title for a new instance, e.g. "Market News (2)" */
export function getAutoTitle(
  type: string,
  existingInstances: Record<string, WidgetInstance>,
): string {
  const meta = WIDGET_TYPE_META[type]
  if (!meta) return type
  const sameTypeCount = Object.values(existingInstances).filter((inst) => inst.type === type).length
  if (sameTypeCount === 0) return meta.defaultTitle
  return `${meta.defaultTitle} (${sameTypeCount + 1})`
}
