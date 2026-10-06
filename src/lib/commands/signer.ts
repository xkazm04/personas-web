/**
 * The controller key: the ONE module that holds this browser's Ed25519 signing
 * key (PHASE2-SPEC.md 3.2, 3.3, 3.5). Nothing else imports the key or opens
 * its IndexedDB store; callers get the controller id, the public key and
 * signatures, never the CryptoKey.
 *
 * The private key is generated NON-EXTRACTABLE, so even script running on this
 * origin can use it while the page is open but can never export it. It lives
 * in IndexedDB (a CryptoKey is structured-cloneable) beside the controller id
 * and the desktop it was paired to. Loaded lazily from the command plane, so
 * none of this is in the dashboard's first load.
 */
import { toBase64Url } from "./envelope";

const DB_NAME = "personas-controller";
const STORE = "keys";
const RECORD = "controller";

interface StoredController {
  controllerId: string;
  deviceId: string;
  publicKey: string;
  keyPair: CryptoKeyPair;
  createdAt: string;
}

/** What callers may know about the stored controller: everything but the key. */
export interface ControllerIdentity {
  controllerId: string;
  deviceId: string;
  publicKey: string;
  createdAt: string;
}

/** Ed25519 over the UTF-8 bytes of `text`, base64url. Exported for the fixture test. */
export async function signWithKey(privateKey: CryptoKey, text: string): Promise<string> {
  const sig = await crypto.subtle.sign({ name: "Ed25519" }, privateKey, new TextEncoder().encode(text));
  return toBase64Url(sig);
}

/** True when this browser can generate and use an Ed25519 key (Safari 17+, Chrome 137+, Firefox 129+). */
export async function signingSupported(): Promise<boolean> {
  if (typeof indexedDB === "undefined" || !globalThis.crypto?.subtle) return false;
  try {
    await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
    return true;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function readStored(): Promise<StoredController | null> {
  const value = await withStore<StoredController | undefined>("readonly", (s) => s.get(RECORD));
  return value ?? null;
}

function identity(s: StoredController): ControllerIdentity {
  return { controllerId: s.controllerId, deviceId: s.deviceId, publicKey: s.publicKey, createdAt: s.createdAt };
}

/** The stored controller, or null when this browser was never paired (or was unpaired). */
export async function loadController(): Promise<ControllerIdentity | null> {
  const stored = await readStored();
  return stored ? identity(stored) : null;
}

/**
 * Generate a fresh key pair for a pairing to `deviceId`, replacing any previous
 * one, and store it. Returns the new identity (with the raw public key, base64url).
 */
export async function createController(controllerId: string, deviceId: string, nowIso: string): Promise<ControllerIdentity> {
  const keyPair = (await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"])) as CryptoKeyPair;
  // The PUBLIC half is always exportable; the private half is not.
  const publicKey = toBase64Url(await crypto.subtle.exportKey("raw", keyPair.publicKey));
  const stored: StoredController = { controllerId, deviceId, publicKey, keyPair, createdAt: nowIso };
  await withStore("readwrite", (s) => s.put(stored, RECORD));
  return identity(stored);
}

/** Sign an envelope with the stored key. Throws when this browser holds no key. */
export async function signEnvelope(envelope: string): Promise<string> {
  const stored = await readStored();
  if (!stored) throw new Error("controller_not_paired");
  return signWithKey(stored.keyPair.privateKey, envelope);
}

/** Forget the key (unpair). The desktop is told separately (revoke_requested_at). */
export async function deleteController(): Promise<void> {
  await withStore("readwrite", (s) => s.delete(RECORD));
}
