import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './estilos-admin/IndexAdmin.css';

const IndexAdmin = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const adminDataGuardado = localStorage.getItem('adminData');
    
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setAdminData(usuario);
    } else if (adminDataGuardado) {
      const admin = JSON.parse(adminDataGuardado);
      setAdminData(admin);
    }
  }, []);

  const irA = (ruta) => {
    navigate(ruta);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/index');
  };

  // Obtener iniciales para el avatar
  const getInitials = () => {
    const nombre = adminData ? adminData.Nombre_usuario : "Administrador";
    return nombre.charAt(0).toUpperCase();
  };

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-header">
          <div className="user-avatar">
            {getInitials()}
          </div>
          <div className="user-details">
            <span className="user-name">
              {adminData ? adminData.Nombre_usuario : "Administrador"}
            </span>
            <span className="user-role">Administrador</span>
          </div>
          <h1>BIENVENIDO AL PANEL DE ADMINISTRACIÓN</h1>
          <div className="user-info">            
            <button className="logout-btn" onClick={cerrarSesion}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Layout de dos columnas (USUARIOS y PRODUCTOS) */}
        <div className="two-columns">
          {/* Columna USUARIOS */}
          <div className="column">
            <div className="column-header">
              <h2>USUARIOS</h2>
            </div>
            <div className="column-buttons">
              <button className="menu-btn btn-ver" onClick={() => irA('/usuarios/ver')}>
                VER
              </button>
              <button className="menu-btn btn-inhabilitar" onClick={() => irA('/usuarios/inhabilitar')}>
                INHABILITAR
              </button>
              <button className="menu-btn btn-cambiar-rol" onClick={() => irA('/usuarios/cambiar-rol')}>
                CAMBIAR ROL
              </button>
            </div>
          </div>

          {/* Columna PRODUCTOS */}
          <div className="column">
            <div className="column-header">
              <h2>PRODUCTOS</h2>
            </div>
            <div className="column-buttons">
              <button className="menu-btn btn-crear" onClick={() => irA('/productos/crear')}>
                CREAR
              </button>
              <button className="menu-btn btn-ver" onClick={() => irA('/productos/ver')}>
                VER
              </button>
              <button className="menu-btn btn-actualizar" onClick={() => irA('/productos/actualizar')}>
                ACTUALIZAR
              </button>
              <button className="menu-btn btn-inhabilitar" onClick={() => irA('/productos/inhabilitar')}>
                INHABILITAR
              </button>
            </div>
          </div>
        </div>

        {/* Fila de PQRS - Centrada abajo */}
        <div className="pqrs-row">
          <div className="column pqrs-column">
            <div className="column-header">
              <h2>GESTIÓN GENERAL</h2>
            </div>
            <div className="column-buttons">
              <button className="menu-btn btn-pqrs" onClick={() => irA('/pqrs/ver')}>
                VER SOLICITUDES PQRS
              </button>
              <button className="menu-btn btn-resenas" onClick={() => irA('/resenas/ver')}>
              GESTIONAR RESEÑAS
              </button>
              <button className="menu-btn btn-pedidos" onClick={() => irA('/admin/pedidos')}>
              GESTIONAR PEDIDOS
              </button>
            </div>
            
          </div>
        </div>
      </div>
      <footer className="admin-footer-basico">
        <p>© {new Date().getFullYear()} Buitrón Coffee - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default IndexAdmin;