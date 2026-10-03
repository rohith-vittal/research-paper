import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Overview from './pages/Overview.jsx';
import Discover from './pages/Discover.jsx';
import PaperDetail from './pages/PaperDetail.jsx';
import Library from './pages/Library.jsx';
import ReadingLists from './pages/ReadingLists.jsx';
import Compare from './pages/Compare.jsx';
import Trends from './pages/Trends.jsx';
import Gaps from './pages/Gaps.jsx';
import Assistant from './pages/Assistant.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import { X } from 'lucide-react';

function Shell() {
  const [page, setPage] = useState('Overview');
  const [paperId, setPaperId] = useState(null);
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { toasts } = useApp();

  const navigate = (p) => { setPage(p); setPaperId(null); setMobileNav(false); };
  const openPaper = (id) => setPaperId(id);
  const runSearch = (q) => { setDiscoverQuery(q); setPage('Discover'); setPaperId(null); };

  const pageContent = paperId ? (
    <PaperDetail arxivId={paperId} onBack={() => setPaperId(null)} onOpen={openPaper} />
  ) : (
    <>
      {page === 'Overview' && <Overview onNavigate={navigate} openPaper={openPaper} runSearch={runSearch} />}
      {page === 'Discover' && <Discover onOpen={openPaper} initialQuery={discoverQuery} />}
      {page === 'My Library' && <Library onOpen={openPaper} />}
      {page === 'Reading Lists' && <ReadingLists onOpen={openPaper} />}
      {page === 'Compare Papers' && <Compare />}
      {page === 'Research Trends' && <Trends />}
      {page === 'Research Gaps' && <Gaps />}
      {page === 'AI Research Assistant' && <Assistant />}
      {page === 'Search History' && <History onSearchAgain={runSearch} />}
      {page === 'Settings' && <Settings />}
    </>
  );

  return (
    <div className="min-h-screen bg-base">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar active={page} onNavigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile sidebar */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60" onClick={() => setMobileNav(false)}>
          <div className="absolute inset-y-0 left-0" onClick={(e) => e.stopPropagation()}>
            <Sidebar active={page} onNavigate={navigate} collapsed={false} setCollapsed={() => setMobileNav(false)} />
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
        <Topbar onMenu={() => setMobileNav(true)} onGlobalSearch={runSearch} />
        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">{pageContent}</main>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm shadow-lift animate-slide-up ${t.type === 'error' ? 'border-red-900/60 bg-red-950/80 text-red-200' : 'border-edge bg-panel text-zinc-200'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
