import { useState } from 'react'
import { Sidebar, type PageKey } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { DailyPlanPage } from './pages/DailyPlanPage'
import { TopicsPage } from './pages/TopicsPage'
import { InspirationPage } from './pages/InspirationPage'
import { SkincareInspirationPage } from './pages/SkincareInspirationPage'
import { InspirationLibraryPage } from './pages/InspirationLibraryPage'
import { CalendarSchedulePage } from './pages/CalendarSchedulePage'
import { ReviewPage } from './pages/ReviewPage'

export function App() {
  const [page, setPage] = useState<PageKey>('plan')

  return (
    <div className="shell">
      <Sidebar active={page} onChange={setPage} />
      <main className="main">
        <Topbar page={page} />
        <div className="page">
          {page === 'plan' && <DailyPlanPage />}
          {page === 'topics' && <TopicsPage />}
          {page === 'inspiration' && (
            <InspirationPage onConvert={() => setPage('topics')} />
          )}
          {page === 'skincare' && (
            <SkincareInspirationPage onConvert={() => setPage('topics')} />
          )}
          {page === 'library' && (
            <InspirationLibraryPage onConvert={() => setPage('topics')} />
          )}
          {page === 'calendar' && <CalendarSchedulePage />}
          {page === 'review' && <ReviewPage />}
        </div>
      </main>
    </div>
  )
}

export default App
