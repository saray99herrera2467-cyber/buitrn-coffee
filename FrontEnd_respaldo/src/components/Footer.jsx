import { Link, useNavigate } from "react-router-dom";
import "../estilos/footer.css";

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Buitrón Coffee</h3>
          <p>El mejor café artesanal, cultivado con pasión y dedicación.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <ul className="contact-info">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>Calle Principal 123, Ciudad</span>
            </li>
            <li>
              <i className="fas fa-phone"></i>
              <a href="tel:+571234567890">+57 123 456 7890</a>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <a href="mailto:info@buitroncoffee.com">info@buitroncoffee.com</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Horario de atención</h4>
          <ul className="schedule">
            <li>Lunes a Viernes: 8:00am - 6:00pm</li>
            <li>Sábados: 9:00am - 4:00pm</li>
            <li>Domingos: 10:00am - 2:00pm</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Buitrón Coffee. Todos los derechos reservados</p>
      </div>
    </footer>
  );
}

export default Footer;