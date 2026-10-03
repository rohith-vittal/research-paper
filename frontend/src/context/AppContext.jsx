import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  const [compare, setCompare] = useState(() => read('ra_compare', []));
  const [favorites, setFavorites] = useState(() => read('ra_favorites', []));
  const [readingStatus, setReadingStatus] = useState(() => read('ra_status', {}));
  const [recentPapers, setRecentPapers] = useState(() => read('ra_recent', []));
  const [listMembership, setListMembership] = useState(() => read('ra_lists', {}));
  const [profile, setProfile] = useState(() => read('ra_profile', { name: 'Researcher', role: 'AI Researcher' }));
  const [toasts, setToasts] = useState([]);

  useEffect(() => localStorage.setItem('ra_compare', JSON.stringify(compare)), [compare]);
  useEffect(() => localStorage.setItem('ra_favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('ra_status', JSON.stringify(readingStatus)), [readingStatus]);
  useEffect(() => localStorage.setItem('ra_recent', JSON.stringify(recentPapers)), [recentPapers]);
  useEffect(() => localStorage.setItem('ra_lists', JSON.stringify(listMembership)), [listMembership]);
  useEffect(() => localStorage.setItem('ra_profile', JSON.stringify(profile)), [profile]);

  const toast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const toggleCompare = (id) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? (toast('Compare supports up to 4 papers', 'error'), c) : [...c, id]));

  const toggleFavorite = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const setStatus = (id, status) =>
    setReadingStatus((s) => (status ? { ...s, [id]: status } : Object.fromEntries(Object.entries(s).filter(([k]) => k !== id))));

  const pushRecent = (paper) =>
    setRecentPapers((r) => [{ arxivId: paper.arxivId, title: paper.title, authors: paper.authors, published: paper.published, url: paper.url }, ...r.filter((p) => p.arxivId !== paper.arxivId)].slice(0, 8));

  const addToList = (listId, arxivId) =>
    setListMembership((m) => ({ ...m, [listId]: Array.from(new Set([...(m[listId] || []), arxivId])) }));

  const value = useMemo(
    () => ({ compare, toggleCompare, favorites, toggleFavorite, readingStatus, setStatus, recentPapers, pushRecent, listMembership, addToList, profile, setProfile, toasts, toast }),
    [compare, favorites, readingStatus, recentPapers, listMembership, profile, toasts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
