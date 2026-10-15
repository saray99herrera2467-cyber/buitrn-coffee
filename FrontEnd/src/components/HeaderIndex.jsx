import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../estilos/header.css";

function HeaderIndex() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const handleUserClick = () => {
    navigate("/login");
  };

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

          <div onClick={handleUserClick} style={{ cursor: "pointer" }}>
            <i className="fa-solid fa-user"></i>
          </div>
        </div>
      </header>

      <nav className="nav">
        <Link to="/">
          <button>Inicio</button>
        </Link>
      </nav>
    </>
  );
}

export default HeaderIndex;