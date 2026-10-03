const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  searchPapers: (q, max = 12) => request(`/papers/search?q=${encodeURIComponent(q)}&max=${max}`),
  getPaper: (id) => request(`/papers/paper?id=${encodeURIComponent(id)}`),
  analyzePaper: (id) => request(`/papers/paper/analyze?id=${encodeURIComponent(id)}`),
  trends: (q) => request(`/papers/trends/analysis?q=${encodeURIComponent(q)}`),
  gaps: (q) => request(`/papers/gaps/analysis?q=${encodeURIComponent(q)}`),
  chat: (arxivId, question) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ arxivId, question }) }),
  getSaved: () => request('/library/papers'),
  savePaper: (paper) => request('/library/papers', { method: 'POST', body: JSON.stringify(paper) }),
  deleteSaved: (id) => request(`/library/papers/${id}`, { method: 'DELETE' }),
  getNotes: () => request('/library/notes'),
  addNote: (note) => request('/library/notes', { method: 'POST', body: JSON.stringify(note) }),
  deleteNote: (id) => request(`/library/notes/${id}`, { method: 'DELETE' }),
  getLists: () => request('/library/lists'),
  addList: (name) => request('/library/lists', { method: 'POST', body: JSON.stringify({ name }) }),
  getHistory: () => request('/history'),
  getCitations: async (arxivIds) => {
    if (!arxivIds?.length) return {};
    try {
      const res = await fetch('https://api.semanticscholar.org/graph/v1/paper/batch?fields=citationCount,externalIds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: arxivIds.map((id) => `arXiv:${id.split('v')[0]}`) }),
      });
      if (!res.ok) return {};
      const data = await res.json();
      const map = {};
      data.forEach((p, i) => {
        if (p) map[arxivIds[i]] = p.citationCount ?? null;
      });
      return map;
    } catch {
      return {};
    }
  },
};
