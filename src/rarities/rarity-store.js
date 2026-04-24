// IDB CRUD for the global rarity tier list. Stored in the `rarities` object
// store (see prize-store.js openDB).
import { openDB } from '../prizes/prize-store.js';

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function getAllRarities() {
  const db = await openDB();
  return req(db.transaction('rarities', 'readonly').objectStore('rarities').getAll());
}

export async function getRarity(id) {
  const db = await openDB();
  return req(db.transaction('rarities', 'readonly').objectStore('rarities').get(id));
}

export async function putRarity(rarity) {
  const db = await openDB();
  return req(db.transaction('rarities', 'readwrite').objectStore('rarities').put(rarity));
}

export async function deleteRarity(id) {
  const db = await openDB();
  return req(db.transaction('rarities', 'readwrite').objectStore('rarities').delete(id));
}

export async function bulkPutRarities(rarities) {
  const db = await openDB();
  const store = db.transaction('rarities', 'readwrite').objectStore('rarities');
  await Promise.all(rarities.map(r => req(store.put(r))));
}
