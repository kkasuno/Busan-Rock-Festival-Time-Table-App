import { getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, signInAnonymously } from "firebase/auth";
import { collection, doc, getDocsFromServer, getFirestore, runTransaction } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCyyXak7eETUqGV0kspYb8hnXzE0sHzqaA",
  authDomain: "koreanlottery25.firebaseapp.com",
  projectId: "koreanlottery25",
  storageBucket: "koreanlottery25.firebasestorage.app",
  messagingSenderId: "752409217198",
  appId: "1:752409217198:web:50574514c4b212559a453f",
  measurementId: "G-GH99HTQQD0",
};
const app = getApps().find(app => app.name === "busan-rock") ?? initializeApp(firebaseConfig, "busan-rock");
const db = getFirestore(app);
export const COUNTERS = "busanRock2026PickCounts";
let login: Promise<void> | undefined;
async function authenticate() {
  if (!login) login = (async () => {
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    await auth.authStateReady();
    if (!auth.currentUser) await signInAnonymously(auth);
  })().catch(error => { login = undefined; throw error; });
  return login;
}

export async function readCounts(): Promise<Record<string, number>> {
  const snapshot = await getDocsFromServer(collection(db, COUNTERS));
  return Object.fromEntries(snapshot.docs.map(doc => [doc.id, Math.max(0, Number(doc.data().count) || 0)]));
}

// A receipt has no user identifier or timetable. Its random ID makes retries idempotent.
export async function submitPick(id: string, delta: number, operationId: string): Promise<number> {
  await authenticate();
  const counter = doc(db, COUNTERS, id);
  const receipt = doc(db, COUNTERS, id, "operations", operationId);
  return runTransaction(db, async transaction => {
    const prior = await transaction.get(receipt);
    const total = await transaction.get(counter);
    const previous = total.exists() ? Number(total.data().count) : 0;
    if (prior.exists()) return previous;
    const count = Math.max(0, previous + delta);
    transaction.set(receipt, { delta });
    transaction.set(counter, { count, lastOperationId: operationId });
    return count;
  });
}
