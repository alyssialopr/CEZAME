import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import api from '../services/api.js';
import { Lock, Mail, Sparkles, ShieldAlert, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Bootstrap superadmin
  const [hasSuperadmin, setHasSuperadmin] = useState<boolean | null>(null);
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapUsername, setBootstrapUsername] = useState('');
  const [bootstrapSuccess, setBootstrapSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    api
      .get('/auth/system-status')
      .then((res) => {
        setHasSuperadmin(res.data.hasSuperadmin);
      })
      .catch(() => setHasSuperadmin(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await api.post('/auth/bootstrap-superadmin', {
        email: bootstrapEmail,
        password: bootstrapPassword,
        username: bootstrapUsername || 'Super Admin',
      });
      setBootstrapSuccess(true);
      setEmail(bootstrapEmail);
      setPassword(bootstrapPassword);
      setTimeout(() => {
        setShowBootstrapModal(false);
        setHasSuperadmin(true);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Erreur lors de la création du superadmin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#607FE8] to-[#8FA6FF] items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CEZAME Backoffice</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Accès réservé aux administrateurs autorisés
          </p>
        </div>

        {/* Alert Error */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Email Administrateur
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cezame.app"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-600/30 disabled:opacity-50 mt-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter au Backoffice'}
          </button>
        </form>

        {/* Notice si aucun superadmin n'existe */}
        {hasSuperadmin === false && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">Aucun compte Superadmin n'est encore configuré.</p>
            <button
              type="button"
              onClick={() => setShowBootstrapModal(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Initialiser le premier compte Superadmin
            </button>
          </div>
        )}
      </div>

      {/* Modal d'initialisation du premier superadmin */}
      {showBootstrapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Créer le premier compte Superadmin
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ce compte aura tous les droits d'administration et pourra créer d'autres admins.
            </p>

            {bootstrapSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600" />
                <span>Superadmin créé avec succès ! Vous pouvez vous connecter.</span>
              </div>
            ) : (
              <form onSubmit={handleBootstrap} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pseudo</label>
                  <input
                    type="text"
                    required
                    value={bootstrapUsername}
                    onChange={(e) => setBootstrapUsername(e.target.value)}
                    placeholder="Super Admin"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={bootstrapEmail}
                    onChange={(e) => setBootstrapEmail(e.target.value)}
                    placeholder="superadmin@cezame.app"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={bootstrapPassword}
                    onChange={(e) => setBootstrapPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBootstrapModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                  >
                    {loading ? 'Création...' : 'Créer le superadmin'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
