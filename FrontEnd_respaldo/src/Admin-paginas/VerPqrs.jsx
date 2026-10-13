import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/VerPqrs.css';

const VerPqrs = () => {
  const navigate = useNavigate();
  const [pqrsList, setPqrsList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [pqrsSeleccionada, setPqrsSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    obtenerPqrs();
  }, []);

  const obtenerPqrs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/pqrs/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPqrsList(response.data);
      setCargando(false);
    } catch (err) {
      console.error('Error al obtener PQRS:', err);
      setError('Error al cargar las PQRS');
      setCargando(false);
    }
  };

  const abrirModal = (pqrs) => {
    setPqrsSeleccionada(pqrs);
    setRespuesta(pqrs.Respuesta || '');
    setNuevoEstado(pqrs.Estado);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPqrsSeleccionada(null);
    setRespuesta('');
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) {
      setError('Por favor escribe una respuesta antes de enviar');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3001/api/pqrs/admin/${pqrsSeleccionada.ID_PQRS}`,
        { estado: 'resuelta', respuesta },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito('Respuesta enviada correctamente');
      obtenerPqrs();
      cerrarModal();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      setError('Error al enviar la respuesta');
      setTimeout(() => setError(''), 3000);
    }
  };

  const actualizarEstado = async (nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3001/api/pqrs/admin/${pqrsSeleccionada.ID_PQRS}`,
        { estado: nuevoEstado, respuesta: respuesta || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito(`Estado actualizado a ${getEstadoTexto(nuevoEstado)}`);
      obtenerPqrs();
      cerrarModal();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado');
      setTimeout(() => setError(''), 3000);
    }
  };

  const volver = () => navigate('/admin');

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      resuelta: 'Resuelta',
      cerrada: 'Cerrada'
    };
    return textos[estado] || estado;
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      pendiente: 'badge-pendiente',
      en_proceso: 'badge-proceso',
      resuelta: 'badge-resuelta',
      cerrada: 'badge-cerrada'
    };
    const textos = {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      resuelta: 'Resuelta',
      cerrada: 'Cerrada'
    };
    return <span className={`estado-badge ${clases[estado]}`}>{textos[estado]}</span>;
  };

  const getTipoIcono = (tipo) => {
    const iconos = {
      pregunta: '❓',
      queja: '⚠️',
      reclamo: '📝',
      sugerencia: '💡',
      felicitacion: '🎉'
    };
    return iconos[tipo] || '📋';
  };

  const pqrsFiltradas = () => {
    if (filtro === 'todas') return pqrsList;
    return pqrsList.filter(p => p.Estado === filtro);
  };

  if (cargando) return <div className="ver-pqrs-container"><div className="loading">Cargando PQRS...</div></div>;

  return (
    <div className="ver-pqrs-container">
      <div className="ver-pqrs-header">
        <button className="btn-volver" onClick={volver}>← Volver al Panel</button>
        <h1>GESTIÓN DE PQRS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="filtros-pqrs">
        <button className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>
          Todas ({pqrsList.length})
        </button>
        <button className={`filtro-btn ${filtro === 'pendiente' ? 'active' : ''}`} onClick={() => setFiltro('pendiente')}>
          Pendientes ({pqrsList.filter(p => p.Estado === 'pendiente').length})
        </button>
        <button className={`filtro-btn ${filtro === 'en_proceso' ? 'active' : ''}`} onClick={() => setFiltro('en_proceso')}>
          En proceso ({pqrsList.filter(p => p.Estado === 'en_proceso').length})
        </button>
        <button className={`filtro-btn ${filtro === 'resuelta' ? 'active' : ''}`} onClick={() => setFiltro('resuelta')}>
          Resueltas ({pqrsList.filter(p => p.Estado === 'resuelta').length})
        </button>
        <button className={`filtro-btn ${filtro === 'cerrada' ? 'active' : ''}`} onClick={() => setFiltro('cerrada')}>
          Cerradas ({pqrsList.filter(p => p.Estado === 'cerrada').length})
        </button>
      </div>

      <div className="pqrs-grid">
        {pqrsFiltradas().length === 0 ? (
          <div className="sin-datos">No hay PQRS para mostrar</div>
        ) : (
          pqrsFiltradas().map((pqrs) => (
            <div key={pqrs.ID_PQRS} className="pqrs-card-admin" onClick={() => abrirModal(pqrs)}>
              <div className="pqrs-card-header">
                <div className="pqrs-tipo">
                  <span className="tipo-icono">{getTipoIcono(pqrs.Tipo)}</span>
                  <span className="tipo-texto">{pqrs.Tipo}</span>
                </div>
                {getEstadoBadge(pqrs.Estado)}
              </div>
              <div className="pqrs-card-body">
                <div className="pqrs-codigo">📋 {pqrs.Codigo_Referencia}</div>
                <div className="pqrs-usuario">
                  👤 {pqrs.Nombre} <br/>
                  📧 {pqrs.Email}
                </div>
                <div className="pqrs-descripcion">{pqrs.Descripcion.substring(0, 100)}...</div>
                <div className="pqrs-fecha">📅 {new Date(pqrs.Fecha_Creacion).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para gestionar PQRS */}
      {mostrarModal && pqrsSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gestionar PQRS</h3>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="info-pqrs">
                <p><strong>Código:</strong> {pqrsSeleccionada.Codigo_Referencia}</p>
                <p><strong>Tipo:</strong> {pqrsSeleccionada.Tipo}</p>
                <p><strong>Usuario:</strong> {pqrsSeleccionada.Nombre}</p>
                <p><strong>Email:</strong> {pqrsSeleccionada.Email}</p>
                <p><strong>Teléfono:</strong> {pqrsSeleccionada.Telefono || 'No especificado'}</p>
                <p><strong>Fecha:</strong> {new Date(pqrsSeleccionada.Fecha_Creacion).toLocaleString()}</p>
                <div className="descripcion-completa">
                  <strong>Descripción:</strong>
                  <p>{pqrsSeleccionada.Descripcion}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Estado actual</label>
                <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  <option value="pendiente">📋 Pendiente</option>
                  <option value="en_proceso">🔄 En proceso</option>
                  <option value="resuelta">✅ Resuelta</option>
                  <option value="cerrada">🔒 Cerrada</option>
                </select>
                <button className="btn-actualizar-estado" onClick={() => actualizarEstado(nuevoEstado)}>
                  Actualizar solo estado
                </button>
              </div>

              <div className="form-group">
                <label>Respuesta para el usuario</label>
                <textarea 
                  rows="5" 
                  value={respuesta} 
                  onChange={(e) => setRespuesta(e.target.value)} 
                  placeholder="Escribe aquí tu respuesta para el usuario..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancelar-modal" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn-enviar-respuesta" onClick={enviarRespuesta}>
                ✉️ Enviar Respuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerPqrs;