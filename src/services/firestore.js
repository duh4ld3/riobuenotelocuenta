// src/services/firestore.js
import { db } from "../firebase";
import {
  addDoc, collection, doc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";

// ----- PROYECTOS -----
export const crearProyecto = (data) =>
  addDoc(collection(db, "proyectos"), { montoEjecutado: 0, ...data });

export const actualizarProyecto = (id, patch) =>
  updateDoc(doc(db, "proyectos", id), patch);

export const borrarProyecto = (id) =>
  deleteDoc(doc(db, "proyectos", id));

export const obtenerProyecto = (id) =>
  getDoc(doc(db, "proyectos", id));

export const listarProyectos = async () => {
  const snap = await getDocs(query(collection(db, "proyectos"), orderBy("titulo")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ----- MESES -----
export const agregarMes = (data) =>
  addDoc(collection(db, "meses"), {
    fechaCreacion: serverTimestamp(),
    ...data // { idProyecto, mes, avance, ejecutadoMes, resumen }
  });

// ----- FOTOS -----
export const agregarFoto = (data) =>
  addDoc(collection(db, "fotos"), data); // { idProyecto, mes, url, alt }

// ----- EVENTOS -----
export const agregarEvento = (data) =>
  addDoc(collection(db, "eventos"), {
    fecha: serverTimestamp(),
    ...data // { idProyecto, texto, tipo }
  });

// ----- BITÁCORA -----
export const logBitacora = (data) =>
  addDoc(collection(db, "bitacora"), {
    fecha: serverTimestamp(),
    ...data // { idProyecto, accion, usuarioUid, usuarioNombre, desde, hasta }
  });
