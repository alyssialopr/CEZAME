import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';
import {
  UserPlus,
  ShieldCheck,
  Trash2,
  Lock,
  Mail,
  User,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';

interface AdminAccount {
  userId: string;
  role: 'admin' | 'superadmin';
  email: string;
  username: string;
  created_at: string;
}

export const Admins: React.FC = () => {
  const { user: currentAdmin, isSuperadmin } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Création Admin
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    username: '',
    role: 'admin' as 'admin' | 'superadmin',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog Révocation
  const [revokeTarget, setRevokeTarget] = useState<AdminAccount | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admins');
      setAdmins(res.data.admins || []);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Impossible de récupérer la liste des administrateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      fetchAdmins();
    }
  }, [isSuperadmin]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/admins', createForm);
      setCreateModalOpen(false);
      setCreateForm({
        email: '',
        password: '',
        username: '',
        role: 'admin',
      });
      await fetchAdmins();
      alert('Administrateur créé avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (admin: AdminAccount, newRole: 'admin' | 'superadmin') => {
    if (admin.userId === currentAdmin?.id && newRole !== 'superadmin') {
      alert('Vous ne pouvez pas retirer vos propres droits de superadmin.');
      return;
    }

    try {
      await api.patch(`/admins/${admin.userId}`, { role: newRole });
      await fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la modification du rôle');
    }
  };

  const handleRevokeAdmin = async () => {
    if (!revokeTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/admins/${revokeTarget.userId}`);
      setRevokeTarget(null);
      await fetchAdmins();
      alert('Droits administrateur révoqués avec succès.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la révocation');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Accès Réservé aux Superadmins</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Vous devez posséder le statut de super-administrateur pour accéder à la gestion des rôles.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Gestion des Administrateurs"
        subtitle="Contrôlez les accès au backoffice et accordez les privilèges de gestion"
        action={
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <UserPlus size={16} />
            <span>Ajouter un Administrateur</span>
          </button>
        }
      />

      <div className="p-8 flex-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Administrateur</th>
                  <th className="px-6 py-3.5">Rôle Attribué</th>
                  <th className="px-6 py-3.5">Date d'attribution</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => {
                  const isCurrent = admin.userId === currentAdmin?.id;

                  return (
                    <tr key={admin.userId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {admin.username}
                              </span>
                              {isCurrent && <Badge variant="success">Vous</Badge>}
                            </div>
                            <p className="text-[11px] text-slate-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={admin.role}
                          disabled={isCurrent}
                          onChange={(e) =>
                            handleRoleChange(admin, e.target.value as 'admin' | 'superadmin')
                          }
                          className="px-3 py-1 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-75 focus:outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => setRevokeTarget(admin)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Révoquer les droits d'administration"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && admins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Aucun compte administrateur listé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CRÉER UN ADMIN */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Créer un compte Administrateur"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pseudo / Nom</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="ex: Alex Admin"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Professionnel</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="admin.alex@cezame.app"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mot de passe initial
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Au moins 6 caractères"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Privilèges accordés</label>
            <div className="relative">
              <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value as 'admin' | 'superadmin' })
                }
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="admin">Admin (Gestion du contenu & utilisateurs)</option>
                <option value="superadmin">Superadmin (Tous droits + gestion des admins)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Création en cours...' : 'Créer l’administrateur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION RÉVOCATION */}
      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeAdmin}
        title="Révoquer les droits d'administration"
        message={`Êtes-vous certain de vouloir retirer tous les privilèges d'administration de ${revokeTarget?.email} ? Il ne pourra plus accéder à cette plateforme.`}
        confirmText="Révoquer l'accès"
        loading={actionLoading}
      />
    </div>
  );
};
