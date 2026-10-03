import { useEffect, useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { api } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, Button, Tag } from '../components/ui.jsx';

export default function ReadingLists({ onOpen }) {
  const [lists, setLists] = useState([]);
  const [name, setName] = useState('');
  const [papers, setPapers] = useState({}); // arxivId -> paper
  const { listMembership, addToList, toast } = useApp();
  const [addInput, setAddInput] = useState({});

  const load = () => api.getLists().then(setLists).catch(() => {});
  useEffect(() => { load(); }, []);

  const ids = Object.values(listMembership).flat();
  useEffect(() => {
    ids.forEach((id) => {
      if (!papers[id]) api.getPaper(id).then((p) => setPapers((m) => ({ ...m, [id]: p }))).catch(() => {});
    });
    // eslint-disable-next-line
  }, [JSON.stringify(ids)]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reading lists</h1>
        <p className="text-sm text-zinc-500 mt-1">Organize papers into curated reading collections.</p>
      </div>

      <form
        className="flex gap-2 max-w-md"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await api.addList(name.trim());
          setName('');
          toast('Reading list created');
          load();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New list name…" className="flex-1 rounded-md border border-edge bg-panel px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
        <Button><Plus size={14} /> Create</Button>
      </form>

      {lists.length === 0 && <EmptyState icon={ListChecks} title="No reading lists" body="Create a list to start organizing your reading." />}

      <div className="space-y-5">
        {lists.map((list) => {
          const memberIds = listMembership[list._id] || [];
          return (
            <div key={list._id} className="rounded-lg border border-edge bg-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{list.name}</h3>
                <Tag>{memberIds.length} papers</Tag>
              </div>
              <form
                className="flex gap-2 mb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const id = (addInput[list._id] || '').trim();
                  if (!id) return;
                  addToList(list._id, id);
                  setAddInput((m) => ({ ...m, [list._id]: '' }));
                  toast('Added to list');
                }}
              >
                <input value={addInput[list._id] || ''} onChange={(e) => setAddInput((m) => ({ ...m, [list._id]: e.target.value }))} placeholder="Add paper by arXiv ID…" className="flex-1 rounded-md border border-edge bg-base px-3 py-1.5 text-sm focus:outline-none focus:border-zinc-600" />
                <Button variant="ghost">Add</Button>
              </form>
              <ul className="divide-y divide-edge">
                {memberIds.map((id) => (
                  <li key={id} className="py-2.5 flex items-center justify-between gap-4">
                    <button onClick={() => onOpen(id)} className="text-sm text-zinc-300 hover:text-brand text-left truncate">
                      {papers[id]?.title || id}
                    </button>
                    <button onClick={() => onOpen(id)} className="text-xs text-zinc-500 hover:text-white shrink-0">Open</button>
                  </li>
                ))}
                {memberIds.length === 0 && <li className="py-2 text-sm text-zinc-600">No papers yet — add one by arXiv ID.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
