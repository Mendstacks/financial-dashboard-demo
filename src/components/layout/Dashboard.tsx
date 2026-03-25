import { useCallback, type ReactNode } from 'react'
import { Responsive, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { usePortfolioStore } from '../../store/usePortfolioStore'
import { WidgetContainer } from './WidgetContainer'
import { PopoutWindow } from './PopoutWindow'
import { SummaryWidget } from '../widgets/SummaryWidget'
import { NewsWidget } from '../widgets/NewsWidget'
import { AllocationWidget } from '../widgets/AllocationWidget'
import { SummarySkeleton, NewsSkeleton, AllocationSkeleton } from '../ui/Skeleton'
import { ErrorBoundary } from '../ui/ErrorBoundary'

const WIDGET_CONFIG = {
  summary: { title: 'Portfolio Summary', accent: '#3b82f6' },
  news: { title: 'Market News', accent: '#ff6b35' },
  allocation: { title: 'Asset Allocation', accent: '#00d26a' },
}

export function Dashboard() {
  const { width, containerRef, mounted } = useContainerWidth()
  const portfolios = usePortfolioStore((s) => s.portfolios)
  const selectedId = usePortfolioStore((s) => s.selectedPortfolioId)
  const layouts = usePortfolioStore((s) => s.layouts)
  const updateLayouts = usePortfolioStore((s) => s.updateLayouts)
  const isLoading = usePortfolioStore((s) => s.isLoading)
  const poppedOutWidgets = usePortfolioStore((s) => s.poppedOutWidgets)
  const visibleWidgets = usePortfolioStore((s) => s.visibleWidgets)
  const popOutWidget = usePortfolioStore((s) => s.popOutWidget)
  const popInWidget = usePortfolioStore((s) => s.popInWidget)

  const portfolio = portfolios.find((p) => p.id === selectedId)

  const handlePopIn = useCallback(
    (id: string) => () => popInWidget(id),
    [popInWidget],
  )

  const handlePopOut = useCallback(
    (id: string) => () => popOutWidget(id),
    [popOutWidget],
  )

  if (!portfolio) return null

  const isPoppedOut = (id: string) => poppedOutWidgets.includes(id)

  const widgets: Record<string, ReactNode> = {
    summary: isLoading ? <SummarySkeleton /> : <SummaryWidget summary={portfolio.summary} holdings={portfolio.holdings} currency={portfolio.currency} />,
    news: isLoading ? <NewsSkeleton /> : <NewsWidget news={portfolio.news} />,
    allocation: isLoading ? <AllocationSkeleton /> : <AllocationWidget allocation={portfolio.allocation} />,
  }

  const gridWidgets = Object.entries(WIDGET_CONFIG).filter(
    ([id]) => !isPoppedOut(id) && visibleWidgets.includes(id),
  )

  return (
    <div ref={containerRef} className="flex-1">
      {/* Popped-out windows */}
      {Object.entries(WIDGET_CONFIG).map(
        ([id, config]) =>
          isPoppedOut(id) && (
            <PopoutWindow key={id} title={config.title} onClose={handlePopIn(id)}>
              <ErrorBoundary fallbackTitle={`${config.title} error`}>
                {widgets[id]}
              </ErrorBoundary>
            </PopoutWindow>
          ),
      )}

      {/* In-grid widgets */}
      {mounted && (
        <Responsive
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          margin={[6, 6]}
          containerPadding={[0, 0]}
          dragConfig={{ handle: '.drag-handle' }}
          resizeConfig={{ handles: ['se', 's', 'e', 'sw', 'w', 'n', 'ne', 'nw'] }}
          onLayoutChange={(_currentLayout, allLayouts) => {
            updateLayouts(allLayouts)
          }}
        >
          {gridWidgets.map(([id, config]) => (
            <div key={id}>
              <WidgetContainer
                title={config.title}
                accentColor={config.accent}
                onPopOut={handlePopOut(id)}
              >
                <ErrorBoundary fallbackTitle={`${config.title} error`}>
                  {widgets[id]}
                </ErrorBoundary>
              </WidgetContainer>
            </div>
          ))}
        </Responsive>
      )}
    </div>
  )
}
