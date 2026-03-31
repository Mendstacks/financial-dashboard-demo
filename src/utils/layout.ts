import type { ResponsiveLayouts } from 'react-grid-layout'
import { INITIAL_LAYOUT } from '../widgets/defaults'

export type LayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

// Re-export from widget defaults (instance-ID keyed)
export const defaultLayouts: ResponsiveLayouts = INITIAL_LAYOUT

export function ensureMinSizes(layouts: ResponsiveLayouts): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(layouts)) {
    result[bp] = (items as LayoutItem[]).map((item) => {
      const minW = item.minW ?? 3
      const minH = item.minH ?? 3
      return {
        ...item,
        w: Math.max(item.w, minW),
        h: Math.max(item.h, minH),
        minW,
        minH,
      }
    })
  }
  return result
}

const BREAKPOINT_COLS: Record<string, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export function findAvailablePosition(
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

export function injectWidgetIntoLayouts(
  currentLayouts: ResponsiveLayouts,
  id: string,
  savedItem: LayoutItem | null,
  minSize: { minW: number; minH: number } = { minW: 3, minH: 3 },
): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(currentLayouts)) {
    const filtered = (items as LayoutItem[]).filter((item) => item.i !== id)
    const ref = savedItem ?? { i: id, x: 0, y: 0, w: 5, h: 3, ...minSize }
    const cols = BREAKPOINT_COLS[bp] ?? 12
    const { x, y } = findAvailablePosition(filtered, ref.w, ref.h, cols)
    result[bp] = [...filtered, { i: id, x, y, w: ref.w, h: ref.h, ...minSize }]
  }
  return result
}

/** Create layout entries for a brand-new widget instance across all breakpoints */
export function createLayoutsForNewInstance(
  instanceId: string,
  defaultSize: Record<string, { w: number; h: number }>,
  minSize: { minW: number; minH: number },
  currentLayouts: ResponsiveLayouts,
): ResponsiveLayouts {
  const result: ResponsiveLayouts = {}
  for (const [bp, items] of Object.entries(currentLayouts)) {
    const existing = items as LayoutItem[]
    const size = defaultSize[bp] ?? defaultSize.lg ?? { w: 5, h: 3 }
    const cols = BREAKPOINT_COLS[bp] ?? 12
    const { x, y } = findAvailablePosition(existing, size.w, size.h, cols)
    result[bp] = [
      ...existing,
      { i: instanceId, x, y, w: size.w, h: size.h, ...minSize },
    ]
  }
  return result
}
