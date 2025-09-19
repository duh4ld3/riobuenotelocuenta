// src/services/callables.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase"; // si en firebase.js no exportas app, expórtalo

const fns = getFunctions(app, "southamerica-west1"); // misma región de tus funciones

export async function setRoleCallable(payload: { email: string; role: "admin" | "operador"; cityId: string }) {
  const fn = httpsCallable(fns, "setRole");
  const res = await fn(payload);
  return res.data;
}
