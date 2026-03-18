import { Responsive, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { usePortfolioStore } from '../../store/usePortfolioStore'
import { WidgetContainer } from './WidgetContainer'
import { SummaryWidget } from '../widgets/SummaryWidget'
import { NewsWidget } from '../widgets/NewsWidget'
import { AllocationWidget } from '../widgets/AllocationWidget'

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

  const portfolio = portfolios.find((p) => p.id === selectedId)

  if (!portfolio) return null

  return (
    <div ref={containerRef} className="flex-1">
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
          onLayoutChange={(_currentLayout, allLayouts) => {
            updateLayouts(allLayouts)
          }}
        >
          <div key="summary">
            <WidgetContainer title={WIDGET_CONFIG.summary.title} accentColor={WIDGET_CONFIG.summary.accent}>
              <SummaryWidget summary={portfolio.summary} />
            </WidgetContainer>
          </div>
          <div key="news">
            <WidgetContainer title={WIDGET_CONFIG.news.title} accentColor={WIDGET_CONFIG.news.accent}>
              <NewsWidget news={portfolio.news} />
            </WidgetContainer>
          </div>
          <div key="allocation">
            <WidgetContainer title={WIDGET_CONFIG.allocation.title} accentColor={WIDGET_CONFIG.allocation.accent}>
              <AllocationWidget allocation={portfolio.allocation} />
            </WidgetContainer>
          </div>
        </Responsive>
      )}
    </div>
  )
}
