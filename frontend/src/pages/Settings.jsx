import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Button, Modal } from '../components/ui.jsx';

export default function Settings() {
  const { profile, setProfile, toast } = useApp();
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Personalize your ResearchAI experience.</p>
      </div>

      <section className="rounded-lg border border-edge bg-panel p-5 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <label className="block">
          <span className="text-xs text-zinc-500">Display name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-edge bg-base px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500">Role</span>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-md border border-edge bg-base px-3 py-2 text-sm focus:outline-none focus:border-zinc-600" />
        </label>
        <Button onClick={() => { setProfile({ name, role }); toast('Profile updated'); }}>Save changes</Button>
      </section>

      <section className="rounded-lg border border-edge bg-panel p-5">
        <h2 className="font-semibold mb-1">Local data</h2>
        <p className="text-sm text-zinc-500 mb-4">Clears compare tray, favorites, reading statuses, and recent papers stored locally.</p>
        <Button variant="danger" onClick={() => setConfirm(true)}>Clear local data</Button>
      </section>

      <Modal open={confirm} title="Clear local data?" onClose={() => setConfirm(false)}>
        <p className="text-sm text-zinc-400 mb-5">This will remove your locally stored compare list, favorites, reading statuses, and recent papers. Server-side saved papers and notes are not affected.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              ['ra_compare', 'ra_favorites', 'ra_status', 'ra_recent', 'ra_lists'].forEach((k) => localStorage.removeItem(k));
              setConfirm(false);
              toast('Local data cleared — reload to apply');
            }}
          >
            Clear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
