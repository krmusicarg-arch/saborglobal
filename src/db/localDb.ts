import Dexie, { Table } from 'dexie';

export interface Recipe {
  id?: number;
  remoteId?: string; // ID from the server
  title: string;
  origin: string;
  link: string;
  rating: number;
  observations: string;
  updatedAt: number;
  synced: number; // 0 for false, 1 for true
  deleted?: number; // 0 for false, 1 for true
}

export class MyDatabase extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('SaborGlobalDB');
    this.version(1).stores({
      recipes: '++id, remoteId, origin, rating, synced, deleted'
    });
  }
}

export const db = new MyDatabase();
