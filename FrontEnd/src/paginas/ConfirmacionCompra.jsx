import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from "../components/ReciboPDF";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";
import "../estilos/confirmacion.css";

function ConfirmacionCompra() {
  const location = useLocation();
  const navigate = useNavigate();
  const [compra, setCompra] = useState(null);

  useEffect(() => {
    if (location.state?.compra) {
      setCompra(location.state.compra);
    } else {
      navigate("/catalogo");
    }
  }, [location, navigate]);

  if (!compra) {
    return <div className="cargando">Cargando...</div>;
  }

  const numeroRecibo = `F-${compra.pedido.id.toString().padStart(6, '0')}`;
  const fecha = new Date(compra.pedido.fecha).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <HeaderGlobal />
      <div className="confirmacion-container">
        <div className="confirmacion-card">
          <div className="icono-exito">✅</div>
          <h1>¡Recibo Exitoso!</h1>
          <p className="mensaje">
            Tu pedido ha sido registrado correctamente. A continuación encontrarás los detalles de tu compra y podrás descargar tu recibo en formato PDF.
          </p>

          <div className="info-pedido">
            <h2>Detalles del pedido</h2>
            <div className="info-linea">
              <span>Número de pedido:</span>
              <strong>{numeroRecibo}</strong>
            </div>
            <div className="info-linea">
              <span>Fecha:</span>
              <strong>{fecha}</strong>
            </div>
            <div className="info-linea">
              <span>Total:</span>
              <strong>${compra.pedido.total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="productos-resumen">
            <h3>Productos comprados:</h3>
            {compra.pedido.items.map((item, index) => (
              <div key={index} className="producto-resumen">
                <span>{item.Nombre_producto}</span>
                <span>{item.Cantidad} x ${item.Precio.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="acciones">
            <PDFDownloadLink
              document={
                <ReciboPDF
                  compra={compra.pedido}
                  usuario={compra.pedido.usuario}
                  fecha={fecha}
                  numeroRecibo={numeroRecibo}
                />
              }
              fileName={`recibo_${numeroRecibo}.pdf`}
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generando PDF...' : '📄 Descargar Recibo PDF'
              }
            </PDFDownloadLink>

            <button 
              onClick={() => navigate("/catalogo")}
              className="btn-secundario"
            >
              Seguir Explorando
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ConfirmacionCompra;