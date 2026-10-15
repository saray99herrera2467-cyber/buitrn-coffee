import { useState, useRef, useCallback } from "react";

const NARANJA_PRINCIPAL = "#F9A15E";
const NARANJA_INTENSO = "#FF7043";
const FONDO = "#FFFBF2";
const TEXTO_PRINCIPAL = "#2D2D2D";
const TEXTO_SECUNDARIO = "#7D6E66";
const BORDE = "#C8B8AE";
const COLOR_ERROR = "#9E0000";

/**
 * Pantalla de verificación de cuenta / recuperación de contraseña.
 *
 * Props:
 * - email: string                         correo al que se envió el código
 * - esRecuperacion: boolean                si viene del flujo de recuperación de clave
 * - onVerificar: (codigo) => Promise<void> llamada al confirmar el código (debe lanzar en caso de error)
 * - onReenviar: () => Promise<void>        llamada al reenviar el código (debe lanzar en caso de error)
 * - onExito: () => void                    navegación tras verificar correctamente
 * - onVolver: () => void                   navegación al presionar la flecha de regreso
 */
export default function VerificacionScreen({
  email = "correo@ejemplo.com",
  esRecuperacion = false,
  onVerificar,
  onReenviar,
  onExito,
  onVolver,
}) {
  const [digitos, setDigitos] = useState(Array(6).fill(""));
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { texto, exito }
  const inputsRef = useRef([]);

  const codigoIngresado = digitos.join("");

  const mostrarMensaje = useCallback((texto, exito = false) => {
    setMensaje({ texto, exito });
    window.clearTimeout(mostrarMensaje._timer);
    mostrarMensaje._timer = window.setTimeout(() => setMensaje(null), 3500);
  }, []);

  const manejarCambio = (valor, index) => {
    const limpio = valor.replace(/[^0-9]/g, "").slice(-1);
    setDigitos((prev) => {
      const siguiente = [...prev];
      siguiente[index] = limpio;
      return siguiente;
    });

    if (limpio && index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else if (!limpio && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const manejarTeclaAbajo = (e, index) => {
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const manejarPegado = (e) => {
    const texto = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!texto) return;
    e.preventDefault();
    const nuevos = Array(6).fill("");
    texto.split("").forEach((c, i) => (nuevos[i] = c));
    setDigitos(nuevos);
    const ultimo = Math.min(texto.length, 5);
    inputsRef.current[ultimo]?.focus();
  };

  const verificarCodigo = async () => {
    if (codigoIngresado.length !== 6) {
      mostrarMensaje("Ingresa el código completo de 6 dígitos");
      return;
    }

    setCargando(true);
    try {
      await onVerificar?.(codigoIngresado);
      mostrarMensaje("¡Código verificado correctamente!", true);
      setTimeout(() => {
        onExito?.();
      }, 500);
    } catch (err) {
      mostrarMensaje(String(err?.message ?? err).replace(/^Exception:\s*/, ""));
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    if (cargando) return;
    setCargando(true);
    try {
      await onReenviar?.();
      mostrarMensaje("Código reenviado correctamente.", true);
    } catch (err) {
      mostrarMensaje(String(err?.message ?? err).replace(/^Exception:\s*/, ""));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.appBar}>
        <button
          type="button"
          aria-label="Volver"
          onClick={onVolver}
          style={styles.botonVolver}
        >
          <ArrowIcon />
        </button>
      </div>

      <div style={styles.contenido}>
        <div style={styles.centrado}>
          <img src="/assets/login.png" alt="" style={styles.logo} />
        </div>

        <h1 style={styles.titulo}>VERIFICACIÓN DE CUENTA</h1>

        <p style={styles.subtitulo}>
          Ingresa el código de 6 dígitos que enviamos a:
          <br />
          {email}
        </p>

        <div style={styles.filaCodigo}>
          {digitos.map((valor, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={valor}
              onChange={(e) => manejarCambio(e.target.value, index)}
              onKeyDown={(e) => manejarTeclaAbajo(e, index)}
              onPaste={manejarPegado}
              style={styles.casillaDigito}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={verificarCodigo}
          disabled={cargando}
          style={{
            ...styles.botonConfirmar,
            opacity: cargando ? 0.85 : 1,
            cursor: cargando ? "default" : "pointer",
          }}
        >
          {cargando ? <Spinner /> : "CONFIRMAR CÓDIGO"}
        </button>

        <button
          type="button"
          onClick={reenviarCodigo}
          disabled={cargando}
          style={styles.botonReenviar}
        >
          ¿No recibiste el código? Reenviar
        </button>
      </div>

      {mensaje && (
        <div
          style={{
            ...styles.snackbar,
            backgroundColor: mensaje.exito ? "#2E7D32" : COLOR_ERROR,
          }}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={NARANJA_PRINCIPAL}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <>
      <span style={styles.spinner} />
      <style>{`
        @keyframes girar { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

const styles = {
  pantalla: {
    minHeight: "100vh",
    backgroundColor: FONDO,
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  appBar: {
    height: 56,
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
  },
  contenido: {
    flex: 1,
    maxWidth: 420,
    width: "100%",
    margin: "0 auto",
    padding: "16px 24px",
    boxSizing: "border-box",
  },
  centrado: {
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    height: 100,
    objectFit: "contain",
  },
  titulo: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: 700,
    color: TEXTO_PRINCIPAL,
    letterSpacing: "1.2px",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: TEXTO_SECUNDARIO,
    lineHeight: 1.4,
    textAlign: "center",
    marginBottom: 32,
  },
  filaCodigo: {
    display: "flex",
    justifyContent: "space-evenly",
    gap: 8,
    marginBottom: 40,
  },
  casillaDigito: {
    width: 45,
    height: 52,
    textAlign: "center",
    fontSize: 22,
    fontWeight: 700,
    color: TEXTO_PRINCIPAL,
    backgroundColor: "#FFFFFF",
    border: `1px solid ${BORDE}`,
    borderRadius: 8,
    outline: "none",
  },
  botonConfirmar: {
    height: 52,
    border: "none",
    borderRadius: 12,
    background: `linear-gradient(90deg, ${NARANJA_PRINCIPAL}, ${NARANJA_INTENSO})`,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "1px",
    boxShadow: `0 4px 10px ${NARANJA_PRINCIPAL}4D`,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  botonReenviar: {
    marginTop: 20,
    background: "none",
    border: "none",
    color: NARANJA_PRINCIPAL,
    fontWeight: 600,
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
};