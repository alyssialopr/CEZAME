import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../contexts/AuthContext.js', () => ({
  useAuth: () => ({ user: null, login: mocks.login }),
}));
vi.mock('../services/api.js', () => ({ default: { get: mocks.get, post: mocks.post } }));

import { Login } from '../pages/Login';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<p>Tableau de bord</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.get.mockReset().mockResolvedValue({ data: { hasSuperadmin: true } });
  });

  it('envoie les identifiants puis ouvre le tableau de bord', async () => {
    mocks.login.mockResolvedValue({});
    renderLogin();
    await userEvent.type(screen.getByTestId('login-email'), 'admin@cezame.app');
    await userEvent.type(screen.getByTestId('login-password'), 'motdepasse');
    await userEvent.click(screen.getByTestId('login-submit'));

    expect(mocks.login).toHaveBeenCalledWith('admin@cezame.app', 'motdepasse');
    expect(await screen.findByText('Tableau de bord')).toBeInTheDocument();
  });

  it("affiche l'erreur renvoyée par login", async () => {
    mocks.login.mockResolvedValue({ error: 'Identifiants invalides' });
    renderLogin();
    await userEvent.type(screen.getByTestId('login-email'), 'x@y.z');
    await userEvent.type(screen.getByTestId('login-password'), 'faux');
    await userEvent.click(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-error')).toHaveTextContent('Identifiants invalides');
    expect(screen.queryByText('Tableau de bord')).not.toBeInTheDocument();
  });

  it("propose d'initialiser un superadmin quand il n'y en a pas", async () => {
    mocks.get.mockResolvedValue({ data: { hasSuperadmin: false } });
    renderLogin();
    await waitFor(() => expect(screen.getByText('Initialiser le premier compte Superadmin')).toBeInTheDocument());
  });
});
