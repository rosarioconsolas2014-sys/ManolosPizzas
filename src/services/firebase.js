import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGRMTIkK6PHxKDbUgQdHKNw9nCIdflhM",
  authDomain: "casadecomidaschalleger.firebaseapp.com",
  projectId: "casadecomidaschalleger",
  storageBucket: "casadecomidaschalleger.firebasestorage.app",
  messagingSenderId: "1045825505746",
  appId: "1:1045825505746:web:627d0cbd63b601f352a00b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path = null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test with graceful diagnostic
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Aviso de conexión Firebase: cliente offline o sin red.");
    } else {
      console.warn("Aviso inicial de Firestore:", error?.message);
    }
    return false;
  }
}
testConnection();

export default app;
