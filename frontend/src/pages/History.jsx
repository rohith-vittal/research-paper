import { useEffect, useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { api } from '../services/api.js';
import { EmptyState } from '../components/ui.jsx';

export default function History({ onSearchAgain }) {
  const [items, setItems] = useState([]);
  useEffect(() => { api.getHistory().then(setItems).catch(() => {}); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search history</h1>
        <p className="text-sm text-zinc-500 mt-1">Every query you've run, newest first.</p>
      </div>
      {items.length === 0 && <EmptyState icon={HistoryIcon} title="No searches yet" body="Your searches will be recorded here." />}
      <ul className="divide-y divide-edge rounded-lg border border-edge bg-panel">
        {items.map((h) => (
          <li key={h._id} className="flex items-center justify-between gap-4 p-4">
            <button onClick={() => onSearchAgain(h.query)} className="text-left">
              <p className="text-sm text-zinc-200 hover:text-brand transition-colors">{h.query}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</p>
            </button>
            <span className="text-xs text-zinc-500">{h.resultCount} results</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
