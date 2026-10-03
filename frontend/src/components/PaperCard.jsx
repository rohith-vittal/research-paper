import { Bookmark, GitCompareArrows, Check, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Tag } from './ui.jsx';

export default function PaperCard({ paper, citations, onOpen }) {
  const { compare, toggleCompare, toast, setStatus } = useApp();
  const inCompare = compare.includes(paper.arxivId);

  return (
    <article className="group rounded-lg border border-edge bg-panel p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-lift hover:-translate-y-0.5 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <FileText size={12} />
        <span>arXiv{paper.source ? ` · ${paper.source}` : ''}</span>
        <span>·</span>
        <span>{paper.published ? new Date(paper.published).getFullYear() : ''}</span>
        {typeof citations === 'number' && (
          <>
            <span>·</span>
            <span className="text-zinc-400">{citations.toLocaleString()} citations</span>
          </>
        )}
      </div>

      <h3
        onClick={() => onOpen(paper.arxivId)}
        className="mt-2 text-[15px] font-semibold leading-snug text-white cursor-pointer group-hover:text-brand transition-colors"
      >
        {paper.title}
      </h3>

      <p className="mt-1 text-xs text-zinc-500">
        {(paper.authors || []).slice(0, 4).join(', ')}
        {(paper.authors || []).length > 4 ? ' et al.' : ''}
      </p>

      <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{paper.abstract}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(paper.categories || []).slice(0, 3).map((c) => <Tag key={c}>{c}</Tag>)}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <button onClick={() => onOpen(paper.arxivId)} className="text-brand hover:underline underline-offset-4 font-medium">
          View paper
        </button>
        <span className="text-zinc-700">|</span>
        <button
          onClick={async () => { try { await api.savePaper(paper); setStatus(paper.arxivId, 'reading'); toast('Saved to your library'); } catch (e) { toast(e.message, 'error'); } }}
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
        >
          <Bookmark size={14} /> Save
        </button>
        <button
          onClick={() => toggleCompare(paper.arxivId)}
          className={`inline-flex items-center gap-1 ${inCompare ? 'text-brand' : 'text-zinc-400 hover:text-white'}`}
        >
          {inCompare ? <Check size={14} /> : <GitCompareArrows size={14} />} Compare
        </button>
      </div>
    </article>
  );
}
