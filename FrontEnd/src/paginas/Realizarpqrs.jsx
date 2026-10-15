import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../estilos/realizar.css";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";

function Realizarpqrs() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [codigoReferencia, setCodigoReferencia] = useState("");
  const [usuario, setUsuario] = useState({
    estaAutenticado: false,
    id: null,
    nombre: "",
    email: "",
    telefono: ""
  });

  const [formData, setFormData] = useState({
    tipo: "queja",
    descripcion: ""
  });

  useEffect(() => {
    // Obtener usuario del localStorage
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario({
        estaAutenticado: true,
        id: user.ID_Usuario,
        nombre: `${user.Nombre_usuario} ${user.Apellido || ""}`,
        email: user.Correo,
        telefono: user.Telefono
      });
    }
  }, []);

  const generarCodigoReferencia = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const aleatorio = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `PQRS-${anio}${mes}${dia}-${aleatorio}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensajeError("");
    setMensajeExito("");

    if (!formData.descripcion.trim()) {
      setMensajeError("Por favor escribe una descripción de tu PQRS");
      setEnviando(false);
      return;
    }

    if (formData.descripcion.length < 10) {
      setMensajeError("La descripción debe tener al menos 10 caracteres");
      setEnviando(false);
      return;
    }

    if (!usuario.estaAutenticado) {
      setMensajeError("Debes iniciar sesión para realizar una PQRS");
      setEnviando(false);
      return;
    }

    const nuevoCodigo = generarCodigoReferencia();

    try {
      const response = await axios.post("http://localhost:3001/api/pqrs", {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        codigo_referencia: nuevoCodigo,
        id_usuario: usuario.id
      });

      setCodigoReferencia(nuevoCodigo);
      setMensajeExito("¡Tu PQRS ha sido enviada con éxito!");
      setFormData({
        tipo: "queja",
        descripcion: ""
      });
      
    } catch (error) {
      console.error("Error al enviar PQRS:", error);
      setMensajeError(error.response?.data?.message || "Ocurrió un error al enviar tu PQRS");
    } finally {
      setEnviando(false);
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoReferencia);
    alert("Código copiado al portapapeles");
  };

  return (
    <div className="realizar-pqrs-page">
      <HeaderGlobal />

      <div className="pqrs-hero-small">
        <div className="pqrs-hero-content">
          <h1>Realizar PQRS</h1>
          <p>Cuéntanos tu experiencia</p>
        </div>
      </div>

      <section className="form-section">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Formulario de PQRS</h2>
              {usuario.estaAutenticado ? (
                <div className="user-info-badge">
                  <span>Estás realizando esta PQRS como: <strong>{usuario.nombre}</strong></span>
                </div>
              ) : (
                <div className="alert alert-info">
                  <p>Para realizar una PQRS debes <button type="button" className="link-button" onClick={() => navigate("/login")}>iniciar sesión</button></p>
                </div>
              )}
            </div>

            {mensajeExito && (
              <div className="alert alert-success">
                <div className="alert-content">
                  <p>{mensajeExito}</p>
                  {codigoReferencia && (
                    <div className="codigo-container">
                      <p className="codigo-label">Tu código de referencia es:</p>
                      <div className="codigo-box">
                        <strong className="codigo">{codigoReferencia}</strong>
                        <button className="btn-copiar" onClick={copiarCodigo}>📋</button>
                      </div>
                      <button className="btn-consultar-ahora" onClick={() => navigate("/consultarpqrs")}>
                        Consultar estado ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mensajeError && (
              <div className="alert alert-error">{mensajeError}</div>
            )}

            <form onSubmit={handleSubmit} className="pqrs-formulario">
              <div className="form-group">
                <label>Tipo de PQRS *</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="pregunta">❓ Pregunta</option>
                  <option value="queja">⚠️ Queja</option>
                  <option value="reclamo">📝 Reclamo</option>
                  <option value="sugerencia">💡 Sugerencia</option>
                  <option value="felicitacion">🎉 Felicitación</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  name="descripcion"
                  rows="6"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Cuéntanos detalladamente tu queja, reclamo, sugerencia o felicitación..."
                  disabled={!usuario.estaAutenticado}
                />
              </div>

              <div className="form-buttons">
                <button type="button" onClick={() => navigate("/pqrs")} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={enviando || !usuario.estaAutenticado}>
                  {enviando ? "Enviando..." : "Enviar PQRS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Realizarpqrs;