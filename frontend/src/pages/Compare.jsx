import { useEffect, useState } from 'react';
import { GitCompareArrows, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Button, EmptyState, LoadingSkeleton, ErrorState, Tag } from '../components/ui.jsx';

export default function Compare() {
  const { compare, toggleCompare } = useApp();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idsInput, setIdsInput] = useState('');

  const load = async (ids) => {
    if (!ids.length) { setPapers([]); return; }
    setLoading(true);
    setError('');
    try {
      const list = await Promise.all(ids.map((id) => api.analyzePaper(id)));
      const citations = await api.getCitations(ids);
      setPapers(list.map((p) => ({ ...p, citations: citations[p.arxivId] ?? null })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(compare); }, [compare]);

  const submitIds = (e) => {
    e.preventDefault();
    const ids = idsInput.split(',').map((s) => s.trim()).filter(Boolean);
    ids.forEach((id) => { if (!compare.includes(id) && compare.length < 4) toggleCompare(id); });
  };

  const rows = [
    { label: 'Year', render: (p) => (p.published ? new Date(p.published).getFullYear() : '—') },
    { label: 'Research area', render: (p) => (p.categories || []).slice(0, 2).join(', ') || '—' },
    { label: 'Citations', render: (p) => (typeof p.citations === 'number' ? p.citations.toLocaleString() : '—') },
    { label: 'Summary', render: (p) => p.summary },
    { label: 'Methodology', render: (p) => p.methodology.join(' ') },
    { label: 'Dataset', render: (p) => p.datasets.join(' ') },
    { label: 'Key findings', render: (p) => p.keyFindings[0] || '—' },
    { label: 'Limitations', render: (p) => p.limitations[0] || '—' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare papers</h1>
        <p className="text-sm text-zinc-500 mt-1">A structured workspace for up to 4 papers. Add papers via the Compare button on any result.</p>
      </div>

      <form onSubmit={submitIds} className="flex gap-2">
        <input value={idsInput} onChange={(e) => setIdsInput(e.target.value)} placeholder="Add arXiv IDs, comma-separated (e.g. 2301.00001, 2310.06770)" className="flex-1 rounded-md border border-edge bg-panel px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
        <Button>Add</Button>
      </form>

      {compare.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {compare.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-sm">
              {id}
              <button onClick={() => toggleCompare(id)} className="text-zinc-500 hover:text-white"><X size={13} /></button>
            </span>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} />}
      {loading && <LoadingSkeleton rows={2} />}

      {!loading && papers.length === 0 && (
        <EmptyState
          icon={GitCompareArrows}
          title="No papers selected"
          body="Use the Compare button on any paper card, or paste arXiv IDs above."
        />
      )}

      {!loading && papers.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-edge bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-zinc-500 w-40" />
                {papers.map((p) => (
                  <th key={p.arxivId} className="p-4 text-left align-top min-w-[240px]">
                    <p className="font-semibold text-white leading-snug">{p.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{(p.authors || []).slice(0, 3).join(', ')}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-edge">
                  <td className="p-4 text-zinc-500 text-xs uppercase tracking-wider align-top">{r.label}</td>
                  {papers.map((p) => (
                    <td key={p.arxivId} className="p-4 align-top text-zinc-300 leading-relaxed">{r.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
