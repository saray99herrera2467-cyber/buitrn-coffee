
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './estilos-admin/IndexAdmin.css';

const API_BASE = `${API_URL}/api/admin`;

const IndexAdmin = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [productosTop, setProductosTop] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [generandoAlerta, setGenerandoAlerta] = useState(false);

  const obtenerToken = () =>
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/index');
  };

  const irA = (ruta) => {
    setMenuAbierto(false);
    navigate(ruta);
  };

  useEffect(() => {
    try {
      const usuario = localStorage.getItem('usuario');
      const adminGuardado = localStorage.getItem('adminData');

      setAdmin(
        usuario
          ? JSON.parse(usuario)
          : adminGuardado
            ? JSON.parse(adminGuardado)
            : null
      );
    } catch {
      setAdmin(null);
    }
  }, []);

  // Consultar las estadísticas del backend
  useEffect(() => {
    const cargarEstadisticas = async () => {
      const token = obtenerToken();

      if (!token) {
        setError('No se encontró el token de sesión. Inicia sesión nuevamente.');
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError('');

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [respuestaResumen, respuestaTop] = await Promise.all([
          fetch(`${API_BASE}/resumen-productos`, { headers }),
          fetch(`${API_BASE}/top-productos`, { headers }),
        ]);

        const leerRespuesta = async (respuesta, url) => {
          const texto = await respuesta.text();
          let datos;

          try {
            datos = texto ? JSON.parse(texto) : {};
          } catch {
            const vistaPrevia = texto.slice(0, 180).replace(/\\s+/g, ' ');
            throw new Error(
              `La URL ${url} devolvió HTML o una respuesta no JSON ` +
              `(HTTP ${respuesta.status}). Comprueba la ruta del backend. ` +
              `Respuesta recibida: ${vistaPrevia}`
            );
          }

          return { respuesta, datos };
        };

        const urlResumen = `${API_BASE}/resumen-productos`;
        const urlTop = `${API_BASE}/top-productos`;

        const [{ respuesta: estadoResumen, datos: resumenJson },
               { respuesta: estadoTop, datos: topJson }] = await Promise.all([
          leerRespuesta(respuestaResumen, urlResumen),
          leerRespuesta(respuestaTop, urlTop),
        ]);

        if (!estadoResumen.ok) {
          throw new Error(
            resumenJson.message || 'No fue posible cargar el resumen.'
          );
        }

        if (!estadoTop.ok) {
          throw new Error(
            topJson.message || 'No fue posible cargar los productos más vendidos.'
          );
        }

        setResumen(resumenJson.data);
        setProductosTop(
          Array.isArray(topJson.data) ? topJson.data : []
        );
      } catch (err) {
        setError(
          `${err.message}. Verifica la URL del API y que el servidor esté activo.`
        );
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  // Generar alerta mediante POST /alerta-stock
  const generarAlerta = async () => {
    const token = obtenerToken();

    if (!token) {
      setMensaje('No hay una sesión válida. Inicia sesión nuevamente.');
      return;
    }

    try {
      setGenerandoAlerta(true);
      setMensaje('');

      const respuesta = await fetch(`${API_BASE}/alerta-stock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const textoRespuesta = await respuesta.text();
      let resultado;

      try {
        resultado = textoRespuesta ? JSON.parse(textoRespuesta) : {};
      } catch {
        throw new Error(
          `La URL ${API_BASE}/alerta-stock devolvió una respuesta no JSON ` +
          `(HTTP ${respuesta.status}). Verifica la ruta del backend.`
        );
      }

      if (!respuesta.ok) {
        throw new Error(resultado.message || 'No se pudo generar la alerta.');
      }

      setMensaje(
        resultado.alertas?.length
          ? resultado.alertas.join(' | ')
          : resultado.message || 'Alerta procesada correctamente.'
      );
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setGenerandoAlerta(false);
    }
  };

  const nombreAdmin =
    admin?.Nombre_usuario ||
    admin?.nombre_usuario ||
    admin?.nombre ||
    'Administrador';

  const stockBajo = resumen?.productos_stock_bajo || [];
  const vendidos = productosTop.length
    ? productosTop
    : resumen?.productos_mas_vendidos || [];

  return (
    <div className="admin-container">

      {/* Botón del menú móvil */}
      <button
        className="admin-menu-toggle"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Abrir o cerrar menú"
        aria-expanded={menuAbierto}
      >
        {menuAbierto ? '✕' : '☰'}
      </button>

      {menuAbierto && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* BARRA LATERAL */}
      <aside className={`admin-sidebar ${menuAbierto ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-logo">☕</div>
          <div>
            <h2>Buitrón Coffee</h2>
            <span>Panel administrativo</span>
          </div>
        </div>

        <div className="admin-sidebar-user">
          <div className="user-avatar">
            {nombreAdmin.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-details">
            <strong>{nombreAdmin}</strong>
            <span>Administrador</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="sidebar-section-title">MENÚ PRINCIPAL</p>

          <button
            className="sidebar-link sidebar-home sidebar-link-active"
            onClick={() => irA('/admin')}
          >
            <span className="sidebar-icon">⌂</span>
            Panel principal
          </button>

          <div className="sidebar-group">
            <div className="sidebar-group-title">
              <span className="sidebar-icon">♙</span>
              USUARIOS
            </div>
            <button className="sidebar-link" onClick={() => irA('/usuarios/ver')}>
              • Ver usuarios
            </button>
            <button className="sidebar-link" onClick={() => irA('/usuarios/inhabilitar')}>
              • Inhabilitar usuarios
            </button>
            <button className="sidebar-link" onClick={() => irA('/usuarios/cambiar-rol')}>
              • Cambiar rol
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">
              <span className="sidebar-icon">☕</span>
              PRODUCTOS
            </div>
            <button className="sidebar-link" onClick={() => irA('/productos/crear')}>
              • Crear producto
            </button>
            <button className="sidebar-link" onClick={() => irA('/productos/ver')}>
              • Ver productos
            </button>
            <button className="sidebar-link" onClick={() => irA('/productos/actualizar')}>
              • Actualizar productos
            </button>
            <button className="sidebar-link" onClick={() => irA('/productos/inhabilitar')}>
              • Inhabilitar productos
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">
              <span className="sidebar-icon">▤</span>
              GESTIÓN GENERAL
            </div>
            <button className="sidebar-link" onClick={() => irA('/admin/pedidos')}>
              • Gestionar pedidos
            </button>
            <button className="sidebar-link" onClick={() => irA('/resenas/ver')}>
              • Gestionar reseñas
            </button>
            <button className="sidebar-link" onClick={() => irA('/pqrs/ver')}>
              • Solicitudes PQRS
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="sidebar-logout" onClick={cerrarSesion}>
            ↪ Cerrar sesión
          </button>
          <p>© {new Date().getFullYear()} Buitrón Coffee</p>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">
              BUITRÓN COFFEE / ADMINISTRACIÓN
            </span>
            <h1>Panel de administración</h1>
            <p>Gestiona tu tienda desde un solo lugar.</p>
          </div>

          <button className="logout-btn" onClick={cerrarSesion}>
            Cerrar sesión ↗
          </button>
        </header>

        <section className="admin-welcome">
          <div>
            <span className="welcome-label">PANEL DE CONTROL</span>
            <h2>¡Bienvenido, {nombreAdmin}!</h2>
            <p>Administra tus productos, clientes y pedidos de Buitrón Coffee.</p>
          </div>
          <div className="welcome-coffee-icon">☕</div>
        </section>

        {error && (
          <div className="api-error" role="alert">
            <strong>Error al conectar con el API</strong>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {mensaje && (
          <div className="api-message" role="status">
            {mensaje}
          </div>
        )}

        {/* RESUMEN DE INVENTARIO */}
        <section className="admin-dashboard">
          <div className="dashboard-heading">
            <h2>Gestión de la tienda</h2>
            <p>Selecciona una opción o consulta el estado de tu inventario.</p>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-card">
              <div className="dashboard-card-icon">✚</div>
              <h3>Crear producto</h3>
              <p>Agrega nuevos productos al catálogo.</p>
              <button onClick={() => irA('/productos/crear')}>
                Crear producto →
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-icon">✎</div>
              <h3>Actualizar productos</h3>
              <p>Modifica la información de tu catálogo.</p>
              <button onClick={() => irA('/productos/actualizar')}>
                Actualizar →
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-icon">▣</div>
              <h3>Gestión de pedidos</h3>
              <p>Consulta y administra las compras.</p>
              <button onClick={() => irA('/admin/pedidos')}>
                Ver pedidos →
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-icon">★</div>
              <h3>Gestión de reseñas</h3>
              <p>Consulta las reseñas de los clientes.</p>
              <button onClick={() => irA('/resenas/ver')}>
                Ver reseñas →
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-icon">♟</div>
              <h3>Ver usuarios</h3>
              <p>Administra las cuentas registradas.</p>
              <button onClick={() => irA('/usuarios/ver')}>
                Ver usuarios →
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-icon">?</div>
              <h3>Gestionar PQRS</h3>
              <p>Revisa las solicitudes de los clientes.</p>
              <button onClick={() => irA('/pqrs/ver')}>
                Gestionar PQRS →
              </button>
            </article>
          </div>
        </section>

        {/* ESTADÍSTICAS DEL API */}
        <section className="admin-dashboard api-dashboard">
          <div className="dashboard-heading">
            <h2>Estadísticas de productos</h2>
            <p>Información obtenida de tu API y Supabase.</p>
          </div>

          {cargando ? (
            <div className="api-loading">Cargando estadísticas...</div>
          ) : (
            <>
              <div className="stats-grid">
                <article className="stat-card">
                  <span>Productos más vendidos</span>
                  <strong>
                    {resumen?.total_mas_vendidos ?? vendidos.length}
                  </strong>
                </article>

                <article className="stat-card stat-warning">
                  <span>Productos con stock bajo</span>
                  <strong>
                    {resumen?.total_stock_bajo ?? stockBajo.length}
                  </strong>
                </article>
              </div>

              <div className="api-table-card">
                <h3>Productos más vendidos</h3>
                {vendidos.length === 0 ? (
                  <p className="empty-state">No hay datos de ventas disponibles.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Unidades vendidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendidos.map((producto, index) => (
                          <tr key={producto.id ?? producto.ID_Producto ?? index}>
                            <td>
                              {producto.nombre_producto ??
                                producto.Nombre_producto ??
                                producto.nombre ??
                                'Producto'}
                            </td>
                            <td>
                              {producto.total_vendido ??
                                producto.cantidad_vendida ??
                                producto.total_vendido_unidades ??
                                '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="api-table-card">
                <div className="stock-heading">
                  <div>
                    <h3>Alertas de inventario</h3>
                    <p>Productos con 10 unidades o menos.</p>
                  </div>
                  <button
                    className="stock-alert-button"
                    onClick={generarAlerta}
                    disabled={generandoAlerta}
                  >
                    {generandoAlerta ? 'Generando...' : 'Generar alerta'}
                  </button>
                </div>

                {stockBajo.length === 0 ? (
                  <p className="empty-state">
                    No hay productos con stock bajo o todavía no se han cargado.
                  </p>
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Stock</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockBajo.map((producto, index) => (
                          <tr key={producto.ID_Producto ?? index}>
                            <td>{producto.Nombre_producto}</td>
                            <td>{producto.Stock}</td>
                            <td>
                              <span className="stock-badge">
                                {producto.nivel_stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <footer className="admin-footer-basico">
          <p>
            © {new Date().getFullYear()} Buitrón Coffee -
            Todos los derechos reservados
          </p>
        </footer>
      </main>
    </div>
  );
};

export default IndexAdmin;
import { API_URL } from '../config.js';
