// src/services/auth.js
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// ✅ exportaciones con nombre (named exports)
export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const listenAuth = (cb) => onAuthStateChanged(auth, cb);
