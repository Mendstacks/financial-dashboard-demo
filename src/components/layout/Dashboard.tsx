import { useEffect } from 'react'
import { Responsive, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { usePortfolioStore } from '../../store/usePortfolioStore'
import { WidgetContainer } from './WidgetContainer'
import { PopoutToolbar } from './PopoutToolbar'
import { PopoutWindow } from './PopoutWindow'
import { WidgetErrorBoundary } from '../ui/ErrorBoundary'
import { widgetRegistry } from '../../widgets/registry'

export function Dashboard() {
  const { width, containerRef, mounted } = useContainerWidth()
  const portfolios = usePortfolioStore((s) => s.portfolios)
  const selectedId = usePortfolioStore((s) => s.selectedPortfolioId)
  const layouts = usePortfolioStore((s) => s.layouts)
  const updateLayouts = usePortfolioStore((s) => s.updateLayouts)
  const isLoading = usePortfolioStore((s) => s.isLoading)
  const poppedOutWidgets = usePortfolioStore((s) => s.poppedOutWidgets)
  const widgetInstances = usePortfolioStore((s) => s.widgetInstances)
  const popOutWidget = usePortfolioStore((s) => s.popOutWidget)
  const popInWidget = usePortfolioStore((s) => s.popInWidget)
  const removeWidgetInstance = usePortfolioStore((s) => s.removeWidgetInstance)
  const duplicateWidgetInstance = usePortfolioStore((s) => s.duplicateWidgetInstance)
  const lastAddedInstanceId = usePortfolioStore((s) => s.lastAddedInstanceId)
  const clearLastAdded = usePortfolioStore((s) => s.clearLastAdded)

  const portfolio = portfolios.find((p) => p.id === selectedId)

  // Auto-scroll to newly added widget
  useEffect(() => {
    if (!lastAddedInstanceId) return
    // Small delay to let react-grid-layout render the new item
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-instance-id="${lastAddedInstanceId}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearLastAdded()
    }, 100)
    return () => clearTimeout(timer)
  }, [lastAddedInstanceId, clearLastAdded])

  if (!portfolio) return null

  const isPoppedOut = (id: string) => poppedOutWidgets.includes(id)

  const allInstances = Object.values(widgetInstances)
  const gridInstances = allInstances.filter((inst) => !isPoppedOut(inst.instanceId))
  const popoutInstances = allInstances.filter((inst) => isPoppedOut(inst.instanceId))

  function renderWidget(inst: { instanceId: string; type: string }) {
    const entry = widgetRegistry[inst.type]
    if (!entry) return null
    const Component = isLoading ? entry.skeleton : entry.component
    const props = isLoading ? {} : entry.resolveProps(portfolio!)
    return <Component {...props} />
  }

  return (
    <div ref={containerRef} className="flex-1">
      {/* Popped-out windows */}
      {popoutInstances.map((inst) => {
        const entry = widgetRegistry[inst.type]
        if (!entry) return null
        return (
          <PopoutWindow key={inst.instanceId} title={inst.title} onClose={() => popInWidget(inst.instanceId)}>
            <PopoutToolbar
              accentColor={entry.accent}
              onPopIn={() => popInWidget(inst.instanceId)}
              onRemove={() => removeWidgetInstance(inst.instanceId)}
              onDuplicate={() => duplicateWidgetInstance(inst.instanceId)}
            />
            <div className="flex-1 p-3 overflow-auto">
              <WidgetErrorBoundary fallbackTitle={`${inst.title} error`}>
                {renderWidget(inst)}
              </WidgetErrorBoundary>
            </div>
          </PopoutWindow>
        )
      })}

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
          {gridInstances.map((inst) => {
            const entry = widgetRegistry[inst.type]
            if (!entry) return null
            return (
              <div key={inst.instanceId} data-instance-id={inst.instanceId}>
                <WidgetContainer
                  title={inst.title}
                  accentColor={entry.accent}
                  onPopOut={() => popOutWidget(inst.instanceId)}
                  onRemove={() => removeWidgetInstance(inst.instanceId)}
                  onDuplicate={() => duplicateWidgetInstance(inst.instanceId)}
                >
                  <WidgetErrorBoundary fallbackTitle={`${inst.title} error`}>
                    {renderWidget(inst)}
                  </WidgetErrorBoundary>
                </WidgetContainer>
              </div>
            )
          })}
        </Responsive>
      )}
    </div>
  )
}
