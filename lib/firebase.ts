// src/lib/firebase.ts

'use client';

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { MindMapProject } from '@/types/types';
import { MindNode, LayoutOrientation } from '@/types/types';

// TODO: Move Firebase config to environment variables for production security
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBd5i2bnstZYU3pOktmTsOjcd1yzQf8IDY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jira-90e3c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jira-90e3c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jira-90e3c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1065794187179",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1065794187179:web:4748ba5b53da758e5a6cee",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BE1YYCERRL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const subscribeToProjects = (
  callback: (projects: MindMapProject[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const projects: MindMapProject[] = [];
    snapshot.forEach((docSnap) => {
      projects.push({ id: docSnap.id, ...docSnap.data() } as MindMapProject);
    });
    callback(projects);
  });
};

export const saveProject = async (
  projectId: string,
  name: string,
  nodes: MindNode[],
  orientation: LayoutOrientation
) => {
  if (!projectId) return;
  const projectRef = doc(db, 'projects', projectId);
  await setDoc(
    projectRef,
    {
      name,
      nodes,
      orientation,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(db, 'projects', projectId));
};