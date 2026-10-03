import { useState } from 'react';
import { Bot, Search, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/ui.jsx';

const FOLLOW_UPS = [
  'What is the main contribution of this paper?',
  'What datasets are used for evaluation?',
  'What limitations does the paper mention?',
  'What future work is proposed?',
];

export default function Assistant() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [paper, setPaper] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setResults(await api.searchPapers(query, 6));
    } catch { /* ignore */ }
  };

  const send = async (text) => {
    if (!paper || !text.trim() || asking) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setAsking(true);
    try {
      const res = await api.chat(paper.arxivId, text);
      setMessages((m) => [...m, { role: 'assistant', text: res.answer, url: res.url, source: res.source }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: err.message }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Bot size={22} className="text-brand" /> Research Assistant</h1>
        <p className="text-sm text-zinc-500 mt-1">Explore academic literature with evidence-backed answers. Answers are grounded in the selected paper's abstract.</p>
      </div>

      {!paper ? (
        <div className="rounded-lg border border-edge bg-panel p-5 space-y-4">
          <p className="text-sm text-zinc-400">First, pick a paper as the assistant's context:</p>
          <form onSubmit={search} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a paper…" className="w-full rounded-md border border-edge bg-base pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
            </div>
            <Button>Search</Button>
          </form>
          <div className="space-y-2">
            {results.map((p) => (
              <button key={p.arxivId} onClick={() => setPaper(p)} className="w-full text-left rounded-md border border-edge bg-card p-3 hover:border-zinc-600 transition-colors">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(p.authors || []).slice(0, 3).join(', ')} · {p.published ? new Date(p.published).getFullYear() : ''}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-lg border border-edge bg-panel flex flex-col h-[560px]">
            <div className="p-4 border-b border-edge flex items-center justify-between">
              <div>
                <p className="text-sm font-medium truncate max-w-md">{paper.title}</p>
                <p className="text-xs text-zinc-500">Context paper</p>
              </div>
              <button onClick={() => { setPaper(null); setMessages([]); }} className="text-xs text-zinc-500 hover:text-white">Change</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-zinc-600 text-sm mt-10">
                  <Sparkles className="mx-auto mb-2 text-zinc-700" size={24} />
                  Ask anything about this paper.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto bg-card border border-edge' : 'bg-brand/5 border border-brand/20'}`}>
                  <p className="text-zinc-200">{m.text}</p>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 rounded-md border border-edge bg-card px-2 py-1 text-xs text-brand">
                      Source · {m.source} <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
              {asking && <p className="text-xs text-zinc-500 animate-pulseSoft">Thinking…</p>}
            </div>

            <form
              className="p-3 border-t border-edge flex gap-2"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a follow-up question…" className="flex-1 rounded-md border border-edge bg-base px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
              <Button>Send</Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-edge bg-panel p-4">
              <h3 className="text-sm font-semibold mb-3">Follow-up suggestions</h3>
              <div className="space-y-2">
                {FOLLOW_UPS.map((f) => (
                  <button key={f} onClick={() => send(f)} className="block w-full text-left text-sm text-zinc-400 hover:text-brand transition-colors">
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-edge bg-panel p-4">
              <h3 className="text-sm font-semibold mb-2">Related source</h3>
              <a href={paper.url} target="_blank" rel="noreferrer" className="text-sm text-brand hover:underline">{paper.title}</a>
              <p className="text-xs text-zinc-500 mt-1">arXiv · {paper.published ? new Date(paper.published).getFullYear() : ''}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
