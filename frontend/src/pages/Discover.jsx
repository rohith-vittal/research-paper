import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api.js';
import PaperCard from '../components/PaperCard.jsx';
import { EmptyState, LoadingSkeleton, ErrorState } from '../components/ui.jsx';

export default function Discover({ onOpen, initialQuery }) {
  const [q, setQ] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [citations, setCitations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [year, setYear] = useState('any');
  const [topic, setTopic] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const run = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const papers = await api.searchPapers(query, 15);
      setResults(papers);
      api.getCitations(papers.map((p) => p.arxivId)).then(setCitations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) run(initialQuery);
    // eslint-disable-next-line
  }, [initialQuery]);

  const topics = useMemo(() => {
    const s = new Set();
    results.forEach((p) => (p.categories || []).forEach((c) => s.add(c)));
    return ['all', ...Array.from(s)];
  }, [results]);

  const filtered = useMemo(() => {
    let r = [...results];
    if (year !== 'any') {
      r = r.filter((p) => {
        const y = p.published ? new Date(p.published).getFullYear() : 0;
        if (year === '2020+') return y >= 2020;
        if (year === '2015-2019') return y >= 2015 && y < 2020;
        return y < 2015;
      });
    }
    if (topic !== 'all') r = r.filter((p) => (p.categories || []).includes(topic));
    if (sortBy === 'citations') r.sort((a, b) => (citations[b.arxivId] ?? -1) - (citations[a.arxivId] ?? -1));
    if (sortBy === 'newest') r.sort((a, b) => new Date(b.published) - new Date(a.published));
    return r;
  }, [results, year, topic, sortBy, citations]);

  const select = 'rounded-md border border-edge bg-panel px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="text-sm text-zinc-500 mt-1">Search live academic literature from arXiv.</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); run(q); }}
        className="flex items-center gap-2 rounded-lg border border-edge bg-panel p-2 focus-within:border-zinc-600"
      >
        <Search size={17} className="ml-2 text-zinc-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Topic, author, or research question…"
          className="flex-1 bg-transparent text-sm placeholder:text-zinc-600 focus:outline-none"
        />
        <button className="px-4 py-2 rounded-md bg-brand text-black text-sm font-medium">Search</button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <SlidersHorizontal size={14} className="text-zinc-600" />
        <select value={year} onChange={(e) => setYear(e.target.value)} className={select}>
          <option value="any">Any year</option>
          <option value="2020+">2020 — present</option>
          <option value="2015-2019">2015 — 2019</option>
          <option value="older">Before 2015</option>
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className={select}>
          {topics.map((t) => <option key={t} value={t}>{t === 'all' ? 'All topics' : t}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={select}>
          <option value="relevance">Sort: relevance</option>
          <option value="newest">Sort: newest</option>
          <option value="citations">Sort: most cited</option>
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={() => run(q)} />}
      {loading && <LoadingSkeleton rows={4} />}

      {!loading && searched && filtered.length === 0 && !error && (
        <EmptyState title="No papers found" body="Try broadening your query or clearing the filters." />
      )}
      {!loading && !searched && (
        <EmptyState title="Start exploring" body="Enter a research topic, author, or question to search thousands of papers." />
      )}

      {!loading && (
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <PaperCard key={p.arxivId} paper={p} citations={citations[p.arxivId]} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
