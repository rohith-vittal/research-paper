import { useEffect, useRef, useState } from 'react';
import { Search, Bell, Command, Menu } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';

export default function Topbar({ onMenu, onGlobalSearch }) {
  const [q, setQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const { profile } = useApp();
  const ref = useRef();

  useEffect(() => {
    api.getHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', h);
    window.addEventListener('click', h);
    return () => { window.removeEventListener('keydown', h); window.removeEventListener('click', h); };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-edge bg-base/80 backdrop-blur flex items-center gap-3 px-4 lg:px-6">
      <button className="lg:hidden text-zinc-400" onClick={onMenu}><Menu size={18} /></button>
      <form
        className="relative flex-1 max-w-xl"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) onGlobalSearch(q); }}
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search academic literature…"
          className="w-full rounded-md border border-edge bg-panel pl-9 pr-20 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-zinc-600 border border-edge rounded px-1.5 py-0.5">
          <Command size={9} />K
        </kbd>
      </form>

      <div className="relative" ref={ref}>
        <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-md text-zinc-400 hover:bg-card hover:text-white">
          <Bell size={17} />
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-edge bg-panel shadow-lift animate-slide-up">
            <p className="px-4 pt-3 pb-2 text-xs uppercase tracking-wider text-zinc-500">Recent activity</p>
            {history.length === 0 && <p className="px-4 pb-4 text-sm text-zinc-500">Nothing yet — run a search to see activity.</p>}
            {history.slice(0, 5).map((h) => (
              <button
                key={h._id}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-card"
                onClick={() => { onGlobalSearch(h.query); setNotifOpen(false); }}
              >
                <span className="text-zinc-200">“{h.query}”</span>
                <span className="block text-xs text-zinc-500">{h.resultCount} results</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid place-items-center h-8 w-8 rounded-full bg-zinc-800 text-xs font-semibold">
        {profile.name.slice(0, 1).toUpperCase()}
      </div>
    </header>
  );
}
