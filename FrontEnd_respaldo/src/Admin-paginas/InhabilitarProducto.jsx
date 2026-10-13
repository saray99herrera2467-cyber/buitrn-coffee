import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/InhabilitarProducto.css';

const InhabilitarProducto = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'activos', 'inhabilitados'

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/productos');
      setProductos(response.data);
      setCargando(false);
    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError('Error al cargar los productos');
      setCargando(false);
    }
  };

  const inhabilitarProducto = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas INHABILITAR el producto "${nombre}"?`)) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.patch(
          `http://localhost:3001/api/productos/${id}/inhabilitar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setExito(`Producto "${nombre}" inhabilitado correctamente`);
        obtenerProductos(); // Recargar la lista
        
        setTimeout(() => setExito(''), 3000);
      } catch (err) {
        console.error('Error al inhabilitar producto:', err);
        setError('Error al inhabilitar el producto');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const habilitarProducto = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas HABILITAR el producto "${nombre}"?`)) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.patch(
          `http://localhost:3001/api/productos/${id}/habilitar`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setExito(`Producto "${nombre}" habilitado correctamente`);
        obtenerProductos(); // Recargar la lista
        
        setTimeout(() => setExito(''), 3000);
      } catch (err) {
        console.error('Error al habilitar producto:', err);
        setError('Error al habilitar el producto');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const productosFiltrados = () => {
    if (filtro === 'activos') {
      return productos.filter(p => p.Estado === 1);
    } else if (filtro === 'inhabilitados') {
      return productos.filter(p => p.Estado === 0);
    }
    return productos;
  };

  if (cargando) {
    return (
      <div className="inhabilitar-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  const productosMostrar = productosFiltrados();
  const productosActivos = productos.filter(p => p.Estado === 1).length;
  const productosInhabilitados = productos.filter(p => p.Estado === 0).length;

  return (
    <div className="inhabilitar-container">
      <div className="inhabilitar-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>GESTIÓN DE PRODUCTOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="filtros">
        <div className="estadisticas">
          <div className="estadistica activos">
            <span className="numero">{productosActivos}</span>
            <span className="label">Productos Activos</span>
          </div>
          <div className="estadistica inhabilitados">
            <span className="numero">{productosInhabilitados}</span>
            <span className="label">Productos Inhabilitados</span>
          </div>
          <div className="estadistica total">
            <span className="numero">{productos.length}</span>
            <span className="label">Total Productos</span>
          </div>
        </div>

        <div className="filtro-buttons">
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
      </div>

      <div className="tabla-container">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productosMostrar.length === 0 ? (
              <tr>
                <td colSpan="8" className="sin-datos">No hay productos para mostrar</td>
              </tr>
            ) : (
              productosMostrar.map((producto) => (
                <tr key={producto.ID_Producto} className={producto.Estado === 0 ? 'inhabilitado' : ''}>
                  <td>{producto.ID_Producto}</td>
                  <td>
                    {producto.imagen ? (
                      <img 
                        src={`http://localhost:3001/imagenes/${producto.imagen}`} 
                        alt={producto.Nombre_producto}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23999"%3E%3Crect x="2" y="2" width="20" height="20"%3E%3C/rect%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <span className="sin-imagen">📦</span>
                    )}
                  </td>
                  <td className="producto-nombre">{producto.Nombre_producto}</td>
                  <td>{producto.Categoria}</td>
                  <td>${Number(producto.Precio).toLocaleString()}</td>
                  <td className={producto.Stock < 10 ? 'stock-bajo' : ''}>
                    {producto.Stock}
                  </td>
                  <td>
                    <span className={`estado-badge ${producto.Estado === 1 ? 'activo' : 'inhabilitado'}`}>
                      {producto.Estado === 1 ? 'Activo' : 'Inhabilitado'}
                    </span>
                  </td>
                  <td>
                    {producto.Estado === 1 ? (
                      <button 
                        className="btn-inhabilitar-accion"
                        onClick={() => inhabilitarProducto(producto.ID_Producto, producto.Nombre_producto)}
                      >
                        Inhabilitar
                      </button>
                    ) : (
                      <button 
                        className="btn-habilitar-accion"
                        onClick={() => habilitarProducto(producto.ID_Producto, producto.Nombre_producto)}
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

export default InhabilitarProducto;