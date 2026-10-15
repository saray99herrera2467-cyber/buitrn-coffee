import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/GestionResenas.css';

const GestionResenas = () => {
  const navigate = useNavigate();
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    obtenerResenas();
  }, []);

  const obtenerResenas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/resenas/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResenas(response.data);
      setCargando(false);
    } catch (err) {
      console.error('Error al obtener reseñas:', err);
      setError('Error al cargar las reseñas');
      setCargando(false);
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3001/api/resenas/admin/${id}`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito(`Reseña ${estado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`);
      obtenerResenas();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error('Error al actualizar reseña:', err);
      setError('Error al actualizar la reseña');
      setTimeout(() => setError(''), 3000);
    }
  };

  const volver = () => navigate('/admin');

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <span key={i} className={i <= calificacion ? 'estrella-llena' : 'estrella-vacia'}>
          ★
        </span>
      );
    }
    return estrellas;
  };

  const resenasFiltradas = () => {
    if (filtro === 'pendiente') return resenas.filter(r => r.estado === 'pendiente');
    if (filtro === 'aprobada') return resenas.filter(r => r.estado === 'aprobada');
    if (filtro === 'rechazada') return resenas.filter(r => r.estado === 'rechazada');
    return resenas;
  };

  if (cargando) {
    return (
      <div className="gestion-resenas-container">
        <div className="loading">Cargando reseñas...</div>
      </div>
    );
  }

  return (
    <div className="gestion-resenas-container">
      <div className="gestion-resenas-header">
        <button className="btn-volver" onClick={volver}>← Volver al Panel</button>
        <h1>GESTIÓN DE RESEÑAS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="filtros-resenas">
        <button className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>
          Todas ({resenas.length})
        </button>
        <button className={`filtro-btn ${filtro === 'pendiente' ? 'active' : ''}`} onClick={() => setFiltro('pendiente')}>
          Pendientes ({resenas.filter(r => r.estado === 'pendiente').length})
        </button>
        <button className={`filtro-btn ${filtro === 'aprobada' ? 'active' : ''}`} onClick={() => setFiltro('aprobada')}>
          Aprobadas ({resenas.filter(r => r.estado === 'aprobada').length})
        </button>
        <button className={`filtro-btn ${filtro === 'rechazada' ? 'active' : ''}`} onClick={() => setFiltro('rechazada')}>
          Rechazadas ({resenas.filter(r => r.estado === 'rechazada').length})
        </button>
      </div>

      <div className="resenas-grid">
        {resenasFiltradas().length === 0 ? (
          <div className="sin-datos">No hay reseñas para mostrar</div>
        ) : (
          resenasFiltradas().map((resena) => (
            <div key={resena.id} className="resena-admin-card">
              <div className="resena-admin-header">
                <div className="resena-producto">{resena.producto_nombre}</div>
                <div className={`estado-badge ${resena.estado}`}>
                  {resena.estado === 'pendiente' ? 'Pendiente' : resena.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                </div>
              </div>
              <div className="resena-admin-body">
                <div className="resena-usuario">👤 {resena.nombre_usuario}</div>
                <div className="resena-calificacion">{renderEstrellas(resena.calificacion)}</div>
                <div className="resena-comentario">{resena.comentario}</div>
                <div className="resena-fecha">📅 {new Date(resena.fecha).toLocaleDateString()}</div>
              </div>
              {resena.estado === 'pendiente' && (
                <div className="resena-admin-actions">
                  <button className="btn-aprobar" onClick={() => actualizarEstado(resena.id, 'aprobada')}>
                    ✅ Aprobar
                  </button>
                  <button className="btn-rechazar" onClick={() => actualizarEstado(resena.id, 'rechazada')}>
                    ❌ Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionResenas;