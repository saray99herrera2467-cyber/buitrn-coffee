  import { useEffect, useState } from "react";
  import "../estilos/pqrs.css";
  import { Link } from "react-router-dom";
  import HeaderGlobal from "../components/HeaderGlobal";
  import FooterGlobal from "../components/Footer";

  function PQRS() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
      fetch("http://localhost:3001/api/productos/activos")
        .then((res) => res.json())
        .then((data) => setProductos(data))
        .catch((err) => console.log(err));
    }, []);

    return (
      <div className="pqrs-page">
        <HeaderGlobal />

        {/* Hero Section */}
        <div className="pqrs-hero">
          <div className="pqrs-hero-content">
            <h1>PQRS</h1>
            <p>Quejas, Reclamos, Sugerencias y Felicitaciones</p>
          </div>
        </div>

        {/* Sección Explicativa */}
        <section className="info-section">
          <div className="container">
            <h2>¿Qué es un PQRS?</h2>
            <div className="info-content">
              <p>
                <strong>PQRS</strong> son las siglas de <strong>P</strong>reguntas, 
                <strong> Q</strong>uejas, <strong>R</strong>eclamos y 
                <strong> S</strong>ugerencias.
                Es un mecanismo que permite a nuestros clientes comunicarse con 
                Buitrón Coffee para expresar sus opiniones, inquietudes o 
                reconocimientos sobre nuestros productos y servicios.
              </p>
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon">❓</div>
                  <h3>Preguntas</h3>
                  <p>Consultas sobre nuestros productos, servicios o políticas.</p>
                </div>
                <div className="info-card">
                  <div className="info-icon">⚠️</div>
                  <h3>Quejas</h3>
                  <p>Insatisfacción con un producto o servicio recibido.</p>
                </div>
                <div className="info-card">
                  <div className="info-icon">📝</div>
                  <h3>Reclamos</h3>
                  <p>Inconformidad por un incumplimiento o error en el servicio.</p>
                </div>
                <div className="info-card">
                  <div className="info-icon">💡</div>
                  <h3>Sugerencias</h3>
                  <p>Ideas para mejorar nuestros productos o servicios.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Acciones */}
        <section className="actions-section">
          <div className="container">
            <h2>¿Qué deseas hacer?</h2>
            <div className="cards-container">
              <div className="pqrs-card">
                <div className="card-icon">✍️</div>
                <h3>Realizar una PQRS</h3>
                <p>
                  Si tienes alguna queja, reclamo, sugerencia o felicitación, 
                  no dudes en contactarnos. Estamos aquí para escucharte y 
                  mejorar tu experiencia con Buitrón Coffee.
                </p>
                <Link to="/realizarpqrs">
                  <button className="btn-primary">Realizar PQRS</button>
                </Link>
              </div>
              
              <div className="pqrs-card">
                <div className="card-icon">🔍</div>
                <h3>Consultar estado de PQRS</h3>
                <p>
                  Si ya has realizado una PQRS y deseas conocer su estado, 
                  puedes hacerlo aquí. Ingresa tu número de referencia para 
                  obtener información actualizada sobre tu solicitud.
                </p>
                <Link to="/consultarpqrs">
                  <button className="btn-secondary">Consultar estado</button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="benefits-section">
          <div className="container">
            <h2>Nuestro compromiso contigo</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">⏱️</div>
                <h3>Respuesta rápida</h3>
                <p>Te daremos respuesta en máximo 48 horas hábiles</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🔒</div>
                <h3>Confidencialidad</h3>
                <p>Tus datos están seguros y protegidos</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📊</div>
                <h3>Seguimiento</h3>
                <p>Podrás consultar el estado de tu PQRS en cualquier momento</p>
              </div>
            </div>
          </div>
        </section>
        <FooterGlobal />
      </div>
    );
  }

  export default PQRS;