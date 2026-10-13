import { useEffect } from "react";
import "../estilos/nosotros.css";
import HeaderGlobal from "../components/HeaderGlobal";
import Footer from "../components/Footer";

function Nosotros() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="nosotros">
<HeaderGlobal />
      <div className="pqrs-hero">
        <div className="pqrs-hero-content">
          <h1>Nosotros</h1>
          <p>¿Quiénes somos?</p>
        </div>
      </div>
      {/* Nuestra Historia */}
      <section className="historia-section">
        <div className="container">
          <div className="historia-content">
            <div className="historia-texto">
              <h2>Nuestra Historia</h2>
              <p>
                Buitrón Coffee nació en 2024 con un sueño: llevar el mejor café artesanal 
                a cada hogar colombiano. Fundada por la familia Buitrón, nuestra pasión por 
                el café comenzó en Pitalito Huila en la Finca "Las brisas ", donde cultivamos nuestras 
                primeras plantas de café.
              </p>
              <p>
                Desde entonces, nos hemos dedicado a seleccionar los mejores granos, 
                trabajar directamente con agricultores locales y tostar cada lote con el 
                cuidado y la precisión que merece un café excepcional.
              </p>
            </div>
            <div className="historia-imagen">
              <img src="/pictures/historia.jpeg" alt="Historia de Buitrón Coffee" />
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="mvv-section">
        <div className="container">
          <div className="mvv-grid">
            <div className="mvv-card">
              <div className="mvv-icon">🎯</div>
              <h3>Misión</h3>
              <p>
                Ofrecer café de la más alta calidad, cultivado de manera sostenible, 
                mientras apoyamos a las comunidades cafeteras locales.
              </p>
            </div>
            <div className="mvv-card">
              <div className="mvv-icon">👁️</div>
              <h3>Visión</h3>
              <p>
                Ser reconocidos como la mejor cafetería artesanal de Colombia, 
                expandiendo nuestro amor por el café a nivel internacional.
              </p>
            </div>
            <div className="mvv-card">
              <div className="mvv-icon">💎</div>
              <h3>Valores</h3>
              <ul>
                <li>✨ Calidad ante todo</li>
                <li>🌱 Sostenibilidad</li>
                <li>🤝 Compromiso social</li>
                <li>❤️ Pasión por el café</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Café */}
      <section className="cafe-section">
        <div className="container">
          <h2>Nuestro Café</h2>
          <div className="cafe-grid">
            <div className="cafe-item">
              <div className="cafe-icon">🌄</div>
              <h3>Origen</h3>
              <p>Granos 100% colombianos de las mejores regiones cafeteras</p>
            </div>
            <div className="cafe-item">
              <div className="cafe-icon">🔥</div>
              <h3>Tostado Artesanal</h3>
              <p>Tueste cuidadoso que resalta los sabores únicos de cada grano</p>
            </div>
            <div className="cafe-item">
              <div className="cafe-icon">🤲</div>
              <h3>Selección Manual</h3>
              <p>Cada grano es seleccionado a mano para garantizar la calidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Equipo */}
      <section className="equipo-section">
        <div className="container">
          <h2>Nuestro Equipo</h2>
          <div className="equipo-grid">
            <div className="equipo-card">
              <div className="equipo-imagen">
                <img src="/pictures/colaborador1.png"/>
              </div>
              <h3>Juan Buitrón</h3>
              <p>Fundador</p>
              <p className="equipo-descripcion">
                2 años de experiencia en la industria del café.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Llamada a la acción */}
      <section className="cta-section">
        <div className="container">
          <h2>¿Listo para probar nuestro café?</h2>
          <p>Descubre nuestra selección de cafés especiales</p>
          <button className="btn-primary" onClick={() => window.location.href = '/catalogo'}>
            Ver productos
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Nosotros;