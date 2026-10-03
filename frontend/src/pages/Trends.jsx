import { useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../services/api.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Button, ErrorState, EmptyState } from '../components/ui.jsx';

const COLORS = ['#8b9cff', '#7dd3fc', '#fbbf24', '#34d399', '#fb7185', '#c084fc', '#4ade80', '#f472b6'];

export default function Trends() {
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setData(await api.trends(q));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tooltipStyle = { background: '#141419', border: '1px solid #232329', borderRadius: 8, fontSize: 12 };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Research trends</h1>
        <p className="text-sm text-zinc-500 mt-1">Publication volume, emerging categories, and topic activity for any field.</p>
      </div>

      <form onSubmit={run} className="flex items-center gap-2 rounded-lg border border-edge bg-panel p-2 focus-within:border-zinc-600 max-w-2xl">
        <Search size={17} className="ml-2 text-zinc-600" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Topic, e.g. graph neural networks" className="flex-1 bg-transparent text-sm focus:outline-none" />
        <Button>Analyze</Button>
      </form>

      {error && <ErrorState message={error} />}
      {!data && !loading && <EmptyState title="No analysis yet" body="Enter a topic to visualize publication trends." />}

      {data && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-edge bg-panel p-5">
            <h3 className="font-semibold mb-1">Topic growth</h3>
            <p className="text-xs text-zinc-500 mb-4">{data.total} papers sampled</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.byYear}>
                <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#8b9cff" fill="#8b9cff22" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-edge bg-panel p-5">
            <h3 className="font-semibold mb-4">Highly researched areas</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.topCategories} dataKey="count" nameKey="category" outerRadius={85} label={{ fill: '#a1a1aa', fontSize: 11 }}>
                  {data.topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-edge bg-panel p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4">Publication trends</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byYear}>
                <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#8b9cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
