import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../estilos/login.css";

function Login() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [Correo, setCorreo] = useState("");
  const [Clave, setClave] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        Correo,
        Clave,
      });

      const { token, usuario } = res.data;

      // Guardar datos en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirigir según el rol
      // ID_Rol = 1: Administrador
      // ID_Rol = 2: Usuario normal
      // ID_Rol = 3: Proveedor

      if (usuario.ID_Rol === 1) {
        // Guardar también como admin para el panel
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminData", JSON.stringify(usuario));
        navigate("/admin");
      } else {
        navigate("/catalogo");
      }
    } catch (err) {
      console.error("Error de login:", err);
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="card">
        <h1>Buitrón Coffee</h1>
        <h2>Iniciar sesión</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={login}>
          <label>Correo</label>
          <input
            type="email"
            placeholder="Correo"
            value={Correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Contraseña"
            value={Clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />

          <button type="submit" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Inicio de Sesión"}
          </button>
        </form>

        <div className="links-login">
          <button
            className="btn-secundario"
            onClick={() => navigate("/registro")}
          >
            Registrarse
          </button>
          <button
            className="btn-link"
            onClick={() => navigate("/olvido-contrasena")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
