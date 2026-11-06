// Pagination du flux d'activité : page >= 1, limite bornée entre 10 et 100.
export function activityPagination(rawPage: unknown, rawLimit: unknown) {
  const page = Math.max(1, parseInt(String(rawPage || '1'), 10));
  const limit = Math.min(100, Math.max(10, parseInt(String(rawLimit || '30'), 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Pagination des logs d'audit : valeurs par défaut 1 et 30, sans bornes.
export function auditPagination(rawPage: unknown, rawLimit: unknown) {
  const page = parseInt(rawPage as string) || 1;
  const limit = parseInt(rawLimit as string) || 30;
  const from = (page - 1) * limit;
  return { page, limit, from, to: from + limit - 1 };
}
