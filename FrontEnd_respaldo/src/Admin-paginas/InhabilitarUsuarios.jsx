import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/InhabilitarUsuarios.css';

const InhabilitarUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'activos', 'inhabilitados'

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/auth/usuarios', {
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

  const inhabilitarUsuario = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas INHABILITAR al usuario "${nombre}"?`)) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.patch(
          `http://localhost:3001/api/auth/usuarios/${id}/inhabilitar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setExito(`Usuario "${nombre}" inhabilitado correctamente`);
        obtenerUsuarios(); // Recargar la lista
        
        setTimeout(() => setExito(''), 3000);
      } catch (err) {
        console.error('Error al inhabilitar usuario:', err);
        setError(err.response?.data?.message || 'Error al inhabilitar el usuario');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const habilitarUsuario = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas HABILITAR al usuario "${nombre}"?`)) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.patch(
          `http://localhost:3001/api/auth/usuarios/${id}/habilitar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setExito(`Usuario "${nombre}" habilitado correctamente`);
        obtenerUsuarios(); // Recargar la lista
        
        setTimeout(() => setExito(''), 3000);
      } catch (err) {
        console.error('Error al habilitar usuario:', err);
        setError(err.response?.data?.message || 'Error al habilitar el usuario');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const usuariosFiltrados = () => {
    if (filtro === 'activos') {
      return usuarios.filter(u => u.Estado === 1);
    } else if (filtro === 'inhabilitados') {
      return usuarios.filter(u => u.Estado === 0);
    }
    return usuarios;
  };

  const getRolBadge = (rol) => {
    switch(rol) {
      case 1:
        return <span className="badge-admin">Administrador</span>;
      case 2:
        return <span className="badge-usuario">Usuario</span>;
      case 3:
        return <span className="badge-proveedor">Proveedor</span>;
      default:
        return <span className="badge-default">{rol}</span>;
    }
  };

  if (cargando) {
    return (
      <div className="inhabilitar-usuarios-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  const usuariosMostrar = usuariosFiltrados();
  const usuariosActivos = usuarios.filter(u => u.Estado === 1).length;
  const usuariosInhabilitados = usuarios.filter(u => u.Estado === 0).length;

  return (
    <div className="inhabilitar-usuarios-container">
      <div className="inhabilitar-usuarios-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>GESTIÓN DE USUARIOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      {/* Estadísticas */}
      <div className="estadisticas-usuarios">
        <div className="estadistica-card activos">
          <div className="estadistica-numero">{usuariosActivos}</div>
          <div className="estadistica-label">Usuarios Activos</div>
        </div>
        <div className="estadistica-card inhabilitados">
          <div className="estadistica-numero">{usuariosInhabilitados}</div>
          <div className="estadistica-label">Usuarios Inhabilitados</div>
        </div>
        <div className="estadistica-card total">
          <div className="estadistica-numero">{usuarios.length}</div>
          <div className="estadistica-label">Total Usuarios</div>
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
          className={`filtro-btn ${filtro === 'activos' ? 'active' : ''}`}
          onClick={() => setFiltro('activos')}
        >
          Activos
        </button>
        <button 
          className={`filtro-btn ${filtro === 'inhabilitados' ? 'active' : ''}`}
          onClick={() => setFiltro('inhabilitados')}
        >
          Inhabilitados
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
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuariosMostrar.length === 0 ? (
              <tr>
                <td colSpan="9" className="sin-datos">No hay usuarios para mostrar</td>
              </tr>
            ) : (
              usuariosMostrar.map((usuario) => (
                <tr key={usuario.ID_Usuario} className={usuario.Estado === 0 ? 'inhabilitado' : ''}>
                  <td>{usuario.ID_Usuario}</td>
                  <td className="usuario-nombre">{usuario.Nombre_usuario}</td>
                  <td>{usuario.Apellido}</td>
                  <td>{usuario.Correo}</td>
                  <td>{usuario.Documento}</td>
                  <td>{usuario.Telefono}</td>
                  <td>{getRolBadge(usuario.ID_Rol)}</td>
                  <td>
                    <span className={`estado-badge ${usuario.Estado === 1 ? 'activo' : 'inhabilitado'}`}>
                      {usuario.Estado === 1 ? 'Activo' : 'Inhabilitado'}
                    </span>
                  </td>
                  <td>
                    {usuario.Estado === 1 ? (
                      <button 
                        className="btn-inhabilitar-accion"
                        onClick={() => inhabilitarUsuario(usuario.ID_Usuario, usuario.Nombre_usuario)}
                      >
                        Inhabilitar
                      </button>
                    ) : (
                      <button 
                        className="btn-habilitar-accion"
                        onClick={() => habilitarUsuario(usuario.ID_Usuario, usuario.Nombre_usuario)}
                      >
                        Habilitar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InhabilitarUsuarios;