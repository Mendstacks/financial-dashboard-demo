import { Responsive, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { usePortfolioStore } from '../../store/usePortfolioStore'
import { WidgetContainer } from './WidgetContainer'
import { SummaryWidget } from '../widgets/SummaryWidget'
import { NewsWidget } from '../widgets/NewsWidget'
import { AllocationWidget } from '../widgets/AllocationWidget'

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
          dragConfig={{ handle: ".drag-handle" }}
          onLayoutChange={(_currentLayout, allLayouts) => {
            updateLayouts(allLayouts)
          }}
        >
          <div key="summary">
            <WidgetContainer title="Portfolio Summary">
              <SummaryWidget summary={portfolio.summary} />
            </WidgetContainer>
          </div>
          <div key="news">
            <WidgetContainer title="News">
              <NewsWidget news={portfolio.news} />
            </WidgetContainer>
          </div>
          <div key="allocation">
            <WidgetContainer title="Asset Allocation">
              <AllocationWidget allocation={portfolio.allocation} />
            </WidgetContainer>
          </div>
        </Responsive>
      )}
    </div>
  )
}
