// CRUD for the v3 `customMachines` IndexedDB store. Records produced by the
// WYSIWYG designer (feat/machine-designer). Schema lives in ./schema.js.
import { openDB } from '../prizes/prize-store.js';

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function tx(db, mode = 'readonly') {
  return db.transaction('customMachines', mode).objectStore('customMachines');
}

export async function getAllCustomMachines() {
  const db = await openDB();
  return req(tx(db).getAll());
}

export async function getCustomMachine(id) {
  const db = await openDB();
  return req(tx(db).get(id));
}

export async function putCustomMachine(machine) {
  const db = await openDB();
  return req(tx(db, 'readwrite').put(machine));
}

export async function deleteCustomMachine(id) {
  const db = await openDB();
  return req(tx(db, 'readwrite').delete(id));
}
