import { useState } from "react";
import axios from "axios";
import "../estilos/consulta.css";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";

function Consultarpqrs() {
  const [referencia, setReferencia] = useState("");
  const [consultado, setConsultado] = useState(false);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    
    if (!referencia.trim()) {
      setError("Por favor ingresa un número de referencia");
      setCargando(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/api/pqrs/consultar/${referencia}`);
      setEstado(response.data);
      setConsultado(true);
    } catch (err) {
      console.error("Error al consultar:", err);
      setError(err.response?.data?.message || "No se encontró ninguna PQRS con ese código");
      setConsultado(false);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      pendiente: { texto: "Pendiente", color: "info", icono: "⏳" },
      en_proceso: { texto: "En proceso", color: "warning", icono: "🔄" },
      resuelta: { texto: "Resuelta", color: "success", icono: "✅" },
      cerrada: { texto: "Cerrada", color: "default", icono: "📋" }
    };
    return estados[estado] || { texto: estado, color: "default", icono: "📋" };
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  return (
    <div className="consultar-pqrs-page">
      <HeaderGlobal />

      <div className="pqrs-hero-small">
        <div className="pqrs-hero-content">
          <h1>Consultar PQRS</h1>
          <p>Conoce el estado de tu solicitud</p>
        </div>
      </div>

      <section className="consulta-section">
        <div className="container">
          <div className="consulta-wrapper">
            <div className="consulta-form">
              <h2>Consulta tu PQRS</h2>
              <p>Ingresa el número de referencia que recibiste al realizar tu PQRS</p>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Número de referencia</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: PQRS-20260320-123456"
                  />
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <button type="submit" className="btn-consultar" disabled={cargando}>
                  {cargando ? "Consultando..." : "Consultar"}
                </button>
              </form>
            </div>

            {consultado && estado && (
              <div className="consulta-resultado">
                <h3>Estado de tu PQRS</h3>
                <div className={`estado-card estado-${getEstadoInfo(estado.Estado).color}`}>
                  <div className="estado-header">
                    <div className="estado-icon">{getEstadoInfo(estado.Estado).icono}</div>
                    <div className="estado-info">
                      <span className="estado-label">Estado actual:</span>
                      <span className={`estado-valor ${getEstadoInfo(estado.Estado).color}`}>
                        {getEstadoInfo(estado.Estado).texto}
                      </span>
                    </div>
                  </div>
                  
                  <div className="estado-detalle">
                    <div className="detalle-item">
                      <strong>Tipo:</strong> {estado.Tipo}
                    </div>
                    <div className="detalle-item">
                      <strong>Fecha de registro:</strong> {formatFecha(estado.Fecha_Creacion)}
                    </div>
                    <div className="detalle-item">
                      <strong>Descripción:</strong> {estado.Descripcion}
                    </div>
                    {estado.Respuesta && (
                      <div className="detalle-item">
                        <strong>Respuesta:</strong> {estado.Respuesta}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Consultarpqrs;