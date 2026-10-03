import { FileText, Sparkles, Wand2 } from 'lucide-react';

// Normalizes items that may be plain strings (legacy) or {text, provenance}.
function normalize(items = []) {
  return items.map((i) => (typeof i === 'string' ? { text: i, provenance: 'abstract' } : i));
}

function EvidenceBadge({ provenance }) {
  if (provenance === 'ai')
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-900/50 bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300/90">
        <Wand2 size={9} /> AI inference
      </span>
    );
  if (provenance === 'ai-analysis')
    return (
      <span className="inline-flex items-center gap-1 rounded border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
        <Sparkles size={9} /> AI analysis
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded border border-edge bg-card px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
      <FileText size={9} /> Source evidence
    </span>
  );
}

/**
 * Renders an evidence-tagged extraction block.
 * props:
 *  - title: section heading (e.g. 'Limitations')
 *  - items: [{text, provenance}] or string[]
 *  - foundLabel: e.g. 'identified in the paper'
 *  - aiLabel: e.g. 'identified by AI' (used when items are AI-inferred)
 *  - emptyMessage: shown when nothing was found
 */
export default function AnalysisBlock({ title, items, foundLabel, aiLabel, emptyMessage }) {
  const list = normalize(items);
  const explicit = list.filter((i) => i.provenance !== 'ai');
  const inferred = list.filter((i) => i.provenance === 'ai');

  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs text-brand">
          <Sparkles size={10} /> AI-generated analysis
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>

      {list.length === 0 && <p className="text-sm text-zinc-500">{emptyMessage}</p>}

      {explicit.length > 0 && (
        <div className="mb-4 last:mb-0">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            {title} {foundLabel} — from the paper text
          </p>
          <ul className="space-y-2.5">
            {explicit.map((i, idx) => (
              <li key={idx} className="text-sm text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 rounded-full bg-brand shrink-0" />
                  <span className="flex-1">{i.text}</span>
                  <EvidenceBadge provenance={i.provenance === 'abstract' ? 'abstract' : 'ai-analysis'} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {inferred.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-amber-400/70 mb-2">
            Potential {title.toLowerCase()} {aiLabel} — not stated explicitly
          </p>
          <ul className="space-y-2.5">
            {inferred.map((i, idx) => (
              <li key={idx} className="text-sm text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 rounded-full bg-amber-400/60 shrink-0" />
                  <span className="flex-1">{i.text}</span>
                  <EvidenceBadge provenance="ai" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
