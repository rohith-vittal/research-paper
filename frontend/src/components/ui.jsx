import { AlertTriangle, X } from 'lucide-react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-black hover:opacity-90',
    ghost: 'border border-edge text-zinc-300 hover:bg-card',
    subtle: 'bg-card border border-edge text-zinc-200 hover:border-zinc-600',
    danger: 'border border-red-900/60 text-red-400 hover:bg-red-950/40',
  };
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Tag({ children, className = '' }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border border-edge bg-card text-xs text-zinc-400 ${className}`}>{children}</span>;
}

export function AITag() {
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-brand/30 bg-brand/10 text-xs text-brand">AI-generated analysis</span>;
}

export function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="rounded-lg border border-edge bg-panel p-5 transition-all hover:border-zinc-700 hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
        {Icon && <Icon size={14} />} {label}
      </div>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="rounded-lg border border-dashed border-edge bg-panel/50 p-12 text-center animate-fade-in">
      {Icon && <Icon className="mx-auto text-zinc-700" size={36} />}
      <h3 className="mt-3 font-medium text-zinc-200">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border border-edge bg-panel p-5 animate-pulseSoft">
          <div className="h-4 w-2/3 bg-zinc-800 rounded" />
          <div className="mt-3 h-3 w-full bg-zinc-800/70 rounded" />
          <div className="mt-2 h-3 w-5/6 bg-zinc-800/70 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-sm text-red-300 flex items-center gap-3">
      <AlertTriangle size={18} />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-red-200 underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-edge bg-panel p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-edge">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3.5 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
            active === t ? 'border-brand text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
