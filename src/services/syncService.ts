import { db, Recipe } from '../db/localDb';
import { firestore } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

export async function syncRecipes() {
  console.log('Iniciando sincronización con Firebase...');
  try {
    const recipesCol = collection(firestore, 'recipes');

    // 1. Obtener cambios locales no sincronizados
    const unsynced = await db.recipes.where('synced').equals(0).toArray();
    console.log(`Encontradas ${unsynced.length} recetas locales para subir.`);
    
    // 2. Subir a Firestore
    for (const local of unsynced) {
      const remoteId = local.remoteId || doc(recipesCol).id;
      
      if (local.deleted === 1) {
        if (local.remoteId) {
          console.log(`Eliminando receta remota: ${local.remoteId}`);
          await deleteDoc(doc(firestore, 'recipes', local.remoteId));
        }
        await db.recipes.delete(local.id!);
      } else {
        const remoteData = {
          title: local.title,
          origin: local.origin,
          link: local.link,
          rating: local.rating,
          observations: local.observations,
          updatedAt: serverTimestamp(), // Usar tiempo del servidor de Firebase
        };
        
        console.log(`Subiendo receta: ${local.title} (ID: ${remoteId})`);
        await setDoc(doc(firestore, 'recipes', remoteId), remoteData);
        await db.recipes.update(local.id!, { remoteId, synced: 1 });
      }
    }

    // 3. Descargar cambios remotos
    console.log('Descargando recetas desde Firestore...');
    const snapshot = await getDocs(recipesCol);
    const serverRecipes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
    console.log(`Recibidas ${serverRecipes.length} recetas desde el servidor.`);

    // 4. Actualizar DB local con el estado del servidor
    await db.transaction('rw', db.recipes, async () => {
      for (const server of serverRecipes) {
        const existing = await db.recipes.where('remoteId').equals(server.id).first();
        
        // Convertir Timestamp de Firebase a número para Dexie si es necesario
        const serverUpdatedAt = server.updatedAt?.toMillis?.() || Date.now();

        if (existing) {
          if (serverUpdatedAt > existing.updatedAt) {
            await db.recipes.update(existing.id!, {
              title: server.title,
              origin: server.origin,
              link: server.link,
              rating: server.rating,
              observations: server.observations,
              updatedAt: serverUpdatedAt,
              remoteId: server.id,
              synced: 1,
              deleted: 0
            });
          }
        } else {
          await db.recipes.add({
            title: server.title,
            origin: server.origin,
            link: server.link,
            rating: server.rating,
            observations: server.observations,
            updatedAt: serverUpdatedAt,
            remoteId: server.id,
            synced: 1,
            deleted: 0
          });
        }
      }
    });

    console.log('Sincronización completada con éxito.');
    return true;
  } catch (error) {
    console.error('Error en la sincronización:', error);
    return false;
  }
}
