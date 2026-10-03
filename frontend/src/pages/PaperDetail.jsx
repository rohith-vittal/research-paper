import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Tabs, LoadingSkeleton, EmptyState, Tag, Button } from '../components/ui.jsx';
import AnalysisBlock from '../components/AnalysisBlock.jsx';
import PaperCard from '../components/PaperCard.jsx';

const TAB_LIST = ['Overview', 'AI Summary', 'Key Findings', 'Methodology', 'Datasets', 'Limitations', 'Future Work', 'Citations', 'Related Papers', 'AI Q&A'];

export default function PaperDetail({ arxivId, onBack, onOpen }) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [citations, setCitations] = useState(null);
  const [related, setRelated] = useState([]);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const { pushRecent, toast, setStatus } = useApp();

  useEffect(() => {
    setLoading(true);
    setTab('Overview');
    setChat([]);
    api.analyzePaper(arxivId)
      .then((p) => { setPaper(p); pushRecent(p); })
      .catch(() => setPaper(null))
      .finally(() => setLoading(false));
  }, [arxivId]);

  useEffect(() => {
    if (!paper) return;
    api.getCitations([paper.arxivId]).then((m) => setCitations(m[paper.arxivId] ?? null));
    const q = (paper.categories?.[0] || paper.title.split(' ').slice(0, 3).join(' '));
    api.searchPapers(q, 6).then((r) => setRelated(r.filter((x) => x.arxivId !== paper.arxivId).slice(0, 4))).catch(() => {});
  }, [paper]);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    const q = question;
    setQuestion('');
    setChat((c) => [...c, { role: 'user', text: q }]);
    setAsking(true);
    try {
      const res = await api.chat(arxivId, q);
      setChat((c) => [...c, { role: 'assistant', text: res.answer, url: res.url, title: res.source }]);
    } catch (err) {
      setChat((c) => [...c, { role: 'assistant', text: err.message }]);
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;
  if (!paper) return <EmptyState title="Paper not found" body="We couldn't load this paper." action={<Button variant="ghost" onClick={onBack}>Back</Button>} />;

  const futureWork = paper.limitations.filter((l) => /future/i.test(l));
  const limits = paper.limitations.filter((l) => !/future/i.test(l));

  const Assistant = (
    <div className="rounded-lg border border-edge bg-panel p-4 flex flex-col lg:sticky lg:top-24">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-brand" />
        <h3 className="font-semibold text-sm">Research Assistant</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-3">Ask questions about this paper. Answers are grounded in the paper's abstract.</p>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 mb-3">
        {chat.length === 0 && <p className="text-xs text-zinc-600">Try: “What datasets does this paper use?” or “What are the main limitations?”</p>}
        {chat.map((m, i) => (
          <div key={i} className={`rounded-md px-3 py-2.5 text-sm ${m.role === 'user' ? 'bg-card border border-edge' : 'bg-brand/5 border border-brand/20'}`}>
            <p className="text-zinc-200 leading-relaxed">{m.text}</p>
            {m.url && (
              <a href={m.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                Source: {m.title || 'arXiv'} <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
        {asking && <p className="text-xs text-zinc-500 animate-pulseSoft">Thinking…</p>}
      </div>
      <form onSubmit={ask} className="flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this paper…" className="flex-1 rounded-md border border-edge bg-base px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
        <Button>Ask</Button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white">
        <ArrowLeft size={14} /> Back to results
      </button>

      <header>
        <div className="flex flex-wrap gap-1.5 mb-3">{(paper.categories || []).map((c) => <Tag key={c}>{c}</Tag>)}</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{paper.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {(paper.authors || []).join(', ')} · {paper.published ? new Date(paper.published).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          {typeof citations === 'number' && ` · ${citations.toLocaleString()} citations`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={paper.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-edge text-sm hover:bg-card">
            arXiv page <ExternalLink size={13} />
          </a>
          {paper.pdfUrl && <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-edge text-sm hover:bg-card">PDF</a>}
          <Button variant="subtle" onClick={async () => { await api.savePaper(paper); setStatus(paper.arxivId, 'reading'); toast('Saved to your library'); }}>
            <Bookmark size={14} /> Save
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
          <div className="pt-5">
            {tab === 'Overview' && (
              <div className="space-y-5">
                <div className="rounded-lg border border-edge bg-panel p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-500">Paper metadata</span>
                    <a href={paper.url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">Source · arXiv</a>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{paper.abstract}</p>
                </div>
                <InsightCard title="Summary">
                  <p className="text-sm text-zinc-300 leading-relaxed">{paper.summary}</p>
                </InsightCard>
              </div>
            )}
            {tab === 'AI Summary' && <InsightCard title="Summary"><p className="text-sm text-zinc-300 leading-relaxed">{paper.summary}</p></InsightCard>}
            {tab === 'Key Findings' && <InsightCard title="Key findings"><ListBlock items={paper.keyFindings} /></InsightCard>}
            {tab === 'Methodology' && <InsightCard title="Methodology"><ListBlock items={paper.methodology} /></InsightCard>}
            {tab === 'Datasets' && <InsightCard title="Datasets"><ListBlock items={paper.datasets} /></InsightCard>}
            {tab === 'Limitations' && (
              <InsightCard title="Limitations">
                {limits.length ? <ListBlock items={limits} /> : <p className="text-sm text-zinc-500">No limitations explicitly stated in the abstract.</p>}
              </InsightCard>
            )}
            {tab === 'Future Work' && (
              <InsightCard title="Future work">
                {futureWork.length ? <ListBlock items={futureWork} /> : <p className="text-sm text-zinc-500">No future-work notes were explicitly stated in the abstract.</p>}
              </InsightCard>
            )}
            {tab === 'Citations' && (
              <div className="rounded-lg border border-edge bg-panel p-5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Citation data</span>
                <p className="text-sm text-zinc-300">
                  {typeof citations === 'number' ? `${citations.toLocaleString()} citations according to Semantic Scholar.` : 'Citation data unavailable.'}
                </p>
                <a href={`https://www.semanticscholar.org/arxiv/${paper.arxivId}`} target="_blank" rel="noreferrer" className="text-sm text-brand hover:underline">View on Semantic Scholar</a>
              </div>
            )}
            {tab === 'Related Papers' && (
              <div className="grid gap-4 md:grid-cols-2">
                {related.map((p) => <PaperCard key={p.arxivId} paper={p} onOpen={onOpen} />)}
                {related.length === 0 && <p className="text-sm text-zinc-500">No related papers found.</p>}
              </div>
            )}
            {tab === 'AI Q&A' && (
              <InsightCard title="Ask about this paper">
                <p className="text-sm text-zinc-400">Use the Research Assistant panel to ask grounded questions about this paper.</p>
              </InsightCard>
            )}
          </div>
        </div>
        <div>{Assistant}</div>
      </div>
    </div>
  );
}
