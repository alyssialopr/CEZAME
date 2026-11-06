export interface ImportRequest {
  targetCategoryId: string;
  targetUnitId: string;
  payload: unknown;
}

// Prépare le corps de POST /import-export/lessons. Lève une erreur si un champ
// manque ou si le JSON collé est invalide.
export function buildImportRequest(categoryId: string, unitId: string, jsonText: string): ImportRequest {
  if (!categoryId || !unitId || !jsonText) {
    throw new Error('Veuillez remplir tous les champs et coller le JSON');
  }
  return { targetCategoryId: categoryId, targetUnitId: unitId, payload: JSON.parse(jsonText) };
}
