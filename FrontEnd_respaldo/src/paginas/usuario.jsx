import "../estilos/usuario.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import HistorialCompras from "../components/HistorialCompras"
import MisPqrs from "./MisPqrs"

function Usuario() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState({
    Nombre_usuario: "",
    Apellido: "",
    Correo: "",
    Documento: "",
    Telefono: ""
  })

  const [seccionActiva, setSeccionActiva] = useState("perfil")

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem("token")
      
      if (!token) {
        navigate("/login")
        return
      }

      try {
        const res = await axios.get(
          "http://localhost:3001/api/auth/perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setUsuario(res.data)
      } catch (error) {
        console.log(error)
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("usuario")
          navigate("/login")
        }
      }
    }

    cargarPerfil()
  }, [navigate])

  const guardarCambios = async () => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      navigate("/login")
      return
    }

    try {
      await axios.put(
        "http://localhost:3001/api/auth/perfil",
        usuario,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      alert("Datos actualizados correctamente")
    } catch (error) {
      alert("Error al actualizar los datos")
      console.error(error)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    navigate("/index")
  }

  return (
    <div className="usuario-page">
      <header className="nav">
        <button onClick={() => navigate("/catalogo")} className="btn-regresar">
          ← Regresar al Inicio
        </button>
        <button onClick={cerrarSesion} className="btn-cerrar-sesion">
          Cerrar Sesión
        </button>
      </header>

      <div className="perfil-container">
        <h1>Mi Cuenta</h1>
        
        <div className="tabs-usuario">
          <button 
            className={`tab-btn ${seccionActiva === "perfil" ? "active" : ""}`}
            onClick={() => setSeccionActiva("perfil")}
          >
            Mi Perfil
          </button>
          <button 
            className={`tab-btn ${seccionActiva === "historial" ? "active" : ""}`}
            onClick={() => setSeccionActiva("historial")}
          >
            Mis Pedidos
          </button>
          <button 
            className={`tab-btn ${seccionActiva === "pqrs" ? "active" : ""}`}
            onClick={() => setSeccionActiva("pqrs")}
          >
            Mis PQRS
          </button>
        </div>

        {seccionActiva === "perfil" ? (
          <div className="perfil-card">
            <div className="foto-section">
              <div className="avatar-placeholder">
                {usuario.Nombre_usuario?.charAt(0).toUpperCase()}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} id="foto-perfil" />
            </div>

            <div className="info-section">
              <div className="campo-formulario">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  value={usuario.Nombre_usuario}
                  onChange={(e) => setUsuario({ ...usuario, Nombre_usuario: e.target.value })}
                />
              </div>

              <div className="campo-formulario">
                <label>Apellido</label>
                <input
                  type="text"
                  value={usuario.Apellido || ""}
                  onChange={(e) => setUsuario({ ...usuario, Apellido: e.target.value })}
                />
              </div>

              <div className="campo-formulario">
                <label>Número de Documento</label>
                <input
                  type="text"
                  value={usuario.Documento || ""}
                  onChange={(e) => setUsuario({ ...usuario, Documento: e.target.value })}
                />
              </div>

              <div className="campo-formulario">
                <label>Número de Teléfono</label>
                <input
                  type="tel"
                  value={usuario.Telefono || ""}
                  onChange={(e) => setUsuario({ ...usuario, Telefono: e.target.value })}
                />
              </div>

              <div className="campo-formulario">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={usuario.Correo}
                  onChange={(e) => setUsuario({ ...usuario, Correo: e.target.value })}
                />
              </div>

              <button
                className="btn-guardar"
                onClick={guardarCambios}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        ) : seccionActiva === "historial" ? (
          <HistorialCompras usuario={usuario} />
        ) : (
          <MisPqrs />
        )}
      </div>
    </div>
  )
}

export default Usuario