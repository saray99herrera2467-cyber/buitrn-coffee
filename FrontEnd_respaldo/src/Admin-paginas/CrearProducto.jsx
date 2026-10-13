import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './estilos-admin/CrearProducto.css';

const CrearProducto = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);
  
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
    obtenerProveedores();
  }, []);

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
      setError('Error al cargar la lista de proveedores');
      setCargandoProveedores(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');

    if (!formData.Nombre_producto.trim()) {
      setError('El nombre del producto es obligatorio');
      setCargando(false);
      return;
    }

    if (!formData.Categoria) {
      setError('La categoría es obligatoria');
      setCargando(false);
      return;
    }

    if (!formData.Precio || formData.Precio <= 0) {
      setError('El precio debe ser mayor a 0');
      setCargando(false);
      return;
    }

    if (formData.Stock < 0) {
      setError('El stock no puede ser negativo');
      setCargando(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3001/api/productos',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setExito('Producto creado correctamente');
      
      setTimeout(() => {
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
      console.error('Error al crear producto:', err);
      setError(err.response?.data?.message || 'Error al crear el producto');
    } finally {
      setCargando(false);
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const limpiarFormulario = () => {
    setFormData({
      Nombre_producto: '',
      Descripcion: '',
      Categoria: '',
      Precio: '',
      Stock: '',
      imagen: '',
      ID_Proveedor: ''
    });
    setError('');
    setExito('');
  };

  return (
    <div className="crear-producto-container">
      <div className="crear-producto-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>CREAR NUEVO PRODUCTO</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="formulario-container">
        <form onSubmit={crearProducto}>
          <div className="form-group">
            <label>Nombre del producto *</label>
            <input
              type="text"
              name="Nombre_producto"
              value={formData.Nombre_producto}
              onChange={handleChange}
              placeholder="Ej: Café Tostado Premium"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Describe las características del producto..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
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
                <option value="Especial">Especial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                name="Stock"
                value={formData.Stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio ($) *</label>
              <input
                type="number"
                name="Precio"
                value={formData.Precio}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Imagen (nombre del archivo)</label>
              <input
                type="text"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                placeholder="Ej: cafe-premium.jpg"
              />
              <small>La imagen debe estar en la carpeta /imagenes del servidor</small>
            </div>
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

          <div className="form-buttons">
            <button 
              type="submit" 
              className="btn-crear-form"
              disabled={cargando}
            >
              {cargando ? 'Creando...' : 'Crear Producto'}
            </button>
            <button 
              type="button" 
              className="btn-limpiar"
              onClick={limpiarFormulario}
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* Vista previa */}
        {formData.Nombre_producto && (
          <div className="vista-previa">
            <h3>Vista previa</h3>
            <div className="previa-card">
              <div className="previa-imagen">
                {formData.imagen ? (
                  <img 
                    src={`http://localhost:3001/imagenes/${formData.imagen}`} 
                    alt={formData.Nombre_producto}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999"%3E%3Crect x="2" y="2" width="20" height="20"%3E%3C/rect%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="previa-sin-imagen">📦 Sin imagen</div>
                )}
              </div>
              <div className="previa-info">
                <div className="previa-nombre">{formData.Nombre_producto || 'Nombre del producto'}</div>
                <div className="previa-categoria">{formData.Categoria || 'Categoría'}</div>
                <div className="previa-precio">${Number(formData.Precio).toLocaleString() || '0'}</div>
                <div className="previa-stock">Stock: {formData.Stock || '0'} unidades</div>
                {formData.ID_Proveedor && (
                  <div className="previa-proveedor">
                    Proveedor: {proveedores.find(p => p.ID_Usuario == formData.ID_Proveedor)?.Nombre_usuario || 'Seleccionado'}
                  </div>
                )}
                {formData.Descripcion && (
                  <div className="previa-descripcion">{formData.Descripcion.substring(0, 100)}...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearProducto;