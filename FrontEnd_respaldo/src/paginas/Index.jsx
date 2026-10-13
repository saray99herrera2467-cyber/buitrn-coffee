import { useEffect, useState } from "react";
import "../estilos/catalogo.css";
import { useNavigate } from "react-router-dom";
import HeaderIndex from "../components/HeaderIndex";
import Footer from "../components/Footer";

function Index() {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/productos/activos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.log(err));
  }, []);

  const handleProductClick = () => {
    navigate("/login");
  };

  return (
    <div className="catalogo">
      
      <HeaderIndex />
      
      <div className="pqrs-hero">
        <div className="pqrs-hero-content">
          <h1>Productos</h1>
          <p>Encontraras nuestros productos de la mejor calidad para tu mesa</p>
        </div>
      </div>

      <section className="section">
        <div className="tabs">
          <span className="active">Productos</span>
        </div>

        <div className="cards">
          {productos.map((producto) => (
            <div 
              key={producto.ID_Producto} 
              className="card"
              onClick={handleProductClick}
              style={{ cursor: "pointer" }}
            >
              <img
                src={`http://localhost:3001/imagenes/${producto.imagen}`}
                alt={producto.Nombre_producto}
              />

              <h3>{producto.Nombre_producto}</h3>

              <p>{producto.Descripcion}</p>

              <strong>${producto.Precio}</strong>

              <button onClick={(e) => {
                e.stopPropagation();
                handleProductClick();
              }}>
                Ver más
              </button>
            </div>
          ))}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

export default Index;