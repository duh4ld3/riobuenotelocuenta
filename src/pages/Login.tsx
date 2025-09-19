import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e:any){
    e.preventDefault(); setErr(null); setLoading(true);
    try{
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/admin");
    } catch(ex:any){
      setErr(ex.message || "Error de autenticación");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-semibold mb-4">Ingreso funcionarios</h1>
        <input className="w-full border p-2 rounded mb-3" placeholder="Correo"
               value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full border p-2 rounded mb-3" placeholder="Contraseña" type="password"
               value={pass} onChange={e=>setPass(e.target.value)} required/>
        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
        <button disabled={loading} className="w-full py-2 rounded bg-black text-white">
          {loading? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
