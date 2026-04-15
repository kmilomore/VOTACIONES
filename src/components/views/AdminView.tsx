'use client';

import { useEffect, useState } from 'react';

import type { AdminAuditEntry, AdminMetrics, EstamentoResult, SchoolResult } from '@/types';

interface AdminViewProps {
  metrics: AdminMetrics;
  auditLog: AdminAuditEntry[];
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(part: number, total: number): string {
  if (total === 0) return '0.0';
  return ((part / total) * 100).toFixed(1);
}

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'ahora mismo';
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  return `hace ${m}m`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">{label}</span>
      <span
        className="text-3xl font-bold leading-none"
        style={{ color: accent ?? '#0b5294' }}
      >
        {value}
      </span>
      {sub && <span className="text-sm text-gray-600 mt-1">{sub}</span>}
    </div>
  );
}

function ProgressBar({
  value,
  max,
  color,
  height = 10,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="w-full rounded-full overflow-hidden bg-gray-100"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

function EstamentoCard({ data }: { data: EstamentoResult }) {
  const maxVotes = Math.max(...data.candidates.map((c) => c.votes), 1);
  const participationPct = pct(data.votesCast, data.padronCount);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ backgroundColor: data.color, color: '#fff' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">{data.label}</span>
          <span className="text-sm font-semibold opacity-90">
            {data.votesCast} / {data.padronCount}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar
            value={data.votesCast}
            max={data.padronCount}
            color="rgba(255,255,255,0.7)"
            height={8}
          />
          <p className="text-xs text-white/80 mt-1">{participationPct}% participación</p>
        </div>
      </div>

      {/* Candidate results */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Resultados por candidato
        </p>
        {data.candidates.map((c) => (
          <div key={c.id}>
            <div className="flex items-center gap-2 mb-1">
              {/* Badge */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: c.accentColor }}
              >
                {c.initials}
              </div>
              <span className="text-sm font-medium text-gray-800 flex-1 truncate">{c.name}</span>
              <span className="text-sm font-bold" style={{ color: c.accentColor }}>
                {c.votes}
              </span>
              <span className="text-xs text-gray-600 w-10 text-right">
                {data.votesCast > 0
                  ? `${pct(c.votes, data.votesCast)}%`
                  : '—'}
              </span>
            </div>
            <div className="ml-9">
              <ProgressBar
                value={c.votes}
                max={maxVotes}
                color={c.accentColor}
                height={6}
              />
            </div>
          </div>
        ))}
        {data.votesCast === 0 && (
          <p className="text-xs text-gray-600 italic text-center py-2">
            Ningún voto registrado aún
          </p>
        )}
      </div>
    </div>
  );
}

type SortKey = 'name' | 'status';

function SchoolsTable({ schools }: { schools: SchoolResult[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function schoolScore(s: SchoolResult): number {
    const v = s.voted;
    return (v.directivos ? 1 : 0) + (v.docentes ? 1 : 0) + (v.asistentes ? 1 : 0);
  }

  const sorted = [...schools].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
    else cmp = schoolScore(b) - schoolScore(a);
    return sortAsc ? cmp : -cmp;
  });

  function EstamentoStatus({ voted }: { voted: boolean }) {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
          voted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
        }`}
        title={voted ? 'Ha votado' : 'Sin votos'}
      >
        {voted ? '✓' : '—'}
      </span>
    );
  }

  function SchoolStatusBadge({ school }: { school: SchoolResult }) {
    const score = schoolScore(school);
    if (score === 3) return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Completo</span>;
    if (score > 0) return <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Parcial ({score}/3)</span>;
    return <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-full">Sin votos</span>;
  }

  function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
    if (!active) return <span className="text-gray-500 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{asc ? '↑' : '↓'}</span>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Establecimientos ({schools.length})</h3>
        <span className="text-xs text-gray-600">
          {schools.filter((s) => schoolScore(s) > 0).length} con actividad
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th
                className="px-5 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                onClick={() => toggleSort('name')}
              >
                Establecimiento <SortIcon active={sortKey === 'name'} asc={sortAsc} />
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600" style={{ color: '#1a4a7a' }}>
                Dir.
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600" style={{ color: '#8c4f2f' }}>
                Doc.
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600" style={{ color: '#1a6a6a' }}>
                Asi.
              </th>
              <th
                className="px-5 py-3 text-right font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                onClick={() => toggleSort('status')}
              >
                Estado <SortIcon active={sortKey === 'status'} asc={sortAsc} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((school, i) => (
              <tr
                key={school.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-gray-50/30'
                }`}
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{school.name}</div>
                  <div className="text-xs text-gray-500">
                    {school.padron.directivos + school.padron.docentes + school.padron.asistentes} inscritos
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <EstamentoStatus voted={school.voted.directivos} />
                </td>
                <td className="px-4 py-3 text-center">
                  <EstamentoStatus voted={school.voted.docentes} />
                </td>
                <td className="px-4 py-3 text-center">
                  <EstamentoStatus voted={school.voted.asistentes} />
                </td>
                <td className="px-5 py-3 text-right">
                  <SchoolStatusBadge school={school} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminView
// ---------------------------------------------------------------------------

function AuditLogPanel({ entries }: { entries: AdminAuditEntry[] }) {
  const [open, setOpen] = useState(false);

  const EVENT_LABELS: Record<string, { label: string; color: string }> = {
    login_success: { label: 'Acceso exitoso', color: '#166534' },
    login_failure: { label: 'Intento fallido', color: '#92400e' },
    lockout_blocked: { label: 'IP bloqueada', color: '#991b1b' },
    access: { label: 'Consulta métricas', color: '#1e3a5f' },
    logout: { label: 'Cierre de sesión', color: '#374151' },
  };

  function formatTs(ts: number): string {
    return new Date(ts).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" aria-hidden="true">
            <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          </svg>
          <h3 className="font-bold text-gray-800">Registro de auditoría</h3>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{entries.length} eventos</span>
        </div>
        <span className="text-gray-600 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-600 italic text-center py-6">Sin eventos registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha / Hora</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Evento</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">IP</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const meta = EVENT_LABELS[entry.event] ?? { label: entry.event, color: '#6b7280' };
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700 whitespace-nowrap font-mono">{formatTs(entry.ts)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                        </td>
                        <td className="px-4 py-2 text-gray-700 font-mono">{entry.ip}</td>
                        <td className="px-4 py-2 text-gray-600">{entry.detail ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminView({ metrics, auditLog, refreshing, onRefresh, onLogout }: AdminViewProps) {
  const [timeLabel, setTimeLabel] = useState(() => relativeTime(metrics.lastUpdated));

  // Tick the "updated X seconds ago" label every second
  useEffect(() => {
    let id: number;
    function tick() {
      setTimeLabel(relativeTime(metrics.lastUpdated));
      id = window.setTimeout(tick, 1000);
    }
    tick();
    return () => window.clearTimeout(id);
  }, [metrics.lastUpdated]);

  const globalPct = pct(metrics.votes.total, metrics.padron.total);
  const activeSchools = metrics.schools.filter(
    (s) => s.voted.directivos || s.voted.docentes || s.voted.asistentes,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <header className="text-white bg-[#082f5a]" style={{ backgroundImage: 'linear-gradient(135deg, #061d3d 0%, #0a3566 52%, #0b5294 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Institutional shield */}
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 56"
              fill="none"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <path
                d="M24 2L4 10v18c0 12 8.5 22 20 26C36 50 44 40 44 28V10L24 2Z"
                fill="white"
                fillOpacity="0.15"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M24 2L4 10v18c0 12 8.5 22 20 26C36 50 44 40 44 28V10L24 2Z"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              <rect x="16" y="18" width="16" height="2.5" rx="1.25" fill="white" />
              <rect x="16" y="23" width="12" height="2.5" rx="1.25" fill="white" />
              <rect x="16" y="28" width="16" height="2.5" rx="1.25" fill="white" />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100/85">
                SLEP COLCHAGUA
              </p>
              <h1 className="text-xl font-bold leading-tight text-white">
                Panel de Métricas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs text-blue-50/90">
              <span
                className={`w-2 h-2 rounded-full ${
                  refreshing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
                }`}
              />
              {refreshing ? 'Actualizando…' : timeLabel}
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white/14 hover:bg-white/22 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg border border-white/15 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Actualizar
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Summary cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Padrón total"
            value={metrics.padron.total}
            sub="votantes inscritos"
            accent="#0b5294"
          />
          <SummaryCard
            label="Votos emitidos"
            value={metrics.votes.total}
            sub={`de ${metrics.padron.total} habilitados`}
            accent={metrics.votes.total > 0 ? '#166534' : '#6b7280'}
          />
          <SummaryCard
            label="Participación"
            value={`${globalPct}%`}
            sub="del padrón total"
            accent={
              parseFloat(globalPct) >= 50
                ? '#166534'
                : parseFloat(globalPct) > 0
                ? '#92400e'
                : '#6b7280'
            }
          />
          <SummaryCard
            label="Establecimientos"
            value={`${activeSchools} / ${metrics.schools.length}`}
            sub="con al menos un voto"
            accent={activeSchools > 0 ? '#0b5294' : '#6b7280'}
          />
        </div>

        {/* ── Global progress bar ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Participación global
            </span>
            <span className="text-sm font-bold text-gray-900">
              {metrics.votes.total} / {metrics.padron.total} votos ({globalPct}%)
            </span>
          </div>
          <ProgressBar
            value={metrics.votes.total}
            max={metrics.padron.total}
            color="#0b5294"
            height={18}
          />
          {/* Per-estamento mini breakdown below */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {metrics.estamentos.map((e) => (
              <div key={e.estamento}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium" style={{ color: e.color }}>
                    {e.label.split(' ')[0]}
                  </span>
                  <span className="text-gray-700">{e.votesCast} / {e.padronCount}</span>
                </div>
                <ProgressBar
                  value={e.votesCast}
                  max={e.padronCount}
                  color={e.color}
                  height={6}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Per-estamento cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.estamentos.map((e) => (
            <EstamentoCard key={e.estamento} data={e} />
          ))}
        </div>

        {/* ── Schools table ──────────────────────────────────────────────── */}
        <SchoolsTable schools={metrics.schools} />

        {/* ── Audit log ────────────────────────────────────────────────────── */}
        <AuditLogPanel entries={auditLog} />

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-gray-500 pb-6">
          Datos actualizados automáticamente cada 8 segundos ·{' '}
          <span className="text-gray-700 font-medium">
            Elección del Consejo Local — SLEP COLCHAGUA
          </span>
        </footer>
      </main>
    </div>
  );
}
