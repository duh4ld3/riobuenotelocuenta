// src/hooks/useEnsureUserProfile.ts
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function useEnsureUserProfile(){
  useEffect(()=>{
    const off = onAuthStateChanged(auth, async (u)=>{
      if (!u) return;
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          displayName: u.displayName || u.email?.split("@")[0] || "Funcionario",
          email: u.email || "",
          role: "municipal",      // por defecto; luego un admin puede subir a "admin"
          enabled: true,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    });
    return () => off();
  }, []);
}
