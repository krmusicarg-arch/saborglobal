import { Recipe, db } from './db/localDb';
import { syncRecipes } from './services/syncService';

export const recipeService = {
  async getAll() {
    // Return all recipes that are NOT marked as deleted
    return await db.recipes.filter(r => r.deleted !== 1).toArray();
  },

  async save(recipe: Omit<Recipe, 'updatedAt' | 'synced' | 'deleted'>) {
    const now = Date.now();
    const data: Recipe = {
      ...recipe,
      updatedAt: now,
      synced: 0,
      deleted: 0
    };

    if (recipe.id) {
      const { id, ...rest } = data;
      await db.recipes.update(id, rest);
    } else {
      await db.recipes.add(data);
    }

    // Try sync in background
    syncRecipes();
  },

  async delete(id: number) {
    const recipe = await db.recipes.get(id);
    if (recipe) {
      if (recipe.remoteId) {
        // Soft delete for sync
        await db.recipes.update(id, { deleted: 1, synced: 0, updatedAt: Date.now() });
      } else {
        // Hard delete if never synced
        await db.recipes.delete(id);
      }
    }
    syncRecipes();
  }
};
