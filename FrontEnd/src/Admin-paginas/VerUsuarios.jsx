import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/VerUsuarios.css';

const VerUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'admin', 'usuario'

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsuarios(response.data);
      setCargando(false);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('Error al cargar los usuarios');
      setCargando(false);
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const usuariosFiltrados = () => {
    if (filtro === 'admin') {
      return usuarios.filter(u => u.ID_Rol === 2);
    } else if (filtro === 'usuario') {
      return usuarios.filter(u => u.ID_Rol === 1);
    }
    return usuarios;
  };

  // 1 = Usuario, 2 = Administrador
  const getRolBadge = (rol) => {
    switch(rol) {
      case 2:
        return <span className="badge-admin">Administrador</span>;
      case 1:
        return <span className="badge-usuario">Usuario</span>;
      default:
        return <span className="badge-default">{rol}</span>;
    }
  };

  if (cargando) {
    return (
      <div className="ver-usuarios-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  const usuariosMostrar = usuariosFiltrados();
  const totalAdmin = usuarios.filter(u => u.ID_Rol === 2).length;
  const totalUsuario = usuarios.filter(u => u.ID_Rol === 1).length;

  return (
    <div className="ver-usuarios-container">
      <div className="ver-usuarios-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>LISTA DE USUARIOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Estadísticas */}
      <div className="estadisticas-usuarios">
        <div className="estadistica-card admin">
          <div className="estadistica-numero">{totalAdmin}</div>
          <div className="estadistica-label">Administradores</div>
        </div>
        <div className="estadistica-card usuario">
          <div className="estadistica-numero">{totalUsuario}</div>
          <div className="estadistica-label">Usuarios</div>
        </div>
        <div className="estadistica-card total">
          <div className="estadistica-numero">{usuarios.length}</div>
          <div className="estadistica-label">Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-usuarios">
        <button 
          className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos
        </button>
        <button 
          className={`filtro-btn ${filtro === 'admin' ? 'active' : ''}`}
          onClick={() => setFiltro('admin')}
        >
          Administradores
        </button>
        <button 
          className={`filtro-btn ${filtro === 'usuario' ? 'active' : ''}`}
          onClick={() => setFiltro('usuario')}
        >
          Usuarios
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="tabla-container">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuariosMostrar.length === 0 ? (
              <tr>
                <td colSpan="7" className="sin-datos">No hay usuarios para mostrar</td>
              </tr>
            ) : (
              usuariosMostrar.map((usuario) => (
                <tr key={usuario.ID_Usuario}>
                  <td>{usuario.ID_Usuario}</td>
                  <td className="usuario-nombre">{usuario.Nombre_usuario}</td>
                  <td>{usuario.Apellido}</td>
                  <td>{usuario.Correo}</td>
                  <td>{usuario.Documento}</td>
                  <td>{usuario.Telefono}</td>
                  <td>{getRolBadge(usuario.ID_Rol)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerUsuarios;
import { API_URL } from '../config.js';