import {
  LayoutDashboard, Search, BookMarked, ListChecks, GitCompareArrows, TrendingUp,
  Lightbulb, Bot, History, Settings, ChevronLeft, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export const NAV = [
  { key: 'Overview', icon: LayoutDashboard },
  { key: 'Discover', icon: Search },
  { key: 'My Library', icon: BookMarked },
  { key: 'Reading Lists', icon: ListChecks },
  { key: 'Compare Papers', icon: GitCompareArrows },
  { key: 'Research Trends', icon: TrendingUp },
  { key: 'Research Gaps', icon: Lightbulb },
  { key: 'AI Research Assistant', icon: Bot },
  { key: 'Search History', icon: History },
];

export default function Sidebar({ active, onNavigate, collapsed, setCollapsed }) {
  const { profile } = useApp();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-edge bg-panel transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-edge">
        <div className="grid place-items-center h-8 w-8 rounded-md bg-brand/15 text-brand shrink-0">
          <Sparkles size={16} />
        </div>
        {!collapsed && <span className="font-semibold tracking-tight">ResearchAI</span>}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map(({ key, icon: Icon }) => (
          <button
            key={key}
            title={key}
            onClick={() => onNavigate(key)}
            className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors ${
              active === key ? 'bg-brand/10 text-brand' : 'text-zinc-400 hover:bg-card hover:text-zinc-200'
            }`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span className="truncate">{key}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-edge p-2 space-y-0.5">
        <button
          onClick={() => onNavigate('Settings')}
          className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm ${active === 'Settings' ? 'bg-brand/10 text-brand' : 'text-zinc-400 hover:bg-card'}`}
        >
          <Settings size={17} />
          {!collapsed && <span>Settings</span>}
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="grid place-items-center h-8 w-8 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile.name}</p>
              <p className="text-xs text-zinc-500 truncate">{profile.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-card"
        >
          <ChevronLeft size={17} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
