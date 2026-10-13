import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/ActualizarProducto.css';

const ActualizarProducto = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [editando, setEditando] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    Nombre_producto: '',
    Descripcion: '',
    Categoria: '',
    Precio: '',
    Stock: '',
    imagen: '',
    ID_Proveedor: ''
  });

  useEffect(() => {
    obtenerProductos();
    obtenerProveedores();
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

  const obtenerProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/auth/proveedores', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProveedores(response.data);
      setCargandoProveedores(false);
    } catch (err) {
      console.error('Error al obtener proveedores:', err);
      setCargandoProveedores(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setFormData({
      Nombre_producto: producto.Nombre_producto,
      Descripcion: producto.Descripcion || '',
      Categoria: producto.Categoria,
      Precio: producto.Precio,
      Stock: producto.Stock,
      imagen: producto.imagen || '',
      ID_Proveedor: producto.ID_Proveedor || ''
    });
    setEditando(true);
    setError('');
    setExito('');
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:3001/api/productos/${productoSeleccionado.ID_Producto}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setExito('Producto actualizado correctamente');
      
      // Actualizar la lista de productos
      await obtenerProductos();
      
      // Limpiar selección después de 2 segundos
      setTimeout(() => {
        setEditando(false);
        setProductoSeleccionado(null);
        setFormData({
          Nombre_producto: '',
          Descripcion: '',
          Categoria: '',
          Precio: '',
          Stock: '',
          imagen: '',
          ID_Proveedor: ''
        });
        setExito('');
      }, 2000);
      
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError(err.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const getNombreProveedor = (idProveedor) => {
    if (!idProveedor) return 'Sin proveedor';
    const proveedor = proveedores.find(p => p.ID_Usuario == idProveedor);
    return proveedor ? `${proveedor.Nombre_usuario} ${proveedor.Apellido}` : 'Proveedor no encontrado';
  };

  if (cargando) {
    return (
      <div className="actualizar-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="actualizar-container">
      <div className="actualizar-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>ACTUALIZAR PRODUCTOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="contenido-dos-columnas">
        {/* Lista de productos */}
        <div className="lista-productos">
          <h2>Seleccionar Producto</h2>
          <div className="productos-grid">
            {productos.length === 0 ? (
              <p className="sin-datos">No hay productos registrados</p>
            ) : (
              productos.map((producto) => (
                <div 
                  key={producto.ID_Producto} 
                  className={`producto-card ${productoSeleccionado?.ID_Producto === producto.ID_Producto ? 'seleccionado' : ''}`}
                  onClick={() => seleccionarProducto(producto)}
                >
                  <div className="producto-imagen-mini">
                    {producto.imagen ? (
                      <img 
                        src={`http://localhost:3001/imagenes/${producto.imagen}`} 
                        alt={producto.Nombre_producto}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23999"%3E%3Crect x="2" y="2" width="20" height="20"%3E%3C/rect%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="sin-imagen-mini">📦</div>
                    )}
                  </div>
                  <div className="producto-info-mini">
                    <div className="producto-nombre-mini">{producto.Nombre_producto}</div>
                    <div className="producto-precio-mini">${Number(producto.Precio).toLocaleString()}</div>
                    <div className="producto-stock-mini">Stock: {producto.Stock}</div>
                    <div className="producto-proveedor-mini">
                      {producto.Nombre_Proveedor ? `📦 ${producto.Nombre_Proveedor}` : '🏭 Sin proveedor'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="formulario-edicion">
          <h2>Editar Producto</h2>
          {!editando ? (
            <div className="sin-seleccion">
              <p>Selecciona un producto de la lista para editarlo</p>
            </div>
          ) : (
            <form onSubmit={actualizarProducto}>
              <div className="form-group">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  name="Nombre_producto"
                  value={formData.Nombre_producto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="Descripcion"
                  value={formData.Descripcion}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="Categoria"
                  value={formData.Categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Tostado">Tostado</option>
                  <option value="Fino">Fino</option>
                  <option value="Molido">Molido</option>
                  <option value="Grano">Grano</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    name="Precio"
                    value={formData.Precio}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="Stock"
                    value={formData.Stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Imagen (nombre del archivo)</label>
                <input
                  type="text"
                  name="imagen"
                  value={formData.imagen}
                  onChange={handleChange}
                  placeholder="ejemplo: cafe1.jpeg"
                />
                <small>La imagen debe estar en la carpeta /imagenes del servidor</small>
              </div>

              {/* Campo de Proveedor */}
              <div className="form-group">
                <label>Proveedor</label>
                {cargandoProveedores ? (
                  <div className="loading-proveedores">Cargando proveedores...</div>
                ) : (
                  <select
                    name="ID_Proveedor"
                    value={formData.ID_Proveedor}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar proveedor (opcional)</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.ID_Usuario} value={proveedor.ID_Usuario}>
                        {proveedor.Nombre_usuario} {proveedor.Apellido} - {proveedor.Correo}
                      </option>
                    ))}
                  </select>
                )}
                <small>Selecciona el proveedor que suministra este producto</small>
              </div>

              {/* Mostrar proveedor actual */}
              {formData.ID_Proveedor && (
                <div className="proveedor-actual">
                  <span className="proveedor-actual-label">Proveedor actual:</span>
                  <span className="proveedor-actual-nombre">{getNombreProveedor(formData.ID_Proveedor)}</span>
                </div>
              )}

              <div className="form-buttons">
                <button type="submit" className="btn-actualizar-form">
                  Actualizar Producto
                </button>
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => {
                    setEditando(false);
                    setProductoSeleccionado(null);
                    setError('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActualizarProducto;