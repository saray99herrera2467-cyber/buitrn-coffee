import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";
import ResenasProducto from "../components/ResenasProducto";
import { useCarrito } from "../context/CarritoContext";
import "../estilos/productoDetalle.css";

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    fetch(`http://localhost:3001/api/productos/${id}`)
      .then((res) => res.json())
      .then((data) => setProducto(data))
      .catch((err) => console.log(err));
  }, [id]);

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    const num = Number(calificacion) || 0;
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <span
          key={i}
          className={i <= Math.round(num) ? "estrella-llena" : "estrella-vacia"}
        >
          ★
        </span>,
      );
    }
    return estrellas;
  };

  if (!producto) {
    return (
      <div className="producto-detalle">
        <HeaderGlobal />
        <div className="loading">Cargando producto...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="producto-detalle">
      <HeaderGlobal />

      <div className="detalle-container">
        <div className="detalle-imagen">
          <img
            src={`http://localhost:3001/imagenes/${producto.imagen}`}
            alt={producto.Nombre_producto}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x400?text=Sin+imagen";
            }}
          />
        </div>

        <div className="detalle-info">
          <h1>{producto.Nombre_producto}</h1>

          <div className="producto-calificacion">
            <div className="estrellas">
              {renderEstrellas(producto.calificacion_promedio)}
            </div>
            <span className="calificacion-numero">
              {Number(producto.calificacion_promedio || 0).toFixed(1)}
            </span>
            <span className="total-resenas">
              ({producto.total_resenas || 0} reseñas)
            </span>
          </div>

          <p className="detalle-descripcion">
            {producto.Descripcion || "Sin descripción disponible"}
          </p>

          <p className="detalle-categoria">
            📂 Categoría: {producto.Categoria}
          </p>
          <p className="detalle-stock">
            📦 Stock disponible: {producto.Stock} unidades
          </p>

          <p className="detalle-precio">
            ${Number(producto.Precio).toLocaleString()}
          </p>

          <div className="detalle-cantidad">
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              max={producto.Stock}
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value))}
            />
          </div>

          <button
            onClick={() => agregarAlCarrito(producto.ID_Producto, cantidad)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      <ResenasProducto productoId={producto.ID_Producto} />

      <Footer />
    </div>
  );
}

export default ProductoDetalle;
