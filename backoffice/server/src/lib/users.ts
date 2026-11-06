export function isTesterUser(u: { email?: string | null; user_metadata?: Record<string, any> | null }): boolean {
  return Boolean(
    u.user_metadata?.is_test_user ||
    u.email?.includes('cezame-test.app') ||
    u.email?.includes('test.cezame.app')
  );
}

export function resolveUserRole(adminRole: string | undefined, isTester: boolean): string {
  return adminRole || (isTester ? 'tester' : 'user');
}

// Liste affichée quand la clé de service manque : on ne connaît que les identifiants.
export function buildFallbackUsers(userIds: string[], now: Date = new Date()) {
  return Array.from(new Set(userIds)).map((id) => ({
    id,
    email: `utilisateur-${id.substring(0, 8)}@cezame.app`,
    created_at: now.toISOString(),
    user_metadata: { username: `Apprenant_${id.substring(0, 4)}` },
    isFallback: true,
  }));
}
