import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const authState = vi.hoisted(() => ({ value: { user: null as any, loading: false } }));

vi.mock('../contexts/AuthContext.js', () => ({
  useAuth: () => authState.value,
  AuthProvider: ({ children }: any) => children,
}));

import { ProtectedRoute } from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Page de connexion</p>} />
        <Route path="/" element={<ProtectedRoute><p>Zone admin</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirige vers /login sans utilisateur', () => {
    authState.value = { user: null, loading: false };
    renderAt('/');
    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
  });

  it('affiche un chargement tant que la session est vérifiée', () => {
    authState.value = { user: null, loading: true };
    renderAt('/');
    expect(screen.getByText(/Chargement de la session admin/)).toBeInTheDocument();
  });

  it('affiche le contenu pour un admin connecté', () => {
    authState.value = { user: { id: '1', role: 'admin' }, loading: false };
    renderAt('/');
    expect(screen.getByText('Zone admin')).toBeInTheDocument();
  });
});
