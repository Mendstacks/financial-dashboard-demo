import type { WidgetRegistryEntry } from './types'
import { WIDGET_TYPE_META } from './defaults'
import { SummaryWidget } from '../components/widgets/SummaryWidget'
import { NewsWidget } from '../components/widgets/NewsWidget'
import { AllocationWidget } from '../components/widgets/AllocationWidget'
import { SummarySkeleton, NewsSkeleton, AllocationSkeleton } from '../components/ui/Skeleton'

// ---------------------------------------------------------------------------
// Widget registry — the single source of truth for all available widget types.
//
// To add a new widget type:
// 1. Create the component in src/components/widgets/
// 2. Create its skeleton in src/components/ui/Skeleton.tsx
// 3. Add a WidgetTypeMeta entry to src/widgets/defaults.ts
// 4. Add a WidgetRegistryEntry below
// ---------------------------------------------------------------------------

export const widgetRegistry: Record<string, WidgetRegistryEntry> = {
  summary: {
    ...WIDGET_TYPE_META.summary,
    component: SummaryWidget,
    skeleton: SummarySkeleton,
    resolveProps: (portfolio) => ({
      summary: portfolio.summary,
      holdings: portfolio.holdings,
      currency: portfolio.currency,
    }),
  },
  news: {
    ...WIDGET_TYPE_META.news,
    component: NewsWidget,
    skeleton: NewsSkeleton,
    resolveProps: (portfolio) => ({
      news: portfolio.news,
    }),
  },
  allocation: {
    ...WIDGET_TYPE_META.allocation,
    component: AllocationWidget,
    skeleton: AllocationSkeleton,
    resolveProps: (portfolio) => ({
      allocation: portfolio.allocation,
    }),
  },
}
