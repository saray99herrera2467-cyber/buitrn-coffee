import { useCarrito } from "../context/CarritoContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import "../estilos/carrito.css";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from "../components/ReciboPDF";
import HeaderGlobal from "../components/HeaderGlobal";

function Carrito() {
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, cargando } = useCarrito();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [pedidoCompletado, setPedidoCompletado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState("");

  const token = localStorage.getItem('token');

  const subtotal = carrito.total;
  const total = subtotal; // No hay envío

  const handleProcederPago = async () => {
    if (!token) {
      alert("Debes iniciar sesión para continuar");
      navigate("/login");
      return;
    }

    try {
      const usuarioRes = await axios.get("http://localhost:3001/api/auth/perfil", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuario(usuarioRes.data);
      setMostrarFormulario(true);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      alert("Error al obtener datos del usuario");
    }
  };

  const confirmarCompra = async () => {
    if (!usuario) {
      alert("Error: No se encontraron datos del usuario");
      return;
    }

    if (!carrito.items || carrito.items.length === 0) {
      alert("Error: El carrito está vacío");
      return;
    }

    setProcesando(true);

    try {
      const pedidoData = {
        ID_Usuario: usuario.ID_Usuario,
        items: carrito.items.map(item => ({
          ID_Producto: item.ID_Producto,
          Nombre_producto: item.Nombre_producto,
          Cantidad: item.Cantidad,
          PrecioUnitario: item.Precio
        })),
        subtotal: subtotal,
        total: total
      };

      const pedidoRes = await axios.post("http://localhost:3001/api/pedidos", pedidoData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPedidoCompletado({
        id: pedidoRes.data.ID_Pedido,
        items: carrito.items,
        subtotal: subtotal,
        total: total,
        fecha: new Date().toISOString(),
        fecha_limite: pedidoRes.data.fecha_limite,
        metodoPago: metodoPago
      });

      await vaciarCarrito();
      
    } catch (error) {
      console.error("Error al procesar compra:", error);
      alert(error.response?.data?.message || "Error al procesar la compra");
      setProcesando(false);
    }
  };

  if (cargando) {
    return <div className="cargando">Cargando carrito...</div>;
  }

  // Mostrar recibo después de la compra
  if (pedidoCompletado && usuario) {
    return (
      <>
        <HeaderGlobal />
        <div className="recibo-container">
          <div className="recibo-card">
            <h1>¡Pedido realizado con éxito!</h1>
            <p>Tu pedido ha sido procesado correctamente.</p>
            <p><strong>Número de pedido:</strong> #{pedidoCompletado.id}</p>
            <p><strong>Fecha límite de pago:</strong> {new Date(pedidoCompletado.fecha_limite).toLocaleString()}</p>
            
            <div className="recibo-actions">
              <PDFDownloadLink
                document={
                  <ReciboPDF
                    compra={{
                      items: pedidoCompletado.items,
                      subtotal: pedidoCompletado.subtotal,
                      total: pedidoCompletado.total,
                      metodoPago: pedidoCompletado.metodoPago
                    }}
                    usuario={usuario}
                    fecha={new Date(pedidoCompletado.fecha).toLocaleString()}
                    fechaLimite={new Date(pedidoCompletado.fecha_limite).toLocaleString()}
                    numeroRecibo={`F-${pedidoCompletado.id.toString().padStart(6, '0')}`}
                  />
                }
                fileName={`recibo_${pedidoCompletado.id}.pdf`}
              >
                {({ loading, error }) => {
                  if (error) {
                    console.error("Error PDF:", error);
                    return <button className="btn-error">Error al generar PDF</button>;
                  }
                  return (
                    <button className="btn-descargar" disabled={loading}>
                      {loading ? "Generando PDF..." : "📄 Descargar Recibo"}
                    </button>
                  );
                }}
              </PDFDownloadLink>
              
              <button className="btn-seguir" onClick={() => navigate("/catalogo")}>
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (carrito.items.length === 0) {
    return (
      <>
        <HeaderGlobal />
        <div className="carrito-vacio">
          <h2>Tu carrito está vacío</h2>
          <Link to="/catalogo">
            <button className="btn-primary">Ver productos</button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderGlobal />
      <div className="carrito-container">
        <h1>Mi Carrito</h1>
        
        {errorDetalle && (
          <div className="error-detalle" style={{ background: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
            {errorDetalle}
          </div>
        )}

        <div className="carrito-content">
          <div className="carrito-items">
            <table className="carrito-tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.items.map((item) => (
                  <tr key={item.ID_Carrito}>
                    <td className="producto-info">
                      <img 
                        src={`http://localhost:3001/imagenes/${item.imagen}`} 
                        alt={item.Nombre_producto}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                      />
                      <div>
                        <h3>{item.Nombre_producto}</h3>
                        <p>{item.Descripcion?.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td>${item.Precio.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.Cantidad}
                        onChange={(e) => actualizarCantidad(item.ID_Carrito, parseInt(e.target.value))}
                        className="cantidad-input"
                      />
                    </td>
                    <td>${(item.Precio * item.Cantidad).toLocaleString()}</td>
                    <td>
                      <button 
                        onClick={() => eliminarDelCarrito(item.ID_Carrito)}
                        className="btn-eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="carrito-resumen">
            <h2>Resumen del pedido</h2>
            <div className="resumen-linea">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="resumen-linea total">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>

            {!mostrarFormulario ? (
              <button onClick={handleProcederPago} className="btn-primary btn-checkout">
                Continuar con el Pedido
              </button>
            ) : (
              <div className="formulario-pago">
                <div className="form-group">
                  <label>Método de pago:</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="metodo-select"
                  >
                    <option value="Efectivo">Efectivo contra entrega</option>
                    <option value="Transferencia">Transferencia bancaria</option>
                    <option value="Tarjeta">Tarjeta débito/crédito</option>
                  </select>
                </div>
                <button 
                  onClick={confirmarCompra} 
                  className="btn-primary"
                  disabled={procesando}
                >
                  {procesando ? "Procesando..." : "Confirmar Pedido"}
                </button>
                <button 
                  onClick={() => setMostrarFormulario(false)} 
                  className="btn-secundario"
                >
                  Cancelar
                </button>
              </div>
            )}
            
            <button onClick={vaciarCarrito} className="btn-secundario">
              Vaciar carrito
            </button>
            
            <Link to="/catalogo">
              <button className="btn-link">Seguir comprando</button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Carrito;