import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./estilos-admin/VerProductos.css";

const VerProductos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const token = localStorage.getItem("token");

      // Usar la ruta correcta de tu backend
      const response = await axios.get("http://localhost:3001/api/productos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProductos(response.data);
      setCargando(false);
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("Error al cargar los productos");
      setCargando(false);
    }
  };

  const volver = () => {
    navigate("/admin");
  };

  if (cargando) {
    return (
      <div className="ver-productos-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="ver-productos-container">
      <div className="ver-productos-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>LISTA DE PRODUCTOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabla-container">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="8" className="sin-datos">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.ID_Producto}>
                  <td>{producto.ID_Producto}</td>
                  <td>
                    {producto.imagen ? (
                      <img
                        src={`http://localhost:3001/imagenes/${producto.imagen}`}
                        alt={producto.Nombre_producto}
                        className="producto-imagen"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23999"%3E%3Crect x="2" y="2" width="20" height="20"%3E%3C/rect%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <span className="sin-imagen">Sin imagen</span>
                    )}
                  </td>
                  <td>{producto.Nombre_producto}</td>
                  <td>{producto.Descripcion || "-"}</td>
                  <td>{producto.Categoria}</td>
                  <td>${Number(producto.Precio).toLocaleString()}</td>
                  <td className={producto.Stock < 10 ? "stock-bajo" : ""}>
                    {producto.Stock}
                  </td>
                  <td>
                    {producto.Nombre_Proveedor ? (
                      <span className="proveedor-nombre">
                        {producto.Nombre_Proveedor}{" "}
                        {producto.Apellido_Proveedor || ""}
                      </span>
                    ) : (
                      <span className="sin-proveedor">Sin proveedor</span>
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

export default VerProductos;
