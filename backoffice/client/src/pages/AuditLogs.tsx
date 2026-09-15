import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.js';
import api from '../services/api.js';
import { AuditLog } from '../types/index.js';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/audit-logs?page=${p}&limit=${limit}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE') || action.includes('REVOKE')) return 'danger';
    if (action.includes('CREATE') || action.includes('BOOTSTRAP')) return 'success';
    if (action.includes('UPDATE')) return 'primary';
    if (action.includes('IMPORT')) return 'purple';
    return 'gray';
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Journal d’Audit & Sécurité"
        subtitle="Traçabilité complète de l’ensemble des opérations administratives"
      />

      <div className="p-8 flex-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date & Heure</th>
                  <th className="px-6 py-3.5">Administrateur</th>
                  <th className="px-6 py-3.5">Action Exécutée</th>
                  <th className="px-6 py-3.5">Cible & Contexte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User size={12} />
                        </div>
                        <span className="font-bold text-slate-800">
                          {log.admin_email || 'Système'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={getActionBadge(log.action)}>{log.action}</Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          Type : <span className="font-mono text-[11px] text-blue-600">{log.target_type}</span>
                          {log.target_id && (
                            <span className="text-slate-400 text-[10px] ml-2 font-mono">
                              (ID: {log.target_id.substring(0, 12)}...)
                            </span>
                          )}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Aucun journal d’audit enregistré pour l’instant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Page {page} sur {totalPages} ({total} événement(s))
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
