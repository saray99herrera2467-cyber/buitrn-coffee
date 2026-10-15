import { useState } from "react";
import VerificacionScreen from "./VerificacionScreen";

const CAFE_PRINCIPAL = "#F9A15E";
const CAFE_CLARO = "#FF7043";
const CREMA = "#FFFBF2";
const CREMA_CLARO = "#FFFFFF";
const TEXTO_OSCURO = "#2D2D2D";
const TEXTO_SUAVE = "#7D6E66";

const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]{3,}$/;
const REGEX_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Pantalla de registro. Al registrarse con éxito, muestra internamente
 * la pantalla de verificación de código para el correo ingresado.
 *
 * Props:
 * - onRegistrar: (datos) => Promise<void>   llamada al servicio de registro (lanza en caso de error)
 * - onVerificar: (codigo, correo) => Promise<void>  confirma el código de verificación
 * - onReenviarCodigo: (correo) => Promise<void>      reenvía el código de verificación
 * - onVolverLogin: () => void                 navegación al presionar la flecha de regreso
 * - onVerificacionExitosa: () => void          navegación tras verificar el código correctamente
 */
export default function RegistroScreen({
  onRegistrar,
  onVerificar,
  onReenviarCodigo,
  onVolverLogin,
  onVerificacionExitosa,
}) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    correo: "",
    direccion: "",
    telefono: "",
    clave: "",
  });
  const [ocultarClave, setOcultarClave] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { texto, error }
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const mostrarMensaje = (texto, error = true) => {
    setMensaje({ texto, error });
    window.setTimeout(() => setMensaje(null), 3500);
  };

  const validar = () => {
    const { nombre, apellido, documento, correo, direccion, telefono, clave } = form;

    if (!nombre.trim()) return "Por favor, complete su nombre verdadero";
    if (!apellido.trim()) return "Por favor, complete su nombre verdadero";

    if (!REGEX_NOMBRE.test(nombre.trim()) || !REGEX_NOMBRE.test(apellido.trim())) {
      return "Por favor, complete su nombre verdadero (solo letras, mín. 3 caracteres)";
    }

    if (!documento.trim()) return "El documento es obligatorio";
    if (!correo.trim()) return "El correo es obligatorio";
    if (!direccion.trim()) return "La dirección es obligatorio";
    if (!telefono.trim()) return "El teléfono es obligatorio";
    if (!clave.trim()) return "La contraseña es obligatoria";

    if (documento.trim().length > 11) return "El documento no puede tener más de 11 dígitos";
    if (telefono.trim().length > 10) return "El teléfono no puede tener más de 10 dígitos";

    if (!REGEX_CORREO.test(correo.trim())) return "Ingresa un correo electrónico válido";
    if (clave.trim().length < 8) return "La contraseña debe tener al menos 8 caracteres";

    return null;
  };

  const registrarse = async (e) => {
    e.preventDefault();
    const error = validar();
    if (error) {
      mostrarMensaje(error);
      return;
    }

    setCargando(true);
    try {
      await onRegistrar?.({
        nombreUsuario: form.nombre.trim(),
        apellido: form.apellido.trim(),
        documento: form.documento.trim(),
        correo: form.correo.trim(),
        clave: form.clave.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
      });

      mostrarMensaje("Registro realizado. Por favor verifica tu correo.", false);
      setMostrarVerificacion(true);
    } catch (err) {
      mostrarMensaje(String(err?.message ?? err).replace(/^Exception:\s*/, ""));
    } finally {
      setCargando(false);
    }
  };

  if (mostrarVerificacion) {
    return (
      <VerificacionScreen
        email={form.correo.trim()}
        esRecuperacion={false}
        onVerificar={(codigo) => onVerificar?.(codigo, form.correo.trim())}
        onReenviar={() => onReenviarCodigo?.(form.correo.trim())}
        onExito={onVerificacionExitosa}
        onVolver={() => setMostrarVerificacion(false)}
      />
    );
  }

  return (
    <div style={styles.pantalla}>
      <div style={styles.appBar}>
        <button type="button" aria-label="Volver" onClick={onVolverLogin} style={styles.botonVolver}>
          <ArrowIcon />
        </button>
        <span style={styles.appBarTitulo}>BUITRÓN COFFEE</span>
        <span style={{ width: 40 }} />
      </div>

      <form style={styles.contenido} onSubmit={registrarse}>
        <div style={styles.avatar}>
          <PersonAddIcon />
        </div>

        <h1 style={styles.titulo}>CREAR CUENTA</h1>
        <p style={styles.subtitulo}>Regístrate para disfrutar de Buitrón Coffee</p>

        <Campo
          label="Nombre"
          placeholder="Escriba su nombre"
          icono={<PersonIcon />}
          value={form.nombre}
          onChange={(v) => actualizarCampo("nombre", v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, ""))}
        />
        <Campo
          label="Apellido"
          placeholder="Escriba su apellido"
          icono={<BadgeIcon />}
          value={form.apellido}
          onChange={(v) => actualizarCampo("apellido", v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, ""))}
        />
        <Campo
          label="Número de documento"
          placeholder="Ej: 1023456789"
          icono={<DocIcon />}
          inputMode="numeric"
          maxLength={11}
          value={form.documento}
          onChange={(v) => actualizarCampo("documento", v.replace(/\D/g, ""))}
        />
        <Campo
          label="Correo electrónico"
          placeholder="Correo"
          icono={<MailIcon />}
          type="email"
          value={form.correo}
          onChange={(v) => actualizarCampo("correo", v)}
        />
        <Campo
          label="Dirección"
          placeholder="Dirección"
          icono={<PinIcon />}
          value={form.direccion}
          onChange={(v) => actualizarCampo("direccion", v)}
        />
        <Campo
          label="Teléfono"
          placeholder="Ej: 3101234567"
          icono={<PhoneIcon />}
          inputMode="numeric"
          maxLength={10}
          value={form.telefono}
          onChange={(v) => actualizarCampo("telefono", v.replace(/\D/g, ""))}
        />

        <div style={styles.campoContenedor}>
          <span style={styles.campoIcono}><LockIcon /></span>
          <div style={styles.campoTextos}>
            <label style={styles.campoLabel}>Contraseña</label>
            <input
              type={ocultarClave ? "password" : "text"}
              placeholder="Ingrese una contraseña"
              value={form.clave}
              onChange={(e) => actualizarCampo("clave", e.target.value)}
              style={styles.campoInput}
            />
          </div>
          <button
            type="button"
            onClick={() => setOcultarClave((v) => !v)}
            style={styles.botonOjo}
            aria-label={ocultarClave ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            {ocultarClave ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            ...styles.botonRegistrar,
            opacity: cargando ? 0.85 : 1,
            cursor: cargando ? "default" : "pointer",
          }}
        >
          {cargando ? <Spinner /> : "REGISTRARSE"}
        </button>
      </form>

      {mensaje && (
        <div
          style={{
            ...styles.snackbar,
            backgroundColor: mensaje.error ? "#D32F2F" : CAFE_PRINCIPAL,
          }}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

function Campo({ label, placeholder, icono, value, onChange, type = "text", inputMode, maxLength }) {
  return (
    <div style={styles.campoContenedor}>
      <span style={styles.campoIcono}>{icono}</span>
      <div style={styles.campoTextos}>
        <label style={styles.campoLabel}>{label}</label>
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.campoInput}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <>
      <span style={styles.spinner} />
      <style>{`@keyframes girar { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ---------------- Iconos (SVG minimalistas, trazo naranja) ---------------- */

function iconoBase(children) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonAddIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={CAFE_PRINCIPAL} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M18 8v5M20.5 10.5H15.5" />
    </svg>
  );
}

function PersonIcon() {
  return iconoBase(<><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-3.6 3.1-6 7.5-6s7.5 2.4 7.5 6" /></>);
}
function BadgeIcon() {
  return iconoBase(<><rect x="4" y="5" width="16" height="15" rx="2" /><circle cx="12" cy="11" r="2.3" /><path d="M8 17.5c0-1.8 1.8-3 4-3s4 1.2 4 3" /></>);
}
function DocIcon() {
  return iconoBase(<><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>);
}
function MailIcon() {
  return iconoBase(<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4.5 7l7.5 6 7.5-6" /></>);
}
function PinIcon() {
  return iconoBase(<><path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></>);
}
function PhoneIcon() {
  return iconoBase(<path d="M7 3.5c1 0 1.9.6 2.2 1.6l.7 2c.2.7 0 1.5-.5 2l-1 .9a12.5 12.5 0 0 0 5.6 5.6l.9-1c.5-.5 1.3-.7 2-.5l2 .7c1 .3 1.6 1.2 1.6 2.2v1.7c0 1.4-1.2 2.5-2.6 2.3C10.4 19.8 4.2 13.6 3.1 6.1 2.9 4.7 4 3.5 5.4 3.5H7Z" />);
}
function LockIcon() {
  return iconoBase(<><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></>);
}
function EyeIcon() {
  return iconoBase(<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></>);
}
function EyeOffIcon() {
  return iconoBase(<><path d="M3 3l18 18" /><path d="M9.9 5.1A10.6 10.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.4 15.4 0 0 1-3 3.6M6.5 6.9C4.3 8.6 2.5 12 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3.4-.6" /><path d="M14.3 14.3a2.6 2.6 0 0 1-4-3.4" /></>);
}

const styles = {
  pantalla: {
    minHeight: "100vh",
    backgroundColor: CREMA,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  appBar: {
    height: 56,
    backgroundColor: CAFE_PRINCIPAL,
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
  },
  botonVolver: {
    background: "none",
    border: "none",
    padding: 8,
    cursor: "pointer",
    display: "flex",
    width: 40,
  },
  appBarTitulo: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "1px",
  },
  contenido: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "30px 25px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: "50%",
    backgroundColor: CREMA_CLARO,
    border: `3px solid ${CAFE_CLARO}`,
    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 700,
    color: CAFE_PRINCIPAL,
    letterSpacing: "0.5px",
    margin: 0,
  },
  subtitulo: {
    fontSize: 14,
    color: TEXTO_SUAVE,
    textAlign: "center",
    margin: "7px 0 28px",
  },
  campoContenedor: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    backgroundColor: CREMA_CLARO,
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
    border: "2px solid transparent",
  },
  campoIcono: {
    color: CAFE_PRINCIPAL,
    display: "flex",
    flexShrink: 0,
  },
  campoTextos: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  campoLabel: {
    fontSize: 11,
    color: TEXTO_SUAVE,
    marginBottom: 2,
  },
  campoInput: {
    border: "none",
    outline: "none",
    fontSize: 15,
    color: TEXTO_OSCURO,
    backgroundColor: "transparent",
    padding: 0,
  },
  botonOjo: {
    background: "none",
    border: "none",
    color: CAFE_CLARO,
    cursor: "pointer",
    display: "flex",
  },
  botonRegistrar: {
    width: 260,
    height: 50,
    border: "none",
    borderRadius: 10,
    background: `linear-gradient(90deg, ${CAFE_PRINCIPAL}, ${CAFE_CLARO})`,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.5px",
    boxShadow: `0 4px 10px ${CAFE_PRINCIPAL}4D`,
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#FFFFFF",
    display: "inline-block",
    animation: "girar 0.8s linear infinite",
  },
  snackbar: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#FFFFFF",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 14,
    maxWidth: "90%",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
};