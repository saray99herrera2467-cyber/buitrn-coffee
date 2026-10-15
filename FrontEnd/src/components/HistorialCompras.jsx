import { useState, useEffect } from "react";
import axios from "axios";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from "../components/ReciboPDF";
import "../estilos/historial.css";

function HistorialCompras({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallePedido, setDetallePedido] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarHistorial();
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/auth/perfil", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarioLogueado(res.data);
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    }
  };

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const res = await axios.get("http://localhost:3001/api/pedidos/historial", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data);
      setError("");
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setError("Error al cargar el historial de compras");
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (pedidoId) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/pedidos/detalle/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetallePedido(res.data);
      setPedidoSeleccionado(pedidoId);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      alert("Error al cargar el detalle del pedido");
    }
  };

  const cerrarDetalle = () => {
    setPedidoSeleccionado(null);
    setDetallePedido(null);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearNumero = (numero) => {
    return (numero || 0).toLocaleString();
  };

  const getEstadoColor = (estado, fechaLimite, pagado) => {
    if (estado === "Cancelado") return "#e74c3c";
    if (estado === "Pendiente" && fechaLimite && new Date(fechaLimite) < new Date() && !pagado) {
      return "#e74c3c";
    }
    switch(estado) {
      case "Pendiente": return "#f39c12";
      case "Enviado": return "#3498db";
      case "Entregado": return "#27ae60";
      default: return "#95a5a6";
    }
  };

  const getEstadoTexto = (estado, fechaLimite, pagado) => {
    if (estado === "Pendiente" && fechaLimite && new Date(fechaLimite) < new Date() && !pagado) {
      return "Vencido";
    }
    return estado;
  };

  if (cargando) {
    return <div className="historial-cargando">Cargando historial...</div>;
  }

  if (error) {
    return <div className="historial-error">{error}</div>;
  }

  if (pedidos.length === 0) {
    return (
      <div className="historial-vacio">
        <i className="fa-solid fa-receipt"></i>
        <p>Aún no has realizado compras</p>
        <button onClick={() => window.location.href = "/catalogo"} className="btn-comprar">
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <h2>Historial de Compras</h2>
      
      <div className="pedidos-lista">
        {pedidos.map((pedido) => (
          <div key={pedido.ID_Pedido} className="pedido-card">
            <div className="pedido-header">
              <div className="pedido-info">
                <span className="pedido-numero">
                  Pedido #{pedido.ID_Pedido?.toString().padStart(6, '0') || '000000'}
                </span>
                <span className="pedido-fecha">
                  {formatearFecha(pedido.Fecha)}
                </span>
              </div>
              <div className="pedido-estado">
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: getEstadoColor(pedido.Estado, pedido.Fecha_Limite, pedido.Pagado) }}
                >
                  {getEstadoTexto(pedido.Estado, pedido.Fecha_Limite, pedido.Pagado)}
                </span>
              </div>
            </div>
            
            <div className="pedido-resumen">
              <div className="resumen-item">
                <span>Productos:</span>
                <strong>{pedido.CantidadProductos || 0} artículos</strong>
              </div>
              <div className="resumen-item">
                <span>Total:</span>
                <strong className="total">${formatearNumero(pedido.Total)}</strong>
              </div>
            </div>
            
            <div className="pedido-productos-preview">
              {pedido.ProductosLista?.slice(0, 3).map((producto, idx) => (
                <span key={idx} className="producto-tag">
                  {producto}
                </span>
              ))}
              {pedido.ProductosLista?.length > 3 && (
                <span className="producto-tag-mas">
                  +{pedido.ProductosLista.length - 3} más
                </span>
              )}
            </div>
            
            <div className="pedido-acciones">
              <button onClick={() => verDetalle(pedido.ID_Pedido)} className="btn-ver-detalle">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles */}
      {pedidoSeleccionado && detallePedido && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Pedido #{pedidoSeleccionado.toString().padStart(6, '0')}</h3>
              <button onClick={cerrarDetalle} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-info">
                <div className="info-linea">
                  <span>Fecha:</span>
                  <strong>{formatearFecha(detallePedido.Fecha)}</strong>
                </div>
                <div className="info-linea">
                  <span>Estado:</span>
                  <strong style={{ color: getEstadoColor(detallePedido.Estado, detallePedido.Fecha_Limite, detallePedido.Pagado) }}>
                    {getEstadoTexto(detallePedido.Estado, detallePedido.Fecha_Limite, detallePedido.Pagado)}
                  </strong>
                </div>
                <div className="info-linea">
                  <span>Fecha límite de pago:</span>
                  <strong>{formatearFecha(detallePedido.Fecha_Limite)}</strong>
                </div>
                <div className="info-linea">
                  <span>Estado de pago:</span>
                  <strong>{detallePedido.Pagado ? "Pagado" : "Pendiente"}</strong>
                </div>
              </div>

              <div className="detalle-productos">
                <h4>Productos:</h4>
                <div className="productos-lista-detalle">
                  {detallePedido.items?.map((item, idx) => (
                    <div key={idx} className="producto-detalle-item">
                      <img 
                        src={`http://localhost:3001/imagenes/${item.imagen}`} 
                        alt={item.Nombre_producto}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      />
                      <div className="producto-detalle-info">
                        <div className="producto-nombre">{item.Nombre_producto}</div>
                        <div className="producto-descripcion">{item.Descripcion?.substring(0, 60)}...</div>
                        <div className="producto-precio">
                          {item.Cantidad} x ${formatearNumero(item.PrecioUnitario)}
                        </div>
                      </div>
                      <div className="producto-subtotal">
                        ${formatearNumero(item.Cantidad * item.PrecioUnitario)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detalle-resumen">
                <div className="resumen-linea">
                  <span>Subtotal:</span>
                  <span>${formatearNumero(detallePedido.Subtotal)}</span>
                </div>
                <div className="resumen-linea total">
                  <span>Total:</span>
                  <span>${formatearNumero(detallePedido.Total)}</span>
                </div>
              </div>

              <div className="detalle-acciones">
                <PDFDownloadLink
                  document={
                    <ReciboPDF
                      compra={{
                        items: detallePedido.items || [],
                        subtotal: detallePedido.Subtotal || 0,
                        total: detallePedido.Total || 0
                      }}
                      usuario={usuarioLogueado}
                      fecha={formatearFecha(detallePedido.Fecha)}
                      fechaLimite={formatearFecha(detallePedido.Fecha_Limite)}
                      numeroRecibo={`F-${detallePedido.ID_Pedido?.toString().padStart(6, '0') || '000000'}`}
                    />
                  }
                  fileName={`recibo_${detallePedido.ID_Pedido || Date.now()}.pdf`}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialCompras;