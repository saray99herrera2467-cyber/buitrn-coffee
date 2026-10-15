import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../estilos/mispqrs.css';

const MisPqrs = () => {
  const [pqrsList, setPqrsList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pqrsSeleccionada, setPqrsSeleccionada] = useState(null);

  useEffect(() => {
    obtenerMisPqrs();
  }, []);

  const obtenerMisPqrs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/pqrs/mis-pqrs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPqrsList(response.data);
      setCargando(false);
    } catch (err) {
      console.error('Error al obtener PQRS:', err);
      setError('Error al cargar tus PQRS');
      setCargando(false);
    }
  };

  const verDetalle = (pqrs) => {
    setPqrsSeleccionada(pqrs);
  };

  const cerrarDetalle = () => {
    setPqrsSeleccionada(null);
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      pendiente: { texto: 'Pendiente', clase: 'estado-pendiente' },
      en_proceso: { texto: 'En proceso', clase: 'estado-proceso' },
      resuelta: { texto: 'Resuelta', clase: 'estado-resuelta' },
      cerrada: { texto: 'Cerrada', clase: 'estado-cerrada' }
    };
    return estados[estado] || { texto: estado, clase: 'estado-default' };
  };

  const getTipoTexto = (tipo) => {
    const tipos = {
      pregunta: 'Pregunta',
      queja: 'Queja',
      reclamo: 'Reclamo',
      sugerencia: 'Sugerencia',
      felicitacion: 'Felicitación'
    };
    return tipos[tipo] || tipo;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="mis-pqrs-container">
        <div className="loading-spinner">Cargando tus solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="mis-pqrs-container">
      <div className="mis-pqrs-header">
        <h2>Mis PQRS</h2>
        <p>Aquí puedes ver el estado de tus solicitudes</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pqrsList.length === 0 ? (
        <div className="sin-pqrs">
          <p>No has realizado ninguna PQRS</p>
          <button 
            className="btn-realizar-pqrs"
            onClick={() => window.location.href = '/realizarpqrs'}
          >
            Realizar una PQRS
          </button>
        </div>
      ) : (
        <div className="pqrs-table-container">
          <table className="pqrs-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pqrsList.map((pqrs) => {
                const estadoInfo = getEstadoInfo(pqrs.Estado);
                return (
                  <tr key={pqrs.ID_PQRS}>
                    <td className="codigo-cell">{pqrs.Codigo_Referencia}</td>
                    <td>{getTipoTexto(pqrs.Tipo)}</td>
                    <td>{formatFecha(pqrs.Fecha_Creacion)}</td>
                    <td>
                      <span className={`estado-badge ${estadoInfo.clase}`}>
                        {estadoInfo.texto}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-ver-detalle"
                        onClick={() => verDetalle(pqrs)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {pqrsSeleccionada && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal-detalle" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de PQRS</h3>
              <button className="modal-close" onClick={cerrarDetalle}>×</button>
            </div>
            <div className="modal-body">
              <div className="detalle-item">
                <strong>Código de referencia:</strong>
                <span>{pqrsSeleccionada.Codigo_Referencia}</span>
              </div>
              <div className="detalle-item">
                <strong>Tipo:</strong>
                <span>{getTipoTexto(pqrsSeleccionada.Tipo)}</span>
              </div>
              <div className="detalle-item">
                <strong>Fecha de creación:</strong>
                <span>{formatFecha(pqrsSeleccionada.Fecha_Creacion)}</span>
              </div>
              <div className="detalle-item">
                <strong>Estado:</strong>
                <span className={`estado-badge ${getEstadoInfo(pqrsSeleccionada.Estado).clase}`}>
                  {getEstadoInfo(pqrsSeleccionada.Estado).texto}
                </span>
              </div>
              <div className="detalle-item">
                <strong>Descripción:</strong>
                <p className="descripcion-texto">{pqrsSeleccionada.Descripcion}</p>
              </div>
              {pqrsSeleccionada.Respuesta && (
                <div className="detalle-item respuesta">
                  <strong>Respuesta del administrador:</strong>
                  <p className="respuesta-texto">{pqrsSeleccionada.Respuesta}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarDetalle}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPqrs;
