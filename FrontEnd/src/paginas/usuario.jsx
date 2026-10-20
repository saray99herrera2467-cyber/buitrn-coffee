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

      // Si no hay sesión, regresar al login
      if (!token) {
        navigate("/login")
        return
      }

      // =====================================================
      // 1. CARGAR LOS DATOS GUARDADOS AL INICIAR SESIÓN
      // =====================================================
      const usuarioGuardado = localStorage.getItem("usuario")

      if (usuarioGuardado) {
        try {
          const datos = JSON.parse(usuarioGuardado)

          setUsuario({
            Nombre_usuario:
              datos.Nombre_usuario ||
              datos.nombre_usuario ||
              "",

            Apellido:
              datos.Apellido ||
              datos.apellido ||
              "",

            Correo:
              datos.Correo ||
              datos.correo ||
              "",

            Documento:
              datos.Documento ||
              datos.documento ||
              "",

            Telefono:
              datos.Telefono ||
              datos.telefono ||
              ""
          })
        } catch (error) {
          console.error(
            "Error leyendo usuario guardado:",
            error
          )
        }
      }

      // =====================================================
      // 2. OBTENER LOS DATOS ACTUALIZADOS DEL BACKEND
      // =====================================================
      try {
        const res = await axios.get(
          `${API_URL}/api/auth/perfil`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        console.log(
          "RESPUESTA DEL PERFIL:",
          res.data
        )

        // El backend puede devolver:
        // { usuario: {...} }
        // o directamente {...}
        const datos = res.data.usuario || res.data

        const datosUsuario = {
          Nombre_usuario:
            datos.Nombre_usuario ||
            datos.nombre_usuario ||
            "",

          Apellido:
            datos.Apellido ||
            datos.apellido ||
            "",

          Correo:
            datos.Correo ||
            datos.correo ||
            "",

          Documento:
            datos.Documento ||
            datos.documento ||
            "",

          Telefono:
            datos.Telefono ||
            datos.telefono ||
            ""
        }

        setUsuario(datosUsuario)

        // Actualizar también localStorage
        const usuarioAnterior =
          JSON.parse(
            localStorage.getItem("usuario") || "{}"
          )

        localStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioAnterior,
            ...datosUsuario
          })
        )

      } catch (error) {
        console.error(
          "ERROR AL CARGAR PERFIL:",
          error
        )

        // Si el token ya no sirve
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("usuario")

          navigate("/login")
        }
      }
    }

    cargarPerfil()
  }, [navigate])

  // =====================================================
  // GUARDAR CAMBIOS
  // =====================================================
  const guardarCambios = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
      return
    }

    try {
      await axios.put(
        `${API_URL}/api/auth/perfil`,
        {
          Nombre_usuario: usuario.Nombre_usuario,
          Apellido: usuario.Apellido,
          Correo: usuario.Correo,
          Documento: usuario.Documento,
          Telefono: usuario.Telefono
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Actualizar los datos guardados localmente
      const usuarioAnterior =
        JSON.parse(
          localStorage.getItem("usuario") || "{}"
        )

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioAnterior,
          ...usuario
        })
      )

      alert(
        "Datos actualizados correctamente"
      )

    } catch (error) {
      console.error(
        "ERROR AL ACTUALIZAR PERFIL:",
        error
      )

      alert(
        error.response?.data?.message ||
        "Error al actualizar los datos"
      )
    }
  }

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================
  const cerrarSesion = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")

    navigate("/index")
  }

  return (
    <div className="usuario-page">

      {/* =================================================
          BARRA SUPERIOR
      ================================================= */}
      <header className="nav">

        <button
          onClick={() => navigate("/catalogo")}
          className="btn-regresar"
        >
          ← Regresar al Inicio
        </button>

        <button
          onClick={cerrarSesion}
          className="btn-cerrar-sesion"
        >
          Cerrar Sesión
        </button>

      </header>

      {/* =================================================
          CONTENIDO
      ================================================= */}
      <div className="perfil-container">

        <h1>Mi Cuenta</h1>

        {/* =================================================
            PESTAÑAS
        ================================================= */}
        <div className="tabs-usuario">

          <button
            className={`tab-btn ${
              seccionActiva === "perfil"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSeccionActiva("perfil")
            }
          >
            Mi Perfil
          </button>

          <button
            className={`tab-btn ${
              seccionActiva === "historial"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSeccionActiva("historial")
            }
          >
            Mis Pedidos
          </button>

          <button
            className={`tab-btn ${
              seccionActiva === "pqrs"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSeccionActiva("pqrs")
            }
          >
            Mis PQRS
          </button>

        </div>

        {/* =================================================
            PERFIL
        ================================================= */}
        {seccionActiva === "perfil" ? (

          <div className="perfil-card">

            {/* FOTO / AVATAR */}
            <div className="foto-section">

              <div className="avatar-placeholder">
                {usuario.Nombre_usuario
                  ? usuario.Nombre_usuario
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <input
                type="file"
                accept="image/*"
                style={{
                  display: "none"
                }}
                id="foto-perfil"
              />

            </div>

            {/* INFORMACIÓN */}
            <div className="info-section">

              {/* NOMBRE */}
              <div className="campo-formulario">

                <label>
                  Nombre de Usuario
                </label>

                <input
                  type="text"
                  value={
                    usuario.Nombre_usuario || ""
                  }
                  onChange={(e) =>
                    setUsuario({
                      ...usuario,
                      Nombre_usuario:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* APELLIDO */}
              <div className="campo-formulario">

                <label>
                  Apellido
                </label>

                <input
                  type="text"
                  value={
                    usuario.Apellido || ""
                  }
                  onChange={(e) =>
                    setUsuario({
                      ...usuario,
                      Apellido:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* DOCUMENTO */}
              <div className="campo-formulario">

                <label>
                  Número de Documento
                </label>

                <input
                  type="text"
                  value={
                    usuario.Documento || ""
                  }
                  onChange={(e) =>
                    setUsuario({
                      ...usuario,
                      Documento:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* TELÉFONO */}
              <div className="campo-formulario">

                <label>
                  Número de Teléfono
                </label>

                <input
                  type="tel"
                  value={
                    usuario.Telefono || ""
                  }
                  onChange={(e) =>
                    setUsuario({
                      ...usuario,
                      Telefono:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* CORREO */}
              <div className="campo-formulario">

                <label>
                  Correo Electrónico
                </label>

                <input
                  type="email"
                  value={
                    usuario.Correo || ""
                  }
                  onChange={(e) =>
                    setUsuario({
                      ...usuario,
                      Correo:
                        e.target.value
                    })
                  }
                />

              </div>

              {/* BOTÓN GUARDAR */}
              <button
                className="btn-guardar"
                onClick={guardarCambios}
              >
                Guardar Cambios
              </button>

            </div>

          </div>

        ) : seccionActiva === "historial" ? (

          <HistorialCompras
            usuario={usuario}
          />

        ) : (

          <MisPqrs />

        )}

      </div>

    </div>
  )
}

export default Usuario
import { API_URL } from '../config.js';