import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../estilos/catalogo.css";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <span key={i} className={i <= Math.round(calificacion || 0) ? 'estrella-llena' : 'estrella-vacia'}>
          ★
        </span>
      );
    }
    return estrellas;
  };

  useEffect(() => {
    setCargando(true);
    fetch("http://localhost:3001/api/productos/activos")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        const params = new URLSearchParams(location.search);
        const searchParam = params.get("search") || "";
        const filtrados = searchParam ? data.filter(p => p.Nombre_producto.toLowerCase().includes(searchParam.toLowerCase())) : data;
        setProductosFiltrados(filtrados);
        setCargando(false);
      })
      .catch((err) => { console.log(err); setCargando(false); });
  }, [location.search]);

  if (cargando) return <div className="catalogo"><HeaderGlobal /><div className="loading">Cargando productos...</div><Footer /></div>;

  return (
    <div className="catalogo">
      <HeaderGlobal />
      <div className="pqrs-hero">
        <div className="pqrs-hero-content">
          <h1>Productos</h1>
          <p>Encontrarás nuestros productos de la mejor calidad para tu mesa</p>
        </div>
      </div>
      <section className="section">
        <div className="cards">
          {productosFiltrados.length === 0 ? (
            <div className="sin-resultados"><p>No se encontraron productos</p></div>
          ) : (
            productosFiltrados.map((producto) => (
              <div key={producto.ID_Producto} className="card">
                <img src={`http://localhost:3001/imagenes/${producto.imagen}`} alt={producto.Nombre_producto} />
                <h3>{producto.Nombre_producto}</h3>
                <p>{producto.Descripcion}</p>
                <div className="card-calificacion">{renderEstrellas(producto.calificacion_promedio)}</div>
                <strong>${producto.Precio}</strong>
                <button onClick={() => navigate(`/producto/${producto.ID_Producto}`)}>Ver más</button>
              </div>
            ))
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Catalogo;