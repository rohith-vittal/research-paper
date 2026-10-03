import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

export async function searchArxiv(query, maxResults = 12) {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    query
  )}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml);
  let entries = doc?.feed?.entry || [];
  if (!Array.isArray(entries)) entries = [entries];
  return entries.map((e) => {
    const idUrl = typeof e.id === 'string' ? e.id : e.id?.['#text'] || '';
    const arxivId = idUrl.split('/abs/')[1] || '';
    const authors = Array.isArray(e.author) ? e.author : [e.author].filter(Boolean);
    const categories = Array.isArray(e.category) ? e.category : [e.category].filter(Boolean);
    const links = Array.isArray(e.link) ? e.link : [e.link].filter(Boolean);
    const pdf = links.find((l) => l['@_title'] === 'pdf');
    return {
      arxivId,
      title: (e.title || '').replace(/\s+/g, ' ').trim(),
      authors: authors.map((a) => a.name),
      abstract: (e.summary || '').replace(/\s+/g, ' ').trim(),
      published: e.published,
      updated: e.updated,
      categories: categories.map((c) => c['@_term']).filter(Boolean),
      url: idUrl,
      pdfUrl: pdf ? pdf['@_href'] : '',
    };
  });
}

export async function getArxivPaper(arxivId) {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml);
  let entries = doc?.feed?.entry || [];
  if (!Array.isArray(entries)) entries = [entries];
  if (!entries.length || !entries[0].title) return null;
  const e = entries[0];
  const authors = Array.isArray(e.author) ? e.author : [e.author].filter(Boolean);
  const categories = Array.isArray(e.category) ? e.category : [e.category].filter(Boolean);
  const links = Array.isArray(e.link) ? e.link : [e.link].filter(Boolean);
  const pdf = links.find((l) => l['@_title'] === 'pdf');
  return {
    arxivId,
    title: (e.title || '').replace(/\s+/g, ' ').trim(),
    authors: authors.map((a) => a.name),
    abstract: (e.summary || '').replace(/\s+/g, ' ').trim(),
    published: e.published,
    categories: categories.map((c) => c['@_term']).filter(Boolean),
    url: `https://arxiv.org/abs/${arxivId}`,
    pdfUrl: pdf ? pdf['@_href'] : '',
  };
}
