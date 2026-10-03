import { useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../services/api.js';
import { Button, ErrorState, EmptyState, Tag, AITag } from '../components/ui.jsx';

export default function Gaps() {
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const run = async (e) => {
    e.preventDefault();
    try {
      setData(await api.gaps(q));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Research gaps</h1>
        <p className="text-sm text-zinc-500 mt-1">Explore limitations across papers and underrepresented areas.</p>
      </div>

      <form onSubmit={run} className="flex items-center gap-2 rounded-lg border border-edge bg-panel p-2 focus-within:border-zinc-600 max-w-2xl">
        <Search size={17} className="ml-2 text-zinc-600" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Topic area…" className="flex-1 bg-transparent text-sm focus:outline-none" />
        <Button>Find gaps</Button>
      </form>

      {error && <ErrorState message={error} />}
      {!data && <EmptyState title="Explore a topic" body="Enter a research area to surface stated limitations and underrepresented categories." />}

      {data && (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-1">
              <AITag />
              <h2 className="font-semibold">Potential research gaps</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-4">{data.note} — gaps are hypotheses derived from stated limitations, not established facts.</p>
            <div className="space-y-3">
              {data.limitationHighlights.map((l, i) => (
                <div key={i} className="rounded-lg border border-edge bg-panel p-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">{l.limitation}</p>
                  <p className="mt-2 text-xs text-zinc-500">Evidence — from “{l.paper}”</p>
                </div>
              ))}
              {data.limitationHighlights.length === 0 && <p className="text-sm text-zinc-500">No explicit limitation statements found in this sample.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-3">Underrepresented categories</h2>
            <div className="flex flex-wrap gap-2">
              {data.underrepresentedCategories.map((c) => <Tag key={c}>{c}</Tag>)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
