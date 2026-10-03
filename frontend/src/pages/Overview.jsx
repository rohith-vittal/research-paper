import { useEffect, useMemo, useState } from 'react';
import { Search, ArrowRight, BookOpen, FlaskConical, Layers, TrendingUp } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { StatCard, LoadingSkeleton } from '../components/ui.jsx';
import PaperCard from '../components/PaperCard.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EXAMPLES = [
  'How do retrieval-augmented generation models reduce hallucination?',
  'Parameter-efficient fine-tuning for large language models',
  'Graph neural networks for drug discovery',
  'Diffusion models for protein structure prediction',
];

export default function Overview({ onNavigate, openPaper, runSearch }) {
  const { recentPapers, readingStatus } = useApp();
  const [q, setQ] = useState('');
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    api.getHistory().then(setHistory).catch(() => {});
    api.getSaved().then(setSaved).catch(() => {});
  }, []);

  useEffect(() => {
    const seed = recentPapers[0]?.title?.split(' ').slice(0, 3).join(' ') || 'large language models';
    setRecLoading(true);
    api.searchPapers(seed, 4).then((r) => setRecommended(r.slice(0, 4))).catch(() => {}).finally(() => setRecLoading(false));
  }, []);

  const stats = useMemo(() => {
    const discovered = history.reduce((a, h) => a + (h.resultCount || 0), 0);
    const topics = new Set(history.map((h) => h.query)).size;
    const completed = Object.values(readingStatus).filter((s) => s === 'completed').length;
    return { discovered, saved: saved.length, topics, completed };
  }, [history, saved, readingStatus]);

  const activity = history.slice(0, 6).reverse().map((h) => ({ name: h.query.length > 14 ? h.query.slice(0, 14) + '…' : h.query, results: h.resultCount || 0 }));

  const emerging = ['Large Language Models', 'Retrieval-Augmented Generation', 'Diffusion Models', 'Graph Neural Networks', 'Reinforcement Learning', 'Computer Vision'];

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="pt-6 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your research, accelerated.</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          ResearchAI helps you discover, understand, and connect academic literature — with every answer grounded in real papers.
        </p>

        <form
          className="mt-6 max-w-2xl"
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) runSearch(q); }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-edge bg-panel p-2 focus-within:border-zinc-600 transition-colors">
            <Search size={17} className="ml-2 text-zinc-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask a research question or search academic literature…"
              className="flex-1 bg-transparent text-sm placeholder:text-zinc-600 focus:outline-none"
            />
            <button className="px-4 py-2 rounded-md bg-brand text-black text-sm font-medium hover:opacity-90">Search</button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span>Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => runSearch(ex)} className="px-2.5 py-1 rounded-full border border-edge hover:border-zinc-600 hover:text-zinc-300 transition-colors">
              {ex.length > 45 ? ex.slice(0, 45) + '…' : ex}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Papers discovered" value={stats.discovered} icon={Search} hint="across your searches" />
        <StatCard label="Saved papers" value={stats.saved} icon={BookOpen} />
        <StatCard label="Research topics" value={stats.topics} icon={Layers} />
        <StatCard label="Completed readings" value={stats.completed} icon={FlaskConical} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Continue researching</h2>
        </div>
        {recentPapers.length === 0 ? (
          <p className="text-sm text-zinc-500">Papers you open will appear here.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentPapers.slice(0, 4).map((p) => <PaperCard key={p.arxivId} paper={p} onOpen={openPaper} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Recommended for you</h2>
        {recLoading ? <LoadingSkeleton rows={1} /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommended.map((p) => <PaperCard key={p.arxivId} paper={p} onOpen={openPaper} />)}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-edge bg-panel p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp size={17} /> Research activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-500">Your search activity will appear here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activity}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#141419', border: '1px solid #232329', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="results" fill="#8b9cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="lg:col-span-2 rounded-lg border border-edge bg-panel p-5">
          <h2 className="text-lg font-semibold mb-4">Emerging research areas</h2>
          <div className="flex flex-wrap gap-2">
            {emerging.map((t) => (
              <button key={t} onClick={() => runSearch(t)} className="px-3 py-1.5 rounded-full border border-edge text-sm text-zinc-300 hover:border-brand/50 hover:text-brand transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
