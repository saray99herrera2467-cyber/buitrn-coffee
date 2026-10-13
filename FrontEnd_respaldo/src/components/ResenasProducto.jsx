import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../estilos/resenas.css';

const ResenasProducto = ({ productoId, onCalificacionActualizada }) => {
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState({ promedio: 0, total: 0 });
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({ calificacion: 5, comentario: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) setUsuario(JSON.parse(user));
    cargarResenas();
    cargarPromedio();
  }, [productoId]);

  const cargarResenas = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/resenas/producto/${productoId}`);
      setResenas(response.data);
      setCargando(false);
    } catch (err) {
      console.error(err);
      setCargando(false);
    }
  };

  const cargarPromedio = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/resenas/producto/${productoId}/promedio`);
      setPromedio(response.data);
      if (onCalificacionActualizada) {
        onCalificacionActualizada(response.data.promedio, response.data.total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario) {
      setMensaje('Debes iniciar sesión para dejar una reseña');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    if (!formData.comentario.trim()) {
      setMensaje('Por favor escribe un comentario');
      return;
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/resenas',
        { producto_id: productoId, calificacion: parseInt(formData.calificacion), comentario: formData.comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Reseña enviada correctamente. Espera aprobación.');
      setFormData({ calificacion: 5, comentario: '' });
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setMensaje(err.response?.data?.message || 'Error al enviar la reseña');
    } finally {
      setEnviando(false);
    }
  };

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <span key={i} className={i <= Math.round(calificacion) ? 'estrella-llena' : 'estrella-vacia'}>
          ★
        </span>
      );
    }
    return estrellas;
  };

  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-ES');

  if (cargando) return <div className="resenas-container">Cargando reseñas...</div>;

  return (
    <div className="resenas-container">
      <div className="resenas-header">
        <h3>Opiniones de clientes</h3>
        <div className="promedio-container">
          <div className="estrellas-promedio">{renderEstrellas(promedio.promedio)}</div>
          <span className="promedio-numero">{promedio.promedio.toFixed(1)}</span>
          <span className="total-resenas">({promedio.total} reseñas)</span>
        </div>
      </div>

      <div className="agregar-resena">
        <h4>Deja tu opinión</h4>
        {mensaje && <div className="mensaje-resena">{mensaje}</div>}
        <form onSubmit={handleSubmit}>
          <div className="calificacion-input">
            <label>Calificación:</label>
            <select name="calificacion" value={formData.calificacion} onChange={(e) => setFormData({...formData, calificacion: e.target.value})}>
              <option value="5">5 estrellas - Excelente</option>
              <option value="4">4 estrellas - Muy bueno</option>
              <option value="3">3 estrellas - Bueno</option>
              <option value="2">2 estrellas - Regular</option>
              <option value="1">1 estrella - Malo</option>
            </select>
          </div>
          <div className="comentario-input">
            <label>Comentario:</label>
            <textarea name="comentario" value={formData.comentario} onChange={(e) => setFormData({...formData, comentario: e.target.value})} rows="4" placeholder="Cuéntanos tu experiencia..." required />
          </div>
          <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Envia tu reseña'}</button>
        </form>
      </div>

      <div className="lista-resenas">
        {resenas.length === 0 ? (
          <p className="sin-resenas">Sé el primero en dejar una reseña</p>
        ) : (
          resenas.map((resena) => (
            <div key={resena.id} className="resena-card">
              <div className="resena-header">
                <strong>{resena.nombre_usuario}</strong>
                <div className="resena-estrellas">{renderEstrellas(resena.calificacion)}</div>
                <span className="resena-fecha">{formatFecha(resena.fecha)}</span>
              </div>
              <p className="resena-comentario">{resena.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResenasProducto;