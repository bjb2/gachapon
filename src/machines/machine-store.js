// Machine CRUD on the shared gachapon IndexedDB.
import { openDB } from '../prizes/prize-store.js';

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function getAllMachines() {
  const db = await openDB();
  return req(db.transaction('machines', 'readonly').objectStore('machines').getAll());
}

export async function getMachine(id) {
  const db = await openDB();
  return req(db.transaction('machines', 'readonly').objectStore('machines').get(id));
}

export async function putMachine(machine) {
  const db = await openDB();
  return req(db.transaction('machines', 'readwrite').objectStore('machines').put(machine));
}

export async function deleteMachine(id) {
  const db = await openDB();
  return req(db.transaction('machines', 'readwrite').objectStore('machines').delete(id));
}

export async function bulkPutMachines(machines) {
  const db = await openDB();
  const store = db.transaction('machines', 'readwrite').objectStore('machines');
  await Promise.all(machines.map(m => req(store.put(m))));
}
