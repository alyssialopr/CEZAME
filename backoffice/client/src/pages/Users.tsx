import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import api from '../services/api.js';
import { MobileUser } from '../types/index.js';
import {
  Search,
  Trash2,
  Eye,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<MobileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Modal Détails
  const [detailsUser, setDetailsUser] = useState<any | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Suppression
  const [deleteTarget, setDeleteTarget] = useState<MobileUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
      if (res.data.warning) {
        setWarningMessage(res.data.warning);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Impossible de récupérer la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDetails = async (user: MobileUser) => {
    setDetailsUser(user);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/users/${user.id}`);
      setUserProgress(res.data.progress || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers();
      alert('Utilisateur supprimé avec succès');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression de l’utilisateur');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      u.id.includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Gestion des Utilisateurs"
        subtitle="Consultez les apprenants, leur assiduité et gérez les comptes"
      />

      <div className="p-8 flex-1 space-y-6">
        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Information de configuration :</p>
              <p className="mt-0.5">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* Barre de recherche et stats */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par pseudo, email ou identifiant..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </span>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Utilisateur</th>
                  <th className="px-6 py-3.5">Rôle</th>
                  <th className="px-6 py-3.5">Leçons complétées</th>
                  <th className="px-6 py-3.5">Date d'inscription</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center font-bold">
                          {(user.username || user.email || 'U').substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">
                            {user.username || 'Sans pseudo'}
                          </p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {user.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          user.role === 'superadmin'
                            ? 'purple'
                            : user.role === 'admin'
                            ? 'primary'
                            : 'gray'
                        }
                      >
                        {user.role === 'superadmin'
                          ? 'Superadmin'
                          : user.role === 'admin'
                          ? 'Admin'
                          : 'Apprenant'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Award size={14} className="text-amber-500" />
                        {user.completedLessonsCount} validée(s)
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Voir la progression"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DÉTAILS PROGRESSION */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Progression de ${detailsUser?.username || detailsUser?.email}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">{detailsUser?.email}</p>
              <p className="text-slate-500">Identifiant : {detailsUser?.id}</p>
            </div>
            <Badge variant="primary">{userProgress.length} leçons suivies</Badge>
          </div>

          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Historique des Leçons
          </h4>

          {detailsLoading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chargement de la progression...</p>
          ) : userProgress.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {userProgress.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {p.lessons?.title || 'Leçon sans titre'}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Catégorie : {p.lessons?.category_id} • Récompense : {p.lessons?.xp_reward} XP
                    </span>
                  </div>
                  <div className="text-right">
                    <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>
                      {p.status === 'completed' ? 'Complétée' : p.status}
                    </Badge>
                    {p.completed_at && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Le {new Date(p.completed_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Cet utilisateur n'a pas encore commencé de leçon sur l'application.
            </p>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDetailsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION SUPPRESSION UTILISATEUR */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Supprimer définitivement l'utilisateur"
        message={`Êtes-vous absolument sûr de vouloir supprimer le compte de ${
          deleteTarget?.email || deleteTarget?.username
        } ? Toutes ses progressions de cours et données d'authentification seront irréversiblement effacées.`}
        confirmText="Supprimer le compte"
        loading={actionLoading}
      />
    </div>
  );
};
