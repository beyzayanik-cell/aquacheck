import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigDefault from '../firebase-applet-config.json';

// Detect and use custom Firebase environment variables if supplied
const env = (import.meta as any).env || {};

let localConfig: any = null;
try {
  const stored = localStorage.getItem('AQUACHECK_CUSTOM_FIREBASE_CONFIG');
  if (stored) {
    localConfig = JSON.parse(stored);
  }
} catch (e) {
  console.error("Failed to parse custom local config", e);
}

const customConfig = {
  apiKey: localConfig?.apiKey || env.VITE_FIREBASE_API_KEY,
  authDomain: localConfig?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: localConfig?.projectId || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: localConfig?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: localConfig?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: localConfig?.appId || env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: localConfig?.firestoreDatabaseId || env.VITE_FIREBASE_DATABASE_ID
};

const hasCustomConfig = !!(customConfig.apiKey && customConfig.projectId);

const finalUiConfig = hasCustomConfig ? {
  apiKey: customConfig.apiKey,
  authDomain: customConfig.authDomain || `${customConfig.projectId}.firebaseapp.com`,
  projectId: customConfig.projectId,
  storageBucket: customConfig.storageBucket || `${customConfig.projectId}.firebasestorage.app`,
  messagingSenderId: customConfig.messagingSenderId || "",
  appId: customConfig.appId || "",
  firestoreDatabaseId: customConfig.firestoreDatabaseId || "(default)"
} : firebaseConfigDefault;

// Initialize Firebase App
const app = initializeApp(finalUiConfig);

// Initialize Firestore & Auth references
export const db = getFirestore(app, (finalUiConfig as any).firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Test the connection immediately on startup to follow validation guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}
testConnection();

// Structured Firestore Error Handler (Mandatory under Skill guidelines)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
