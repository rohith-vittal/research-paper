import { useEffect, useMemo, useState } from 'react';
import { BookMarked, Star, BookOpen, CheckCircle2, StickyNote } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, LoadingSkeleton, Tag, Button } from '../components/ui.jsx';

const SECTIONS = [
  { key: 'all', label: 'All papers' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'reading', label: 'Reading' },
  { key: 'completed', label: 'Completed' },
];

export default function Library({ onOpen }) {
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('all');
  const [noteForm, setNoteForm] = useState({ paperTitle: '', content: '' });
  const { favorites, toggleFavorite, readingStatus, setStatus, toast } = useApp();

  const load = async () => {
    try {
      const [p, n] = await Promise.all([api.getSaved(), api.getNotes()]);
      setPapers(p);
      setNotes(n);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    switch (section) {
      case 'favorites': return papers.filter((p) => favorites.includes(p.arxivId));
      case 'reading': return papers.filter((p) => readingStatus[p.arxivId] === 'reading');
      case 'completed': return papers.filter((p) => readingStatus[p.arxivId] === 'completed');
      default: return papers;
    }
  }, [papers, section, favorites, readingStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Library</h1>
        <p className="text-sm text-zinc-500 mt-1">Your saved papers, reading progress, and notes.</p>
      </div>

      <div className="flex gap-2 border-b border-edge pb-0 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button key={s.key} onClick={() => setSection(s.key)} className={`px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap ${section === s.key ? 'border-brand text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading && <LoadingSkeleton rows={2} />}
      {!loading && filtered.length === 0 && (
        <EmptyState icon={BookMarked} title="Nothing here yet" body="Save papers from Discover and track their reading status." />
      )}

      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p._id} className="rounded-lg border border-edge bg-panel p-4 flex gap-4">
            <div className="hidden sm:grid place-items-center h-14 w-14 rounded-md bg-brand/10 text-brand shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 onClick={() => onOpen(p.arxivId)} className="font-medium leading-snug cursor-pointer hover:text-brand transition-colors">{p.title}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">{(p.authors || []).slice(0, 3).join(', ')} · saved {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(p.categories || []).slice(0, 3).map((c) => <Tag key={c}>{c}</Tag>)}
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <button onClick={() => toggleFavorite(p.arxivId)} className={`inline-flex items-center gap-1 ${favorites.includes(p.arxivId) ? 'text-amber-300' : 'text-zinc-500 hover:text-white'}`}>
                  <Star size={13} /> Favorite
                </button>
                <select
                  value={readingStatus[p.arxivId] || ''}
                  onChange={(e) => setStatus(p.arxivId, e.target.value || null)}
                  className="rounded border border-edge bg-base px-2 py-1 text-xs text-zinc-400"
                >
                  <option value="">No status</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={async () => { await api.deleteSaved(p._id); load(); }} className="text-zinc-500 hover:text-red-400">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><StickyNote size={16} /> Notes</h2>
        <form
          className="flex flex-col sm:flex-row gap-2 mb-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!noteForm.paperTitle.trim() || !noteForm.content.trim()) return;
            await api.addNote(noteForm);
            setNoteForm({ paperTitle: '', content: '' });
            load();
          }}
        >
          <input className="rounded-md border border-edge bg-panel px-3 py-2 text-sm flex-1 focus:outline-none focus:border-zinc-600" placeholder="Paper title" value={noteForm.paperTitle} onChange={(e) => setNoteForm({ ...noteForm, paperTitle: e.target.value })} />
          <input className="rounded-md border border-edge bg-panel px-3 py-2 text-sm flex-[2] focus:outline-none focus:border-zinc-600" placeholder="Your note…" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
          <Button>Add note</Button>
        </form>
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n._id} className="rounded-lg border border-edge bg-panel p-4 flex justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{n.paperTitle}</p>
                <p className="text-sm text-zinc-400 mt-0.5">{n.content}</p>
              </div>
              <button className="text-xs text-zinc-500 hover:text-red-400 shrink-0" onClick={async () => { await api.deleteNote(n._id); load(); }}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
