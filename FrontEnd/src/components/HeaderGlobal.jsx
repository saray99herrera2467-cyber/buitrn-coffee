import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useState } from "react";
import "../estilos/header.css";

function GlobalHeader() {
  const navigate = useNavigate();
  const { carrito } = useCarrito();
  const [busqueda, setBusqueda] = useState("");

  const totalItems = carrito.items.reduce((sum, item) => sum + item.Cantidad, 0);

  const handleBuscar = () => {
    if (busqueda.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(busqueda)}`);
      setBusqueda("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBuscar();
    }
  };

  return (
    <>
      <div className="topbar">ENVÍOS GRATIS DESDE $50.000</div>

      <header className="header">
        <img
          className="logo-img"
          src="http://localhost:3001/imagenes/logob.png"
          alt="logo"
        />

        <div 
          className="logo-header"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          Buitrón Coffee
        </div>

        <div className="icons">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Buscar producto" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <i 
              className="fa-solid fa-magnifying-glass"
              onClick={handleBuscar}
            ></i>
          </div>

          <Link to="/usuario">
            <i className="fa-solid fa-user"></i>
          </Link>

          <Link to="/carrito" className="carrito-icon">
            <i className="fa-solid fa-cart-shopping"></i>
            {totalItems > 0 && (
              <span className="carrito-contador">{totalItems}</span>
            )}
          </Link>
        </div>
      </header>

      <nav className="nav">
        <Link to="/catalogo">
          <button>Inicio</button>
        </Link>
        <Link to="/nosotros">
          <button>Nosotros</button>
        </Link>
        <Link to="/pqrs">
          <button>PQRS</button>
        </Link>
      </nav>
    </>
  );
}

export default GlobalHeader;