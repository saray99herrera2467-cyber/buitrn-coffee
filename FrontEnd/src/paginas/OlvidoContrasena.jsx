import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../estilos/olvido.css";

function OlvidoContrasena() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const solicitarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await axios.post("http://localhost:3001/api/auth/olvido-contrasena", { Correo: email });
      setMensaje({ texto: "Código enviado a tu correo", tipo: "exito" });
      setPaso(2);
    } catch (error) {
      setMensaje({ texto: error.response?.data?.message || "Error", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await axios.post("http://localhost:3001/api/auth/verificar-codigo", { Correo: email, codigo });
      setMensaje({ texto: "Código verificado", tipo: "exito" });
      setPaso(3);
    } catch (error) {
      setMensaje({ texto: error.response?.data?.message || "Código incorrecto", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    if (nuevaClave !== confirmarClave) {
      setMensaje({ texto: "Las contraseñas no coinciden", tipo: "error" });
      return;
    }
    if (nuevaClave.length < 6) {
      setMensaje({ texto: "Mínimo 6 caracteres", tipo: "error" });
      return;
    }

    setCargando(true);
    try {
      await axios.post("http://localhost:3001/api/auth/restablecer-contrasena", {
        Correo: email,
        codigo,
        nuevaClave
      });
      setMensaje({ texto: "Contraseña actualizada. Redirigiendo...", tipo: "exito" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMensaje({ texto: error.response?.data?.message || "Error", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="olvido-page">
      <div className="olvido-container">
        <div className="olvido-card">
          <h1>¿Olvidaste tu contraseña?</h1>
          
          {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
          
          {paso === 1 && (
            <form onSubmit={solicitarCodigo}>
              <p>Ingresa tu correo electrónico</p>
              <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" disabled={cargando}>{cargando ? "Enviando..." : "Enviar código"}</button>
            </form>
          )}
          
          {paso === 2 && (
            <form onSubmit={verificarCodigo}>
              <p>Ingresa el código de 6 dígitos</p>
              <input type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={6} required />
              <button type="submit" disabled={cargando}>{cargando ? "Verificando..." : "Verificar código"}</button>
            </form>
          )}
          
          {paso === 3 && (
            <form onSubmit={restablecer}>
              <p>Ingresa tu nueva contraseña</p>
              <input type="password" placeholder="Nueva contraseña" value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} required />
              <input type="password" placeholder="Confirmar contraseña" value={confirmarClave} onChange={(e) => setConfirmarClave(e.target.value)} required />
              <button type="submit" disabled={cargando}>{cargando ? "Guardando..." : "Restablecer"}</button>
            </form>
          )}
          
          <div className="olvido-links">
            <button onClick={() => navigate("/login")}>← Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OlvidoContrasena;