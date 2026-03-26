import type { ResponsiveLayouts } from 'react-grid-layout'

export type LayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export const defaultLayouts: ResponsiveLayouts = {
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

export function getMinSizes(id: string) {
  const isSummary = id === 'summary'
  return { minW: isSummary ? 4 : 3, minH: isSummary ? 4 : 3 }
}

export function ensureMinSizes(layouts: ResponsiveLayouts): ResponsiveLayouts {
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

export function getDefaultItemForWidget(id: string): LayoutItem {
  const lgItem = (defaultLayouts.lg as LayoutItem[]).find((d) => d.i === id)
  return lgItem ?? { i: id, x: 0, y: 0, w: 5, h: 3, ...getMinSizes(id) }
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
