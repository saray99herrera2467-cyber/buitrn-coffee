import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/CambiarRolUsuario.css';

const CambiarRolUsuario = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevoRol, setNuevoRol] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

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

  const abrirModalCambioRol = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevoRol(usuario.ID_Rol.toString());
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setUsuarioSeleccionado(null);
    setNuevoRol('');
    setError('');
  };

  const cambiarRol = async () => {
    if (!nuevoRol) {
      setError('Debes seleccionar un rol');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:3001/api/auth/usuarios/${usuarioSeleccionado.ID_Usuario}/cambiar-rol`,
        { nuevoRol: parseInt(nuevoRol) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setExito(`Rol de "${usuarioSeleccionado.Nombre_usuario}" cambiado correctamente`);
      obtenerUsuarios(); // Recargar la lista
      cerrarModal();
      
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error('Error al cambiar rol:', err);
      setError(err.response?.data?.message || 'Error al cambiar el rol');
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const usuariosFiltrados = () => {
    if (filtro === 'admin') {
      return usuarios.filter(u => u.ID_Rol === 1);
    } else if (filtro === 'usuario') {
      return usuarios.filter(u => u.ID_Rol === 2);
    } else if (filtro === 'proveedor') {
      return usuarios.filter(u => u.ID_Rol === 3);
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

  const getRolNombre = (rol) => {
    switch(rol) {
      case 1: return 'Administrador';
      case 2: return 'Usuario';
      case 3: return 'Proveedor';
      default: return 'Desconocido';
    }
  };

  if (cargando) {
    return (
      <div className="cambiar-rol-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  const usuariosMostrar = usuariosFiltrados();

  return (
    <div className="cambiar-rol-container">
      <div className="cambiar-rol-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>CAMBIAR ROL DE USUARIOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      {/* Filtros */}
      <div className="filtros-rol">
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
        <button 
          className={`filtro-btn ${filtro === 'proveedor' ? 'active' : ''}`}
          onClick={() => setFiltro('proveedor')}
        >
          Proveedores
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="tabla-container">
        <table className="tabla-usuarios-rol">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Rol Actual</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuariosMostrar.length === 0 ? (
              <tr>
                <td colSpan="6" className="sin-datos">No hay usuarios para mostrar</td>
              </tr>
            ) : (
              usuariosMostrar.map((usuario) => (
                <tr key={usuario.ID_Usuario}>
                  <td>{usuario.ID_Usuario}</td>
                  <td className="usuario-nombre">{usuario.Nombre_usuario}</td>
                  <td>{usuario.Apellido}</td>
                  <td>{usuario.Correo}</td>
                  <td>{getRolBadge(usuario.ID_Rol)}</td>
                  <td>
                    <button 
                      className="btn-cambiar-rol"
                      onClick={() => abrirModalCambioRol(usuario)}
                    >
                      Cambiar Rol
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para cambiar rol */}
      {mostrarModal && usuarioSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Rol de Usuario</h3>
              <button className="modal-close" onClick={cerrarModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Usuario:</strong> {usuarioSeleccionado.Nombre_usuario} {usuarioSeleccionado.Apellido}</p>
              <p><strong>Rol actual:</strong> {getRolNombre(usuarioSeleccionado.ID_Rol)}</p>
              
              <div className="form-group">
                <label>Nuevo rol:</label>
                <select 
                  value={nuevoRol} 
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="rol-select"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="1">Administrador</option>
                  <option value="2">Usuario</option>
                  <option value="3">Proveedor</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar-modal" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn-guardar-modal" onClick={cambiarRol}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CambiarRolUsuario;