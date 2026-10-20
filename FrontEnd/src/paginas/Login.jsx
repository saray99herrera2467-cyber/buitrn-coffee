import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../estilos/login.css";

function Login() {
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(false);
    const [Correo, setCorreo] = useState("");
    const [Clave, setClave] = useState("");
    const [mostrarClave, setMostrarClave] = useState(false);
    const [error, setError] = useState("");

    const login = async (e) => {
        e.preventDefault();

        setCargando(true);
        setError("");

        try {
            const res = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    Correo: Correo.trim().toLowerCase(),
                    Clave,
                }
            );

            const { token, usuario } = res.data;

            // Guardar sesión
            localStorage.setItem("token", token);
            localStorage.setItem("usuario", JSON.stringify(usuario));

            // ADMINISTRADOR
            if (Number(usuario.ID_Rol) === 2) {
                localStorage.setItem("adminToken", token);
                localStorage.setItem(
                    "adminData",
                    JSON.stringify(usuario)
                );

                navigate("/admin");
            }

            // USUARIO NORMAL
            else {
                navigate("/catalogo");
            }
        } catch (err) {
            console.error("Error de login:", err);

            setError(
                err.response?.data?.message ||
                "Correo o contraseña incorrectos"
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* MARCA */}
                <div className="login-brand">
                    Buitrón Coffee
                </div>

                {/* TÍTULO */}
                <h1>Iniciar sesión</h1>

                <p className="login-subtitle">
                    Ingresa a tu cuenta
                </p>

                {/* ERROR */}
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={login}>

                    {/* CORREO */}
                    <div className="login-field">

                        <label htmlFor="correo">
                            Correo
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="14"
                                        rx="2"
                                    />
                                    <path d="M3 7l9 6 9-6" />
                                </svg>
                            </span>

                            <input
                                id="correo"
                                type="email"
                                placeholder="Correo electrónico"
                                value={Correo}
                                onChange={(e) =>
                                    setCorreo(e.target.value)
                                }
                                required
                            />

                        </div>
                    </div>

                    {/* CONTRASEÑA */}
                    <div className="login-field">

                        <label htmlFor="clave">
                            Contraseña
                        </label>

                        <div className="input-wrapper">

                            <span className="input-icon">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="5"
                                        y="10"
                                        width="14"
                                        height="10"
                                        rx="2"
                                    />
                                    <path d="M8 10V7a4 4 0 018 0v3" />
                                </svg>
                            </span>

                            <input
                                id="clave"
                                type={
                                    mostrarClave
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Contraseña"
                                value={Clave}
                                onChange={(e) =>
                                    setClave(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setMostrarClave(!mostrarClave)
                                }
                                aria-label={
                                    mostrarClave
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                            >
                                {mostrarClave ? (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="2.5"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10 5.5A10.8 10.8 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a15 15 0 01-3.1 3.7" />
                                        <path d="M6.6 6.8C4.2 8.5 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.5-.7" />
                                    </svg>
                                )}
                            </button>

                        </div>
                    </div>

                    {/* OLVIDASTE CONTRASEÑA */}
                    <div className="forgot-container">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/olvido-contrasena")
                            }
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    {/* INICIAR SESIÓN */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={cargando}
                    >
                        {cargando ? (
                            <>
                                <span className="login-spinner"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            "INICIAR SESIÓN"
                        )}
                    </button>

                </form>

                {/* REGISTRO */}
                <div className="register-section">

                    <span>
                        ¿No tienes una cuenta?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/registro")
                        }
                    >
                        Registrarse
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;
import { API_URL } from '../config.js';