// IndexedDB: one database "gachapon" with stores:
//   machines (keyPath: id)
//   prizes   (keyPath: id, index on machineId)
//   blobs    (key: string, value: Blob)
//   state    (key-value)
// Thin Promise wrapper — no idb/dexie dependency.

const DB_NAME = 'gachapon';
// v4 — same schema as v3 but the version bump forces onupgradeneeded to
// re-fire on browsers stuck at v3 without the customMachines store
// (some users hit a partial-upgrade state during the v3 rollout that
// ended up with v3 marked-installed but customMachines missing).
const DB_VERSION = 4;
let _dbPromise = null;

export function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      if (!db.objectStoreNames.contains('machines')) db.createObjectStore('machines', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('prizes')) {
        // `by_machine` index remains for the lifetime of v1 prize records so the
        // migration helper can read them; new prizes don't set `machineId`.
        const s = db.createObjectStore('prizes', { keyPath: 'id' });
        s.createIndex('by_machine', 'machineId', { unique: false });
      }
      if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
      if (!db.objectStoreNames.contains('state')) db.createObjectStore('state');
      if (!db.objectStoreNames.contains('rarities')) db.createObjectStore('rarities', { keyPath: 'id' });
      // v3 — WYSIWYG machine designer (feat/machine-designer).
      if (!db.objectStoreNames.contains('customMachines')) db.createObjectStore('customMachines', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function tx(db, storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function req(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

// ── Prize CRUD ─────────────────────────────────────────────────
export async function getAllPrizes() {
  const db = await openDB();
  return req(tx(db, 'prizes').getAll());
}

export async function getPrizesForMachine(machineId) {
  const db = await openDB();
  const idx = tx(db, 'prizes').index('by_machine');
  return req(idx.getAll(machineId));
}

export async function getPrize(id) {
  const db = await openDB();
  return req(tx(db, 'prizes').get(id));
}

export async function putPrize(prize) {
  const db = await openDB();
  return req(tx(db, 'prizes', 'readwrite').put(prize));
}

export async function deletePrize(id) {
  const db = await openDB();
  return req(tx(db, 'prizes', 'readwrite').delete(id));
}

export async function bulkPutPrizes(prizes) {
  const db = await openDB();
  const store = db.transaction('prizes', 'readwrite').objectStore('prizes');
  await Promise.all(prizes.map(p => req(store.put(p))));
}

// ── Blob CRUD ──────────────────────────────────────────────────
export async function putBlob(key, blob) {
  const db = await openDB();
  return req(db.transaction('blobs', 'readwrite').objectStore('blobs').put(blob, key));
}

export async function getBlob(key) {
  const db = await openDB();
  return req(db.transaction('blobs', 'readonly').objectStore('blobs').get(key));
}

export async function deleteBlob(key) {
  const db = await openDB();
  return req(db.transaction('blobs', 'readwrite').objectStore('blobs').delete(key));
}

// ── State key/value ───────────────────────────────────────────
export async function getStateValue(key) {
  const db = await openDB();
  return req(db.transaction('state', 'readonly').objectStore('state').get(key));
}

export async function setStateValue(key, value) {
  const db = await openDB();
  return req(db.transaction('state', 'readwrite').objectStore('state').put(value, key));
}
