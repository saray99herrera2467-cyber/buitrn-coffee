import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./estilos-admin/GestionPedidos.css";

const GestionPedidos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallePedido, setDetallePedido] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarPedidos();
  }, []);

  const getTiempoRestante = (fechaLimite) => {
    if (!fechaLimite) return "No definida";

    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diff = limite - ahora;

    if (diff <= 0) return "⏰ Vencido";

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias} día(s) restante(s)`;
    if (horas > 0) return `${horas} hora(s) restante(s)`;
    return "Menos de 1 hora";
  };

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const res = await axios.get(
        "http://localhost:3001/api/pedidos/admin/todos",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPedidos(res.data);
      setPedidosFiltrados(res.data);
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setError("Error al cargar los pedidos");
      setCargando(false);
    }
  };

  const verDetalle = async (pedidoId) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/pedidos/admin/detalle/${pedidoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDetallePedido(res.data);
      setPedidoSeleccionado(pedidoId);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      alert("Error al cargar el detalle del pedido");
    }
  };

  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/pedidos/admin/estado/${pedidoId}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setExito(`Pedido #${pedidoId} actualizado a ${nuevoEstado}`);
      cargarPedidos();
      setTimeout(() => setExito(""), 3000);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setError("Error al actualizar el estado");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCambioEstado = async (pedidoId, nuevoEstado) => {
    if (
      window.confirm(
        `¿Cambiar estado del pedido #${pedidoId} a "${nuevoEstado}"?`,
      )
    ) {
      await actualizarEstado(pedidoId, nuevoEstado);
    }
  };

  const cerrarDetalle = () => {
    setPedidoSeleccionado(null);
    setDetallePedido(null);
  };

  // Filtrar pedidos
  useEffect(() => {
    let filtrados = [...pedidos];

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter((p) => p.Estado === filtroEstado);
    }

    if (busquedaUsuario.trim()) {
      filtrados = filtrados.filter(
        (p) =>
          p.Nombre_usuario.toLowerCase().includes(
            busquedaUsuario.toLowerCase(),
          ) ||
          p.Apellido.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
          p.Correo.toLowerCase().includes(busquedaUsuario.toLowerCase()),
      );
    }

    setPedidosFiltrados(filtrados);
  }, [filtroEstado, busquedaUsuario, pedidos]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const volver = () => {
    navigate("/admin");
  };

  if (cargando) {
    return (
      <div className="gestion-pedidos-container">
        <div className="loading">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="gestion-pedidos-container">
      <div className="gestion-pedidos-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>GESTIÓN DE PEDIDOS</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      {/* Filtros */}
      <div className="filtros-pedidos">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar por usuario, apellido o correo..."
            value={busquedaUsuario}
            onChange={(e) => setBusquedaUsuario(e.target.value)}
          />
        </div>
        <div className="filtro-estados">
          <button
            className={`filtro-btn ${filtroEstado === "todos" ? "active" : ""}`}
            onClick={() => setFiltroEstado("todos")}
          >
            Todos ({pedidos.length})
          </button>
          <button
            className={`filtro-btn ${filtroEstado === "Pendiente" ? "active" : ""}`}
            onClick={() => setFiltroEstado("Pendiente")}
          >
            Pendientes ({pedidos.filter((p) => p.Estado === "Pendiente").length}
            )
          </button>
          <button
            className={`filtro-btn ${filtroEstado === "Entregado" ? "active" : ""}`}
            onClick={() => setFiltroEstado("Entregado")}
          >
            Entregados ({pedidos.filter((p) => p.Estado === "Entregado").length}
            )
          </button>
          <button
            className={`filtro-btn ${filtroEstado === "Cancelado" ? "active" : ""}`}
            onClick={() => setFiltroEstado("Cancelado")}
          >
            Cancelados ({pedidos.filter((p) => p.Estado === "Cancelado").length}
            )
          </button>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="tabla-container">
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
              <th>Tiempo restante</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="sin-datos">
                  No hay pedidos para mostrar
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <tr key={pedido.ID_Pedido}>
                  <td className="pedido-id">
                    #{pedido.ID_Pedido.toString().padStart(6, "0")}
                  </td>
                  <td className="cliente-info">
                    <div className="cliente-nombre">
                      {pedido.Nombre_usuario} {pedido.Apellido}
                    </div>
                    <div className="cliente-correo">{pedido.Correo}</div>
                    <div className="cliente-telefono">{pedido.Telefono}</div>
                  </td>
                  <td>{formatearFecha(pedido.Fecha)}</td>
                  <td className="productos-count">
                    {pedido.CantidadProductos} artículos
                  </td>
                  <td className="pedido-total">
                    ${pedido.Total.toLocaleString()}
                  </td>
                  <td>
                    <select
                      className={`estado-select ${pedido.Estado.toLowerCase()}`}
                      value={pedido.Estado}
                      onChange={(e) =>
                        handleCambioEstado(pedido.ID_Pedido, e.target.value)
                      }
                    >
                      <option value="Pendiente">📋 Pendiente</option>
                      <option value="Entregado">✅ Entregado</option>
                      <option value="Cancelado">❌ Cancelado</option>
                    </select>
                  </td>
                  <td className="tiempo-restante">
                    <span
                      className={
                        new Date(pedido.Fecha_Limite) < new Date()
                          ? "vencido"
                          : "activo"
                      }
                    >
                      {getTiempoRestante(pedido.Fecha_Limite)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ver-detalle"
                      onClick={() => verDetalle(pedido.ID_Pedido)}
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {pedidoSeleccionado && detallePedido && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Detalle del Pedido #
                {pedidoSeleccionado.toString().padStart(6, "0")}
              </h3>
              <button onClick={cerrarDetalle} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detalle-productos">
                <h4>Productos:</h4>
                <div className="productos-lista">
                  {detallePedido.map((item, idx) => (
                    <div key={idx} className="producto-detalle-item">
                      <img
                        src={`http://localhost:3001/imagenes/${item.imagen}`}
                        alt={item.Nombre_producto}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/50")
                        }
                      />
                      <div className="producto-info">
                        <div className="producto-nombre">
                          {item.Nombre_producto}
                        </div>
                        <div className="producto-descripcion">
                          {item.Descripcion?.substring(0, 50)}...
                        </div>
                        <div className="producto-precio">
                          {item.Cantidad} x $
                          {item.PrecioUnitario.toLocaleString()}
                        </div>
                      </div>
                      <div className="producto-subtotal">
                        $
                        {(item.Cantidad * item.PrecioUnitario).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cerrar" onClick={cerrarDetalle}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidos;
